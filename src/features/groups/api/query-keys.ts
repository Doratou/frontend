const all = ['groups'] as const;

export const groupKeys = {
  all,
  lists: () => [...all, 'list'] as const,
  detail: (groupId: string) => [...all, 'detail', groupId] as const,
};
