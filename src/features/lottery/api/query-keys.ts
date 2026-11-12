export const lotteryKeys = {
  all: ['lotteries'] as const,
  lists: () => [...lotteryKeys.all, 'list'] as const,
  list: (groupId: string) => [...lotteryKeys.lists(), groupId] as const,
};
