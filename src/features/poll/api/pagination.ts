const PAGE_SIZE = 100;
// Safety net so a misbehaving server can never keep the loop running forever.
const MAX_PAGES = 20;

/** Reads every page of a paginated endpoint (limit is capped at 100 by the backend). */
export async function fetchAllPages<T>(
  fetchPage: (
    page: number,
    limit: number,
  ) => Promise<{ items: T[]; total: number }>,
): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await fetchPage(page, PAGE_SIZE);
    all.push(...result.items);
    if (result.items.length === 0 || all.length >= result.total) break;
  }
  return all;
}
