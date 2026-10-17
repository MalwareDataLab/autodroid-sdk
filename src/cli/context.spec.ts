import { beforeEach, describe, expect, it, vi } from 'vitest';

// Target import
import {
  getCliConfig,
  getWebUrl,
  isNotAuthenticatedError,
  NotAuthenticatedError,
  resolveIdToken,
} from './context';

const h = vi.hoisted(() => ({
  readSession: vi.fn(),
  writeSession: vi.fn(),
  getValidSession: vi.fn(),
}));

vi.mock('./auth/sessionStore', () => ({
  readSession: h.readSession,
  writeSession: h.writeSession,
}));

vi.mock('./auth/firebaseSession', () => ({
  getValidSession: h.getValidSession,
}));

const session = {
  idToken: 'id-token',
  refreshToken: 'refresh-token',
  expiresAt: 2_000_000_000_000,
};

describe('CLI: context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('AUTODROID_CLI_API_URL', 'https://api.example.test/graphql');
    vi.stubEnv('AUTODROID_CLI_FIREBASE_WEB_API_KEY', 'web-api-key');
  });

  describe('getCliConfig', () => {
    it('should take the endpoint and the firebase key from the environment over the defaults', () => {
      expect(getCliConfig()).toEqual({
        endpoint: 'https://api.example.test/graphql',
        apiKey: 'web-api-key',
      });
    });

    it('should default to the production API and its public Firebase web key when neither is set', () => {
      vi.stubEnv('AUTODROID_CLI_API_URL', undefined);
      vi.stubEnv('AUTODROID_CLI_FIREBASE_WEB_API_KEY', undefined);

      expect(getCliConfig()).toEqual({
        endpoint: 'https://api-autodroid.laviola.dev/graphql',
        apiKey: 'AIzaSyBt-FkToQznrkXvSHYF2fM3G4XajCsgihs',
      });
    });

    it('should treat an empty value as unset', () => {
      vi.stubEnv('AUTODROID_CLI_API_URL', '');
      vi.stubEnv('AUTODROID_CLI_FIREBASE_WEB_API_KEY', '');

      expect(getCliConfig()).toEqual({
        endpoint: 'https://api-autodroid.laviola.dev/graphql',
        apiKey: 'AIzaSyBt-FkToQznrkXvSHYF2fM3G4XajCsgihs',
      });
    });
  });

  describe('getWebUrl', () => {
    it('should take the web url from the environment over the default', () => {
      vi.stubEnv('AUTODROID_CLI_WEB_URL', 'https://app.example.test');

      expect(getWebUrl()).toBe('https://app.example.test');
    });

    it('should default to the production web app when it is not set', () => {
      vi.stubEnv('AUTODROID_CLI_WEB_URL', undefined);

      expect(getWebUrl()).toBe('https://autodroid.laviola.dev');
    });
  });

  describe('isNotAuthenticatedError', () => {
    it('should recognize a direct NotAuthenticatedError', () => {
      expect(isNotAuthenticatedError(new NotAuthenticatedError('x'))).toBe(
        true,
      );
    });

    it("should recognize the SDK's Apollo Client ApolloError wrapper via its networkError", () => {
      const apolloWrappedError = Object.assign(
        new Error('Not authenticated.'),
        {
          networkError: new NotAuthenticatedError('x'),
        },
      );

      expect(isNotAuthenticatedError(apolloWrappedError)).toBe(true);
    });

    it('should reject an unrelated error', () => {
      expect(isNotAuthenticatedError(new Error('some other error'))).toBe(
        false,
      );
    });

    it('should reject non-error values without throwing', () => {
      expect(isNotAuthenticatedError(null)).toBe(false);
      expect(isNotAuthenticatedError(undefined)).toBe(false);
      expect(isNotAuthenticatedError('a string')).toBe(false);
    });
  });

  describe('resolveIdToken', () => {
    it('should refuse when no session was stored', async () => {
      h.readSession.mockResolvedValue(null);

      await expect(resolveIdToken()).rejects.toThrowError(
        'Not authenticated. Run `autodroid login` first.',
      );
      await expect(resolveIdToken()).rejects.toBeInstanceOf(
        NotAuthenticatedError,
      );
    });

    it('should return the stored token while it is still valid', async () => {
      h.readSession.mockResolvedValue(session);
      h.getValidSession.mockResolvedValue(session);

      await expect(resolveIdToken()).resolves.toBe('id-token');
      expect(h.writeSession).not.toHaveBeenCalled();
    });

    it.each([
      ['TOKEN_EXPIRED', true],
      ['INVALID_REFRESH_TOKEN', true],
      ['INTERNAL', false],
    ])(
      'should tell whether a refused refresh (%s) needs a new sign-in',
      async (providerMessage, needsSignIn) => {
        const { getValidSession } = await vi.importActual<
          typeof import('./auth/firebaseSession')
        >('./auth/firebaseSession');
        h.readSession.mockResolvedValue({ ...session, expiresAt: 0 });
        h.getValidSession.mockImplementation(getValidSession);
        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ error: { message: providerMessage } }),
          }),
        );

        const error = await resolveIdToken().catch(
          (resolveError: unknown) => resolveError,
        );
        vi.unstubAllGlobals();

        expect(error).toHaveProperty(
          'message',
          `Firebase token refresh failed. ${providerMessage}`,
        );
        expect(isNotAuthenticatedError(error)).toBe(needsSignIn);
        expect(h.writeSession).not.toHaveBeenCalled();
      },
    );

    it('should persist the session when it had to be renewed', async () => {
      const renewed = { ...session, idToken: 'renewed-token' };
      h.readSession.mockResolvedValue(session);
      h.getValidSession.mockResolvedValue(renewed);

      await expect(resolveIdToken()).resolves.toBe('renewed-token');
      expect(h.writeSession).toHaveBeenCalledWith(renewed);
    });
  });
});
