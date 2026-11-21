const all = ['groups'] as const;

export const groupKeys = {
  all,
  lists: () => [...all, 'list'] as const,
  detail: (groupId: string) => [...all, 'detail', groupId] as const,
  members: (groupId: string) => [...all, 'detail', groupId, 'members'] as const,
  settings: (groupId: string) => [...all, 'detail', groupId, 'settings'] as const,
  friends: () => ['friends', 'list'] as const,
};
