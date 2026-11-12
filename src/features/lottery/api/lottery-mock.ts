// TEMP: in-memory backend stand-in. Delete this file once the real endpoints
// are connected; the operation files next to it are the only consumers.
import type {
  CreateLotteryInput,
  DrawLotteryInput,
  DrawLotteryResult,
  Lottery,
  LotteryMember,
  LotteryMode,
  LotteryOption,
} from '../types';
import {
  LOTTERY_MAX_OPTIONS,
  LOTTERY_MIN_OPTIONS,
  LOTTERY_WEIGHT_TOTAL,
} from '../config';

const MOCK_DELAY_MS = 500;
// Set to false and reload to preview the "no lottery yet" state.
const MOCK_SEED_PENDING = true;

// TODO: replace with the real members of the current group.
export const MOCK_GROUP_MEMBERS: LotteryMember[] = [
  { id: 'm1', name: 'علی رضایی' },
  { id: 'm2', name: 'مریم احمدی' },
  { id: 'm3', name: 'حسین کریمی' },
  { id: 'm4', name: 'سارا محمدی' },
  { id: 'm5', name: 'رضا موسوی' },
  { id: 'm6', name: 'نگار حسینی' },
];

interface SeedEntry {
  label: string;
  memberId: string | null;
}

const member = (id: string): SeedEntry => ({
  label: MOCK_GROUP_MEMBERS.find((item) => item.id === id)?.name ?? id,
  memberId: id,
});
const custom = (label: string): SeedEntry => ({ label, memberId: null });

function toOption(id: string, entry: SeedEntry, weight: number): LotteryOption {
  const found = entry.memberId
    ? MOCK_GROUP_MEMBERS.find((item) => item.id === entry.memberId)
    : undefined;
  return { id, label: entry.label, weight, member: found ?? null };
}

function buildOptions(
  prefix: string,
  entries: SeedEntry[],
  weights?: number[],
): LotteryOption[] {
  return entries.map((entry, index) =>
    toOption(
      `${prefix}-${index}`,
      entry,
      weights?.[index] ?? LOTTERY_WEIGHT_TOTAL / entries.length,
    ),
  );
}

const HOUR_MS = 3_600_000;

function seed(
  groupId: string,
  id: string,
  title: string,
  mode: LotteryMode,
  options: LotteryOption[],
  hoursAgo: number,
  winnerIndex?: number,
): Lottery {
  const createdAt = Date.now() - hoursAgo * HOUR_MS;
  const winner = winnerIndex === undefined ? undefined : options[winnerIndex];
  return {
    id,
    groupId,
    title,
    mode,
    options,
    createdAt: new Date(createdAt).toISOString(),
    result: winner
      ? {
          optionId: winner.id,
          drawnAt: new Date(createdAt + 5 * 60_000).toISOString(),
        }
      : null,
  };
}

function seedLotteries(groupId: string): Lottery[] {
  const dinner = [
    member('m1'),
    member('m2'),
    member('m3'),
    member('m4'),
    custom('دوست علی'),
  ];
  return [
    ...(MOCK_SEED_PENDING
      ? [
          seed(
            groupId,
            'seed-pending',
            'چه کسی شام حساب کنه؟',
            'equal',
            buildOptions('pending', dinner),
            1,
          ),
        ]
      : []),
    seed(
      groupId,
      'seed-1',
      'چه کسی شام حساب کنه؟',
      'equal',
      buildOptions('s1', dinner),
      26,
      3,
    ),
    seed(
      groupId,
      'seed-2',
      'کدوم رستوران بریم؟',
      'weighted',
      buildOptions(
        's2',
        [
          custom('رستوران کلین فود'),
          custom('کباب‌سرای شمال'),
          custom('پیتزا ایتالیا'),
          custom('سوشی ساکورا'),
        ],
        [40, 30, 20, 10],
      ),
      50,
      0,
    ),
    seed(
      groupId,
      'seed-3',
      'انتخاب فیلم شب',
      'equal',
      buildOptions('s3', [
        member('m1'),
        member('m2'),
        member('m3'),
        member('m4'),
        member('m5'),
        member('m6'),
      ]),
      74,
      4,
    ),
    seed(
      groupId,
      'seed-4',
      'نوبت آشپزی',
      'weighted',
      buildOptions(
        's4',
        [
          member('m1'),
          member('m2'),
          member('m3'),
          member('m4'),
          member('m5'),
        ],
        [30, 25, 20, 15, 10],
      ),
      122,
      1,
    ),
    seed(
      groupId,
      'seed-5',
      'مقصد سفر بعدی',
      'equal',
      buildOptions('s5', [custom('شمال'), custom('کیش'), custom('اصفهان')]),
      170,
      2,
    ),
  ];
}

const store = new Map<string, Lottery[]>();

function getGroupLotteries(groupId: string): Lottery[] {
  let lotteries = store.get(groupId);
  if (!lotteries) {
    lotteries = seedLotteries(groupId);
    store.set(groupId, lotteries);
  }
  return lotteries;
}

function wait(signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(resolve, MOCK_DELAY_MS);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

// Uniform float in [0, 1).
function randomFloat(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  const [value = 0] = buffer;
  return value / 2 ** 32;
}

function pickWinner(lottery: Lottery): LotteryOption | undefined {
  const weights = lottery.options.map((option) =>
    lottery.mode === 'equal' ? 1 : option.weight,
  );
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = randomFloat() * total;
  for (const [index, weight] of weights.entries()) {
    roll -= weight;
    if (roll < 0) return lottery.options[index];
  }
  return lottery.options.at(-1);
}

export async function mockGetLotteries(
  groupId: string,
  signal?: AbortSignal,
): Promise<Lottery[]> {
  await wait(signal);
  return [...getGroupLotteries(groupId)].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function mockCreateLottery(
  { groupId, title, mode, options }: CreateLotteryInput,
  signal?: AbortSignal,
): Promise<Lottery> {
  await wait(signal);
  if (
    options.length < LOTTERY_MIN_OPTIONS ||
    options.length > LOTTERY_MAX_OPTIONS
  ) {
    throw new Error('Invalid option count');
  }
  if (mode === 'weighted') {
    const total = options.reduce((sum, option) => sum + (option.weight ?? 0), 0);
    if (total !== LOTTERY_WEIGHT_TOTAL) throw new Error('Weights must sum to 100');
  }

  const lottery: Lottery = {
    id: `lottery-${crypto.randomUUID()}`,
    groupId,
    title: title.trim(),
    mode,
    options: options.map((option) =>
      toOption(
        `option-${crypto.randomUUID()}`,
        { label: option.label.trim(), memberId: option.memberId },
        mode === 'weighted'
          ? (option.weight ?? 0)
          : LOTTERY_WEIGHT_TOTAL / options.length,
      ),
    ),
    createdAt: new Date().toISOString(),
    result: null,
  };
  getGroupLotteries(groupId).push(lottery);
  return lottery;
}

// The server decides the winner; the client only animates toward it.
export async function mockDrawLottery(
  { groupId, lotteryId }: DrawLotteryInput,
  signal?: AbortSignal,
): Promise<DrawLotteryResult> {
  await wait(signal);
  const lotteries = getGroupLotteries(groupId);
  const index = lotteries.findIndex((item) => item.id === lotteryId);
  const lottery = lotteries[index];
  if (!lottery) throw new Error('Lottery not found');
  if (lottery.result) throw new Error('Lottery was already drawn');
  const winner = pickWinner(lottery);
  if (!winner) throw new Error('Lottery has no options');
  const result = { optionId: winner.id, drawnAt: new Date().toISOString() };
  lotteries[index] = { ...lottery, result };
  return { lotteryId, ...result };
}
