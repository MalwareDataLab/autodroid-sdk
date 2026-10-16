import { beforeEach, describe, expect, it, vi } from 'vitest';

// Context import
import { NotAuthenticatedError } from '../context';

// Target import
import {
  decodeTokenExpiration,
  FirebaseAuthenticationError,
  getValidSession,
  refreshSession,
  signInWithCustomToken,
  signInWithPassword,
} from './firebaseSession';

const encodeToken = (payload: Record<string, unknown>) =>
  `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;

describe('CLI: firebaseSession', () => {
  const apiKey = 'web-api-key';

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('decodeTokenExpiration', () => {
    it('should read the expiration claim in milliseconds', () => {
      const token = encodeToken({ exp: 1700000000 });

      expect(decodeTokenExpiration(token)).toBe(1700000000 * 1000);
    });

    it('should reject a token without three segments', () => {
      expect(() => decodeTokenExpiration('not-a-jwt')).toThrowError(
        'Malformed Firebase token.',
      );
    });

    it('should reject a token whose payload carries no expiration', () => {
      expect(() => decodeTokenExpiration(encodeToken({}))).toThrowError(
        'Firebase token has no expiration claim.',
      );
    });

    it('should reject a token whose payload is not readable', () => {
      expect(() => decodeTokenExpiration('header.@@@.signature')).toThrowError(
        'Malformed Firebase token.',
      );
    });
  });

  describe('signInWithPassword', () => {
    it('should exchange the credentials for a session', async () => {
      const idToken = encodeToken({ exp: 1700000000 });
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ idToken, refreshToken: 'refresh-1' }),
      } as Response);

      const session = await signInWithPassword({
        email: 'user@example.test',
        password: 'secret',
        apiKey,
      });

      expect(session).toEqual({
        idToken,
        refreshToken: 'refresh-1',
        expiresAt: 1700000000 * 1000,
      });
      expect(fetch).toHaveBeenCalledWith(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'user@example.test',
            password: 'secret',
            returnSecureToken: true,
          }),
        }),
      );
    });

    it('should surface the provider message when the credentials are rejected', async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ error: { message: 'INVALID_PASSWORD' } }),
      } as Response);

      await expect(
        signInWithPassword({
          email: 'user@example.test',
          password: 'wrong',
          apiKey,
        }),
      ).rejects.toThrowError('Firebase sign in failed. INVALID_PASSWORD');
    });

    it('should report the HTTP status instead of crashing on a non-JSON error response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => {
          throw new SyntaxError("Unexpected token '<'");
        },
      } as unknown as Response);

      await expect(
        signInWithPassword({
          email: 'user@example.test',
          password: 'secret',
          apiKey,
        }),
      ).rejects.toThrowError(/status 503/);
    });
  });

  describe('signInWithCustomToken', () => {
    it('should exchange the custom token for a session', async () => {
      const idToken = encodeToken({ exp: 1700000000 });
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ idToken, refreshToken: 'refresh-1' }),
      } as Response);

      const session = await signInWithCustomToken({
        customToken: 'custom-token',
        apiKey,
      });

      expect(session).toEqual({
        idToken,
        refreshToken: 'refresh-1',
        expiresAt: 1700000000 * 1000,
      });
      expect(fetch).toHaveBeenCalledWith(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: 'custom-token',
            returnSecureToken: true,
          }),
        }),
      );
    });

    it('should surface the provider message when the custom token is rejected', async () => {
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ error: { message: 'INVALID_CUSTOM_TOKEN' } }),
      } as Response);

      await expect(
        signInWithCustomToken({ customToken: 'expired', apiKey }),
      ).rejects.toThrowError(
        'Firebase custom token sign in failed. INVALID_CUSTOM_TOKEN',
      );
      await expect(
        signInWithCustomToken({ customToken: 'expired', apiKey }),
      ).rejects.toBeInstanceOf(FirebaseAuthenticationError);
    });

    it('should report the HTTP status instead of crashing on a non-JSON error response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => {
          throw new SyntaxError("Unexpected token '<'");
        },
      } as unknown as Response);

      await expect(
        signInWithCustomToken({ customToken: 'custom-token', apiKey }),
      ).rejects.toThrowError(/status 503/);
    });
  });

  describe('refreshSession', () => {
    it('should exchange the refresh token for a new session', async () => {
      const idToken = encodeToken({ exp: 1800000000 });
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ id_token: idToken, refresh_token: 'refresh-2' }),
      } as Response);

      const session = await refreshSession({
        refreshToken: 'refresh-1',
        apiKey,
      });

      expect(session).toEqual({
        idToken,
        refreshToken: 'refresh-2',
        expiresAt: 1800000000 * 1000,
      });
      expect(fetch).toHaveBeenCalledWith(
        `https://securetoken.googleapis.com/v1/token?key=${apiKey}`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'grant_type=refresh_token&refresh_token=refresh-1',
        }),
      );
    });

    it.each([
      'TOKEN_EXPIRED',
      'INVALID_REFRESH_TOKEN',
      'USER_DISABLED',
      'USER_NOT_FOUND',
      'MISSING_REFRESH_TOKEN',
      'TOKEN_EXPIRED : The refresh token has expired.',
    ])(
      'should reject a refused refresh credential (%s) as not authenticated, so the caller can sign in again',
      async providerMessage => {
        vi.mocked(fetch).mockResolvedValue({
          ok: false,
          status: 400,
          json: async () => ({ error: { message: providerMessage } }),
        } as Response);

        const error = await refreshSession({
          refreshToken: 'stale',
          apiKey,
        }).catch((refreshError: unknown) => refreshError);

        expect(error).toBeInstanceOf(NotAuthenticatedError);
        expect(error).toHaveProperty(
          'message',
          `Firebase token refresh failed. ${providerMessage}`,
        );
      },
    );

    it.each([
      [
        'an unknown provider error',
        { error: { message: 'INTERNAL' } },
        'Firebase token refresh failed. INTERNAL',
      ],
      [
        'no provider error at all',
        {},
        'Firebase token refresh failed. undefined',
      ],
    ])(
      'should keep %s a plain error, since signing in again would not fix it',
      async (_label, body, expectedMessage) => {
        vi.mocked(fetch).mockResolvedValue({
          ok: false,
          status: 500,
          json: async () => body,
        } as Response);

        const error = await refreshSession({
          refreshToken: 'refresh-1',
          apiKey,
        }).catch((refreshError: unknown) => refreshError);

        expect(error).toBeInstanceOf(Error);
        expect(error).not.toBeInstanceOf(NotAuthenticatedError);
        expect(error).toHaveProperty('message', expectedMessage);
      },
    );

    it('should keep a network failure a plain error', async () => {
      const networkError = new TypeError('fetch failed');
      vi.mocked(fetch).mockRejectedValue(networkError);

      const error = await refreshSession({
        refreshToken: 'refresh-1',
        apiKey,
      }).catch((refreshError: unknown) => refreshError);

      expect(error).toBe(networkError);
    });

    it('should report the HTTP status instead of crashing on a non-JSON error response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => {
          throw new SyntaxError("Unexpected token '<'");
        },
      } as unknown as Response);

      const error = await refreshSession({
        refreshToken: 'refresh-1',
        apiKey,
      }).catch((refreshError: unknown) => refreshError);

      expect(error).toHaveProperty(
        'message',
        'Firebase request failed with status 503 and a non-JSON response body.',
      );
      expect(error).not.toBeInstanceOf(NotAuthenticatedError);
    });

    it('should URL-encode a refresh token containing form-special characters', async () => {
      const idToken = encodeToken({ exp: 1800000000 });
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ id_token: idToken, refresh_token: 'refresh-2' }),
      } as Response);

      await refreshSession({ refreshToken: 'a+b/c=d&e', apiKey });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: `grant_type=refresh_token&refresh_token=${encodeURIComponent('a+b/c=d&e')}`,
        }),
      );
    });
  });

  describe('getValidSession', () => {
    const session = {
      idToken: 'current',
      refreshToken: 'refresh-1',
      expiresAt: 2_000_000_000_000,
    };

    it('should keep a session that is not close to expiring', async () => {
      const result = await getValidSession({
        session,
        apiKey,
        now: session.expiresAt - 10 * 60 * 1000,
      });

      expect(result).toBe(session);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should refresh a session inside the renewal window', async () => {
      const idToken = encodeToken({ exp: 1900000000 });
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ id_token: idToken, refresh_token: 'refresh-3' }),
      } as Response);

      const result = await getValidSession({
        session,
        apiKey,
        now: session.expiresAt - 60 * 1000,
      });

      expect(result.idToken).toBe(idToken);
      expect(result.refreshToken).toBe('refresh-3');
    });

    it('should reject as not authenticated when the expired session cannot be refreshed anymore', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'TOKEN_EXPIRED' } }),
      } as Response);

      await expect(
        getValidSession({ session, apiKey, now: session.expiresAt + 1 }),
      ).rejects.toBeInstanceOf(NotAuthenticatedError);
    });

    it('should refresh a session that already expired', async () => {
      const idToken = encodeToken({ exp: 1900000000 });
      vi.mocked(fetch).mockResolvedValue({
        json: async () => ({ id_token: idToken, refresh_token: 'refresh-4' }),
      } as Response);

      const result = await getValidSession({
        session,
        apiKey,
        now: session.expiresAt + 1,
      });

      expect(result.idToken).toBe(idToken);
    });
  });
});
