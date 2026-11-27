// Paths are relative to VITE_API_BASE_URL, which already ends with `/api/v1`
// (the auth requests use '/auth/login' the same way), so no prefix is added.
export const drawsPath = (groupId: string) =>
  `/groups/${encodeURIComponent(groupId)}/draws`;

export const drawPath = (groupId: string, lotteryId: string) =>
  `${drawsPath(groupId)}/${encodeURIComponent(lotteryId)}`;

export const runDrawPath = (groupId: string, lotteryId: string) =>
  `${drawPath(groupId, lotteryId)}/run`;
