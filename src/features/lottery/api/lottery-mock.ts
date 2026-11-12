// TEMP: in-memory backend stand-in. Delete this file once the real endpoints
// are connected; the operation files next to it are the only consumers.
import type {
  CreateLotteryInput,
  DrawLotteryInput,
  DrawLotteryResult,
  Lottery,
  LotteryParticipant,
} from '../types';
import { LOTTERY_MAX_PARTICIPANTS, LOTTERY_MIN_PARTICIPANTS } from '../config';

const MOCK_DELAY_MS = 500;

// TODO: replace with the real members of the current group.
export const MOCK_GROUP_MEMBERS: LotteryParticipant[] = [
  { id: 'm1', name: 'علی' },
  { id: 'm2', name: 'سارا' },
  { id: 'm3', name: 'رضا' },
  { id: 'm4', name: 'مینا' },
  { id: 'm5', name: 'نیما' },
  { id: 'm6', name: 'الهام' },
  { id: 'm7', name: 'پویا' },
  { id: 'm8', name: 'مریم' },
];

const DAY_MS = 86_400_000;

function pickMembers(ids: string[]): LotteryParticipant[] {
  return MOCK_GROUP_MEMBERS.filter((member) => ids.includes(member.id));
}

function seedLotteries(groupId: string): Lottery[] {
  return [
    {
      id: 'seed-pending',
      groupId,
      title: 'کی ظرف‌ها رو بشوره؟',
      participants: pickMembers(['m1', 'm2', 'm3', 'm4']),
      createdAt: new Date(Date.now() - DAY_MS / 4).toISOString(),
      result: null,
    },
    {
      id: 'seed-drawn',
      groupId,
      title: 'راننده‌ی سفر شمال',
      participants: pickMembers(['m1', 'm3', 'm5', 'm7', 'm8']),
      createdAt: new Date(Date.now() - 2 * DAY_MS).toISOString(),
      result: {
        winnerId: 'm5',
        drawnAt: new Date(Date.now() - 2 * DAY_MS + 60_000).toISOString(),
      },
    },
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

function randomIndex(length: number): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  const [value = 0] = buffer;
  return value % length;
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
  { groupId, title, participantIds }: CreateLotteryInput,
  signal?: AbortSignal,
): Promise<Lottery> {
  await wait(signal);
  const participants = pickMembers([...new Set(participantIds)]);
  if (
    participants.length < LOTTERY_MIN_PARTICIPANTS ||
    participants.length > LOTTERY_MAX_PARTICIPANTS
  ) {
    throw new Error('Invalid participant count');
  }
  const lottery: Lottery = {
    id: `lottery-${crypto.randomUUID()}`,
    groupId,
    title: title.trim(),
    participants,
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
  const winner = lottery.participants[randomIndex(lottery.participants.length)];
  if (!winner) throw new Error('Lottery has no participants');
  const result = { winnerId: winner.id, drawnAt: new Date().toISOString() };
  lotteries[index] = { ...lottery, result };
  return { lotteryId, ...result };
}
