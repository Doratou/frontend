export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
  wallet: () => [...profileKeys.all, 'wallet'] as const,
};
