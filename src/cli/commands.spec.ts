import { beforeEach, describe, expect, it, vi } from 'vitest';

// Target import
import { getSdk, login, logout, rememberAccountAdminStatus } from './commands';

const h = vi.hoisted(() => ({
  sdkConstructor: vi.fn(),
  userGetCurrent: vi.fn(),
  signInWithPassword: vi.fn(),
  writeSession: vi.fn(),
  clearSession: vi.fn(),
  writeIsAdmin: vi.fn(),
  clearAccount: vi.fn(),
  resolveIdToken: vi.fn(),
  getCliConfig: vi.fn(),
}));

vi.mock('@package', () => ({
  AutoDroidSdk: vi.fn().mockImplementation((...args: unknown[]) => {
    h.sdkConstructor(...args);
    return { user: { getCurrent: h.userGetCurrent } };
  }),
}));

vi.mock('./auth/firebaseSession', () => ({
  signInWithPassword: h.signInWithPassword,
}));

vi.mock('./auth/sessionStore', () => ({
  writeSession: h.writeSession,
  clearSession: h.clearSession,
}));

vi.mock('./auth/accountStore', () => ({
  writeIsAdmin: h.writeIsAdmin,
  clearAccount: h.clearAccount,
}));

vi.mock('./context', () => ({
  resolveIdToken: h.resolveIdToken,
  getCliConfig: h.getCliConfig,
}));

const session = {
  idToken: 'id-token',
  refreshToken: 'refresh-token',
  expiresAt: 2_000_000_000_000,
};

describe('CLI: commands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.getCliConfig.mockReturnValue({
      endpoint: 'https://api.example.test/graphql',
      apiKey: 'web-api-key',
    });
    h.resolveIdToken.mockResolvedValue('id-token');
    h.userGetCurrent.mockResolvedValue({ id: 'user-1', is_admin: false });
  });

  describe('getSdk', () => {
    it("should construct the SDK once, with the CLI's endpoint and a fresh auth token getter, and reuse it", () => {
      const first = getSdk();
      const second = getSdk();

      expect(second).toBe(first);
      expect(h.sdkConstructor).toHaveBeenCalledOnce();
      expect(h.sdkConstructor).toHaveBeenCalledWith({
        baseUrl: 'https://api.example.test/graphql',
        getAuthToken: h.resolveIdToken,
      });
    });
  });

  describe('rememberAccountAdminStatus', () => {
    it.each([true, false])(
      'should save whether the signed-in user is an admin (%s)',
      async isAdmin => {
        h.userGetCurrent.mockResolvedValue({ id: 'user-1', is_admin: isAdmin });

        await rememberAccountAdminStatus();

        expect(h.writeIsAdmin).toHaveBeenCalledWith(isAdmin);
      },
    );

    it.each([true, false])(
      'should save the admin status of a user already at hand without asking the API (%s)',
      async isAdmin => {
        await rememberAccountAdminStatus({ is_admin: isAdmin });

        expect(h.userGetCurrent).not.toHaveBeenCalled();
        expect(h.writeIsAdmin).toHaveBeenCalledWith(isAdmin);
      },
    );

    it('should swallow a failure to ask the API and forget any earlier account, so an old admin flag never outlives its account', async () => {
      h.userGetCurrent.mockRejectedValue(new Error('network down'));

      await expect(rememberAccountAdminStatus()).resolves.toBeUndefined();

      expect(h.writeIsAdmin).not.toHaveBeenCalled();
      expect(h.clearAccount).toHaveBeenCalledOnce();
    });

    it('should swallow a failure to forget the earlier account too', async () => {
      h.userGetCurrent.mockRejectedValue(new Error('network down'));
      h.clearAccount.mockRejectedValueOnce(new Error('read-only disk'));

      await expect(rememberAccountAdminStatus()).resolves.toBeUndefined();
    });

    it('should swallow a failure to save the flag', async () => {
      h.writeIsAdmin.mockRejectedValue(new Error('disk full'));

      await expect(rememberAccountAdminStatus()).resolves.toBeUndefined();
    });
  });

  describe('login', () => {
    it('should store the session obtained from the credentials and remember the account status', async () => {
      h.signInWithPassword.mockResolvedValue(session);
      h.userGetCurrent.mockResolvedValue({ id: 'admin-1', is_admin: true });

      const result = await login({
        email: 'user@example.test',
        password: 'secret',
      });

      expect(h.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.test',
        password: 'secret',
        apiKey: 'web-api-key',
      });
      expect(h.writeSession).toHaveBeenCalledWith(session);
      expect(h.writeIsAdmin).toHaveBeenCalledWith(true);
      expect(result).toEqual({ expiresAt: session.expiresAt });
    });

    it('should still log in when the account status cannot be fetched', async () => {
      h.signInWithPassword.mockResolvedValue(session);
      h.userGetCurrent.mockRejectedValue(new Error('network down'));

      await expect(
        login({ email: 'user@example.test', password: 'secret' }),
      ).resolves.toEqual({ expiresAt: session.expiresAt });
    });
  });

  describe('logout', () => {
    it('should drop the stored session and the remembered account', async () => {
      await logout();

      expect(h.clearSession).toHaveBeenCalledOnce();
      expect(h.clearAccount).toHaveBeenCalledOnce();
    });
  });
});
