import { LOTTERY_WEIGHT_TOTAL } from './config';
import { toPersianNumber } from './format';
import type {
  Lottery,
  LotteryHistoryEntry,
  LotteryMember,
  LotteryOption,
  LotterySummary,
  LotteryWinner,
} from './types';

// Chance of an option in percent. The server's total is always 100, so this
// equals the weight, but dividing keeps it correct for any total.
export function getOptionChance(
  lottery: Pick<Lottery, 'totalWeight'>,
  option: LotteryOption,
): number {
  return lottery.totalWeight > 0
    ? (option.weight / lottery.totalWeight) * 100
    : 0;
}

export function findOption(
  lottery: Pick<Lottery, 'options'>,
  optionId: string | null,
): LotteryOption | null {
  return lottery.options.find((option) => option.id === optionId) ?? null;
}

function resolveUser(userId: string, members: LotteryMember[]): LotteryWinner {
  const member = members.find((item) => item.id === userId);
  // A user who is no longer in the group has no entry in the members list.
  return member
    ? { label: member.name, member }
    : { label: `کاربر ${toPersianNumber(Number(userId))}`, member: null };
}

// USER candidates only carry a user ID, so names and avatars come from the
// group's members. TEXT candidates are left untouched.
export function resolveOptionProfiles(
  lottery: Lottery,
  members: LotteryMember[],
): Lottery {
  return {
    ...lottery,
    options: lottery.options.map((option) =>
      option.userId === null
        ? option
        : { ...option, ...resolveUser(option.userId, members) },
    ),
  };
}

export function toHistoryEntries(
  summaries: LotterySummary[],
  members: LotteryMember[],
): LotteryHistoryEntry[] {
  return summaries.flatMap((summary) => {
    const { result } = summary;
    if (!result) return [];
    return [
      {
        id: summary.id,
        title: summary.title,
        mode: summary.mode,
        optionCount: summary.optionCount,
        drawnAt: result.drawnAt,
        winner:
          result.kind === 'user'
            ? resolveUser(result.value, members)
            : { label: result.value, member: null },
      },
    ];
  });
}

// IDs of every user whose name or avatar the page may need to show.
export function collectProfileIds(
  lottery: Lottery | null,
  summaries: LotterySummary[],
  members: LotteryMember[],
): string[] {
  const ids = new Set<string>();
  for (const option of lottery?.options ?? []) {
    if (option.userId) ids.add(option.userId);
  }
  for (const summary of summaries) {
    if (summary.result?.kind === 'user') ids.add(summary.result.value);
  }
  for (const member of members) ids.add(member.id);
  return [...ids];
}

// Members come with a name only; the public profile adds the current avatar.
export function mergeProfiles(
  members: LotteryMember[],
  profiles: LotteryMember[],
): LotteryMember[] {
  const byId = new Map(
    profiles.map((profile) => [profile.id, profile] as const),
  );
  return members.map((member) => {
    const profile = byId.get(member.id);
    return profile
      ? {
          ...member,
          name: profile.name || member.name,
          avatarUrl: profile.avatarUrl,
        }
      : member;
  });
}

// Everybody a draw can refer to: current members plus users known only through
// their profile (for example somebody who left the group after being a winner).
export function buildDirectory(
  members: LotteryMember[],
  profiles: LotteryMember[],
): LotteryMember[] {
  const known = new Set(members.map((member) => member.id));
  return [...members, ...profiles.filter((profile) => !known.has(profile.id))];
}

// A group has at most one draft, and a draft from the server that differs from
// the pinned lottery is newer than it, so it takes over the stage.
export function pickStageLottery(
  pinned: Lottery | null,
  active: Lottery | null,
): Lottery | null {
  if (!pinned) return active;
  if (!active || active.id === pinned.id) return pinned;
  return active.createdAt > pinned.createdAt ? active : pinned;
}

// In a weighted lottery the last option is not typed in: it takes whatever the
// other options leave of the 100%. `weights` are the values in list order.
export function getLastWeight(weights: number[]): number {
  const others = weights
    .slice(0, -1)
    .reduce((sum, weight) => sum + (Number.isFinite(weight) ? weight : 0), 0);
  // Rounded to hundredths so values such as 0.1 + 0.2 do not leave a remainder.
  return Math.max(0, Math.round((LOTTERY_WEIGHT_TOTAL - others) * 100) / 100);
}

// Splits 100 into `count` whole numbers that add up to exactly 100.
export function splitEvenly(count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(LOTTERY_WEIGHT_TOTAL / count);
  const remainder = LOTTERY_WEIGHT_TOTAL - base * count;
  return Array.from(
    { length: count },
    (_, index) => base + (index < remainder ? 1 : 0),
  );
}

export function withEvenWeights<T extends { weight: number }>(items: T[]): T[] {
  const weights = splitEvenly(items.length);
  return items.map((item, index) => ({ ...item, weight: weights[index] ?? 0 }));
}
