export const lotteryKeys = {
  all: ['lotteries'] as const,
  // Everything that belongs to one group; invalidate this to refresh it all.
  group: (groupId: string) => [...lotteryKeys.all, groupId] as const,
  active: (groupId: string) => [...lotteryKeys.group(groupId), 'active'] as const,
  detail: (groupId: string, lotteryId: string) =>
    [...lotteryKeys.group(groupId), 'detail', lotteryId] as const,
  history: (groupId: string) =>
    [...lotteryKeys.group(groupId), 'history'] as const,
};
