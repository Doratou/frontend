import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import { createServer } from 'vite';

// Exercise the real adapter and interceptors without sending credentials over a network.
process.env.VITE_AUTH_API_ENABLED = 'true';
process.env.VITE_API_BASE_URL = 'https://api.example.invalid/api/v1';
const server = await createServer({
  configFile: false,
  root: fileURLToPath(new URL('..', import.meta.url)),
  resolve: {
    alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
  },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null },
  appType: 'custom',
});
globalThis.window = { location: { origin: 'http://localhost:3001' } };

try {
  const { authApi, installAuthHeaders } = await server.ssrLoadModule(
    '/src/features/auth/api/auth-api.ts',
  );
  const { useAuthStore } = await server.ssrLoadModule(
    '/src/features/auth/stores/auth-store.ts',
  );
  const { apiClient } = await server.ssrLoadModule('/src/lib/api/client.ts');
  const pair = (suffix = '1') => ({
    access_token: `sample-access-${suffix}`,
    refresh_token: `sample-refresh-${suffix}`,
    access_token_expires_at: new Date(Date.now() + 3_600_000).toISOString(),
    refresh_token_expires_at: new Date(Date.now() + 86_400_000).toISOString(),
  });
  const signedIn = () => ({
    ...pair(),
    user: {
      id: 1,
      name: null,
      email: 'sample@example.com',
      phone: null,
      system_role: 'user',
    },
  });
  const calls = [];
  let respond = () => ({ message: 'ok' });
  apiClient.defaults.adapter = async (config) => {
    calls.push({
      path: config.url,
      method: config.method,
      body: config.data ? JSON.parse(config.data) : undefined,
      headers: config.headers,
    });
    const data = await respond(config);
    return { data: { success: true, data }, status: 200, headers: {}, config };
  };
  const reject =
    (status, headers = {}) =>
    (config) => {
      throw new axios.AxiosError('sample failure', undefined, config, null, {
        data: {},
        status,
        headers,
        config,
      });
    };
  const last = () => calls.at(-1);
  const uninstall = installAuthHeaders();

  respond = signedIn;
  const user = await authApi.signIn({
    identifier: 'sample@example.com',
    password: '123456',
  });
  assert.deepEqual(user, {
    id: '1',
    displayName: 'sample@example.com',
    systemRole: 'user',
  });
  assert.equal(last().path, '/auth/login');
  assert.deepEqual(last().body, {
    identifier: 'sample@example.com',
    password: '123456',
  });
  assert.equal(last().headers.get('Authorization'), undefined);
  assert.equal(useAuthStore.getState().tokens.accessToken, 'sample-access-1');

  respond = () => ({ expires_in_seconds: 180, message: 'sent' });
  const challenge = await authApi.requestCode({
    identifier: '09123456789',
    purpose: 'signup',
  });
  assert.equal(challenge.codeLength, 5);
  assert.ok(challenge.expiresAt > Date.now() + 179_000);
  assert.deepEqual(last().body, { identifier: '09123456789' });
  assert.equal(last().path, '/auth/otp/send');
  assert.equal(last().headers.get('Authorization'), undefined);
  respond = () => ({ status: 'verified', message: 'ok' });
  await authApi.verifyCode({ identifier: challenge.identifier, code: '12345' });
  assert.equal(last().path, '/auth/otp/verify');
  assert.deepEqual(last().body, {
    identifier: challenge.identifier,
    code: '12345',
  });

  respond = signedIn;
  await authApi.signUp({ identifier: '09123456789', password: '123456' });
  assert.equal(last().path, '/auth/register');
  assert.deepEqual(last().body, { phone: '09123456789', password: '123456' });
  await authApi.signUp({
    identifier: 'sample@example.com',
    password: '123456',
    name: 'Sample',
  });
  assert.deepEqual(last().body, {
    email: 'sample@example.com',
    password: '123456',
    name: 'Sample',
  });
  await authApi.signInWithOtp({ identifier: 'sample@example.com' });
  assert.equal(last().path, '/auth/login/otp');
  assert.deepEqual(last().body, { identifier: 'sample@example.com' });

  respond = () => ({ message: 'ok' });
  await authApi.resetPassword({
    identifier: 'sample@example.com',
    password: '654321',
    captcha: { id: 'sample', code: 'abcd' },
  });
  assert.equal(last().path, '/auth/password/reset');
  assert.deepEqual(last().body, {
    identifier: 'sample@example.com',
    new_password: '654321',
  });
  assert.equal(last().headers.get('X-Captcha-ID'), 'sample');
  assert.equal(last().headers.get('X-Captcha-Code'), 'abcd');
  await authApi.changePassword({
    oldPassword: '123456',
    newPassword: '654321',
  });
  assert.equal(last().path, '/auth/password/change');
  assert.deepEqual(last().body, {
    old_password: '123456',
    new_password: '654321',
  });
  assert.equal(last().headers.get('Authorization'), 'Bearer sample-access-1');
  await apiClient.get('https://other.example.invalid/api/v1/private', {
    headers: { Authorization: 'remove-me' },
  });
  assert.equal(last().headers.get('Authorization'), undefined);
  await apiClient.get('https://api.example.invalid/api/v10/private', {
    headers: { Authorization: 'remove-me' },
  });
  assert.equal(last().headers.get('Authorization'), undefined);

  const state = useAuthStore.getState();
  state.setTokens({ ...state.tokens, accessTokenExpiresAt: Date.now() });
  respond = (config) =>
    config.url === '/auth/refresh' ? pair('2') : { message: 'ok' };
  const before = calls.length;
  await Promise.all([
    authApi.changePassword({ oldPassword: 'a', newPassword: '654321' }),
    authApi.changePassword({ oldPassword: 'b', newPassword: '654321' }),
  ]);
  const refreshCalls = calls
    .slice(before)
    .filter((call) => call.path === '/auth/refresh');
  assert.equal(refreshCalls.length, 1);
  assert.deepEqual(refreshCalls[0].body, { refresh_token: 'sample-refresh-1' });
  assert.equal(refreshCalls[0].headers.get('Authorization'), undefined);
  assert.equal(last().headers.get('Authorization'), 'Bearer sample-access-2');
  assert.equal(useAuthStore.getState().tokens.refreshToken, 'sample-refresh-2');

  respond = reject(401);
  await assert.rejects(
    authApi.verifyCode({ identifier: 'sample@example.com', code: '00000' }),
    (error) => Boolean(error.fields.code),
  );
  await assert.rejects(
    authApi.changePassword({ oldPassword: 'bad', newPassword: '654321' }),
  );
  assert.ok(
    useAuthStore.getState().user,
    'Wrong old password must not clear the session',
  );
  respond = reject(404);
  await assert.rejects(
    authApi.verifyCode({ identifier: 'sample@example.com', code: '12345' }),
    (error) => Boolean(error.fields.code),
  );
  respond = reject(429, { 'retry-after': '20' });
  await assert.rejects(
    authApi.requestCode({ identifier: 'sample@example.com', purpose: 'login' }),
    (error) => error.retryAt > Date.now() + 19_000,
  );

  respond = () => ({ ...signedIn(), access_token: '' });
  useAuthStore.getState().clearSession();
  await assert.rejects(
    authApi.signIn({ identifier: 'sample@example.com', password: '123456' }),
  );
  assert.equal(useAuthStore.getState().user, null);
  respond = signedIn;
  await authApi.signIn({
    identifier: 'sample@example.com',
    password: '123456',
  });
  let finishRefresh;
  respond = () =>
    new Promise((resolve) => {
      finishRefresh = resolve;
    });
  const stale = authApi.refreshSession();
  await new Promise((resolve) => setImmediate(resolve));
  useAuthStore.getState().clearSession();
  finishRefresh(pair('stale'));
  await assert.rejects(stale, axios.isCancel);
  assert.equal(useAuthStore.getState().tokens, null);

  respond = signedIn;
  await authApi.signIn({
    identifier: 'sample@example.com',
    password: '123456',
  });
  respond = reject(401);
  await assert.rejects(authApi.refreshSession());
  assert.equal(useAuthStore.getState().user, null);
  respond = signedIn;
  await authApi.signIn({
    identifier: 'sample@example.com',
    password: '123456',
  });
  respond = reject(503);
  await assert.rejects(authApi.refreshSession());
  assert.ok(useAuthStore.getState().tokens);
  respond = () => ({ message: 'logged out' });
  await authApi.logout();
  assert.equal(last().path, '/auth/logout');
  assert.equal(last().method, 'post');
  assert.equal(last().body, undefined);
  assert.equal(last().headers.get('Authorization'), 'Bearer sample-access-1');
  assert.equal(useAuthStore.getState().tokens, null);
  uninstall();
  console.log(
    'Auth contracts, response validation, errors, Bearer boundaries and token rotation passed.',
  );
} finally {
  delete globalThis.window;
  await server.close();
}
