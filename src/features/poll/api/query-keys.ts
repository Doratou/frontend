export const pollKeys = {
  all: ['polls'] as const,
  lists: () => [...pollKeys.all, 'list'] as const,
  list: (groupId: string) => [...pollKeys.lists(), groupId] as const,
  detail: (pollId: string) => [...pollKeys.all, 'detail', pollId] as const,
};
