import { z } from 'zod';
import { dateToApi, fromJalali } from '@/lib/persian-date';

export const holidayRefreshMs = 24 * 60 * 60 * 1000;
const yearSchema = z.number().int().min(1347).max(3000);
const monthSchema = z.number().int().min(1).max(12);
const dateFields = {
  year_sh: yearSchema,
  month_sh: monthSchema,
  day_sh: z.number().int().min(1).max(31),
  date_gregorian: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
};
const eventFields = {
  slug: z.string().min(1),
  title_fa: z.string().trim().min(1),
  category: z.string().min(1),
  is_holiday: z.boolean(),
};
const yearsResponse = z.object({
  year: yearSchema,
  data: z.array(
    z.object({
      ...dateFields,
      estimate: z.boolean(),
      events: z.array(z.object(eventFields)),
    }),
  ),
});
const monthResponse = z.object({
  year: yearSchema,
  data: z.array(
    z.object({
      ...dateFields,
      ...eventFields,
      estimate: z.boolean().optional(),
    }),
  ),
});
const itemSchema = z.object({
  id: z.string().min(1),
  date: dateFields.date_gregorian,
  year: yearSchema,
  month: monthSchema,
  day: dateFields.day_sh,
  title: z.string().min(1),
  category: z.string(),
  estimate: z.boolean().nullable(),
  kind: z.enum(['calendar-holiday', 'occasion', 'government-closure']),
  source: z.string().min(1),
});
export type HolidayItem = z.infer<typeof itemSchema>;
export interface HolidayProvider {
  id: string;
  loadYear: (year: number) => Promise<HolidayItem[]>;
  loadMonth: (year: number, month: number) => Promise<HolidayItem[]>;
}
const cacheSchema = z.object({
  fetchedAt: z.number().nonnegative(),
  expiresAt: z.number().nonnegative(),
  items: z.array(itemSchema),
});
type Cached = z.infer<typeof cacheSchema>;
export type HolidayResult = Cached & { stale: boolean };
type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'length' | 'key'>;

function normalize(
  row: z.infer<typeof monthResponse>['data'][number],
  year: number,
  month?: number,
): HolidayItem {
  const date = fromJalali(row.year_sh, row.month_sh, row.day_sh);
  if (
    row.year_sh !== year ||
    (month !== undefined && row.month_sh !== month) ||
    !date ||
    dateToApi(date) !== row.date_gregorian
  )
    throw new Error('Holiday response contains an inconsistent date');
  return {
    id: row.slug,
    date: row.date_gregorian,
    year,
    month: row.month_sh,
    day: row.day_sh,
    title: row.title_fa,
    category: row.category,
    estimate: row.estimate ?? null,
    kind: row.is_holiday ? 'calendar-holiday' : 'occasion',
    source: 'persian-calendar.com',
  };
}

async function request(
  path: string,
  params: Record<string, number>,
): Promise<unknown> {
  const url = new URL(`https://www.persian-calendar.com/api/${path}`);
  for (const [key, value] of Object.entries(params))
    url.searchParams.set(key, String(value));
  const response = await fetch(url, {
    credentials: 'omit',
    cache: 'no-cache',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok)
    throw new Error(`Holiday provider returned ${response.status}`);
  return response.json();
}

export const persianCalendarProvider: HolidayProvider = {
  id: 'persian-calendar.com',
  async loadYear(year) {
    const response = yearsResponse.parse(
      await request('holidays', { year: yearSchema.parse(year) }),
    );
    if (response.year !== year)
      throw new Error('Holiday response year does not match');
    return response.data.flatMap((day) =>
      day.events.map((event) => normalize({ ...day, ...event }, year)),
    );
  },
  async loadMonth(year, month) {
    const response = monthResponse.parse(
      await request('events', {
        year: yearSchema.parse(year),
        month_sh: monthSchema.parse(month),
      }),
    );
    if (response.year !== year)
      throw new Error('Event response year does not match');
    return response.data.map((event) => normalize(event, year, month));
  },
};

function browserStorage(): StorageLike | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export class HolidayService {
  private cache = new Map<string, Cached>();
  private requests = new Map<string, Promise<HolidayResult>>();
  private provider: HolidayProvider;
  private storage: StorageLike | undefined;
  constructor(
    provider: HolidayProvider = persianCalendarProvider,
    storage: StorageLike | undefined = browserStorage(),
  ) {
    this.provider = provider;
    this.storage = storage;
  }
  private prefix() {
    return `dorato-holidays:v1:${this.provider.id}:`;
  }
  private read(key: string) {
    const memory = this.cache.get(key);
    if (memory) return memory;
    try {
      const raw = this.storage?.getItem(key);
      if (!raw) return undefined;
      const result = cacheSchema.safeParse(JSON.parse(raw));
      if (result.success) {
        this.cache.set(key, result.data);
        return result.data;
      }
    } catch {
      /* Cached public data is optional when storage is unavailable or corrupt. */
    }
    return undefined;
  }
  private save(key: string, entry: Cached) {
    this.cache.set(key, entry);
    try {
      this.storage?.setItem(key, JSON.stringify(entry));
    } catch {
      /* Memory caching still works when browser storage is full. */
    }
  }
  private load(
    suffix: string,
    fetcher: () => Promise<HolidayItem[]>,
  ): Promise<HolidayResult> {
    const key = `${this.prefix()}${suffix}`;
    const cached = this.read(key);
    if (cached && cached.expiresAt > Date.now())
      return Promise.resolve({ ...cached, stale: false });
    const pending = this.requests.get(key);
    if (pending) return pending;
    const task = fetcher()
      .then((items) => {
        const fetchedAt = Date.now();
        const entry = {
          items: z.array(itemSchema).parse(items),
          fetchedAt,
          expiresAt: fetchedAt + holidayRefreshMs,
        };
        this.save(key, entry);
        return { ...entry, stale: false };
      })
      .catch((error: unknown) => {
        if (cached) return { ...cached, stale: true };
        throw error;
      })
      .finally(() => this.requests.delete(key));
    this.requests.set(key, task);
    return task;
  }
  getYear(year: number) {
    yearSchema.parse(year);
    return this.load(`${year}:holidays`, () => this.provider.loadYear(year));
  }
  getMonth(year: number, month: number) {
    yearSchema.parse(year);
    monthSchema.parse(month);
    return this.load(`${year}:events:${month}`, () =>
      this.provider.loadMonth(year, month),
    );
  }
  invalidate(year?: number) {
    const prefix = `${this.prefix()}${year === undefined ? '' : `${year}:`}`;
    const keys = new Set(this.cache.keys());
    try {
      for (let index = 0; index < (this.storage?.length ?? 0); index++) {
        const key = this.storage?.key(index);
        if (key?.startsWith(prefix)) keys.add(key);
      }
    } catch {
      /* In-memory entries can still be invalidated. */
    }
    for (const key of keys) {
      if (!key.startsWith(prefix)) continue;
      const entry = this.read(key);
      if (entry) this.save(key, { ...entry, expiresAt: 0 });
    }
  }
}

export const holidayService = new HolidayService();

export function mergeHolidayItems(items: HolidayItem[]) {
  const merged = new Map<string, HolidayItem>();
  for (const item of items) {
    const key = `${item.date}:${item.id}`;
    const previous = merged.get(key);
    if (!previous || (previous.estimate === null && item.estimate !== null))
      merged.set(key, item);
  }
  return [...merged.values()];
}
