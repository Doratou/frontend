const all = ['groups'] as const;

export const groupKeys = {
  all,
  lists: () => [...all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...all, 'list', params] as const,
  detail: (groupId: string) => [...all, 'detail', groupId] as const,
  invitations: () => [...all, 'invitations'] as const,
  members: (groupId: string) => [...all, 'detail', groupId, 'members'] as const,
  settings: (groupId: string) =>
    [...all, 'detail', groupId, 'settings'] as const,
  inviteLinks: (groupId: string) =>
    [...all, 'detail', groupId, 'invite-links'] as const,
  coverBlob: (attachmentId: string) =>
    [...all, 'cover-blob', attachmentId] as const,
  friends: () => ['friends', 'list'] as const,
};
