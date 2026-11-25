const all = ['groups'] as const;

export const groupKeys = {
  all,
  lists: () => [...all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...all, 'list', params] as const,
  detail: (groupId: string) => [...all, 'detail', groupId] as const,
  invitations: () => [...all, 'invitations'] as const,
  friends: () => [...all, 'friends'] as const,
};
