export const authViews = [
  { path: '/login', view: 'password-login' },
  { path: '/login/code', view: 'code-login' },
  { path: '/login/verify', view: 'verify-login' },
  { path: '/signup', view: 'signup' },
  { path: '/signup/verify', view: 'verify-signup' },
  { path: '/forgot-password', view: 'request-reset' },
  { path: '/forgot-password/verify', view: 'verify-reset' },
  { path: '/reset-password', view: 'reset-password' },
  { path: '/change-password', view: 'change-password' },
] as const;

export type AuthView = (typeof authViews)[number]['view'];
