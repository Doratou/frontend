export const checklistKeys = {
  all: ['checklist'] as const,
  // Everything cached for one group; invalidate this after any checklist write.
  group: (groupId: string) => [...checklistKeys.all, groupId] as const,
  detail: (groupId: string) =>
    [...checklistKeys.group(groupId), 'detail'] as const,
};
