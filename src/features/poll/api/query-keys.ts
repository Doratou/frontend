export const pollKeys = {
  all: ['polls'] as const,
  // Everything cached for one group; invalidate this after any poll write.
  group: (groupId: string) => [...pollKeys.all, groupId] as const,
  list: (groupId: string) => [...pollKeys.group(groupId), 'list'] as const,
  voters: (groupId: string, pollId: string) =>
    [...pollKeys.group(groupId), 'voters', pollId] as const,
};
