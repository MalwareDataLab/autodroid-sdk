import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Target import
import { browserLogin } from './browserLogin';

const h = vi.hoisted(() => ({
  randomBytes: vi.fn(),
  randomInt: vi.fn(),
  openBrowser: vi.fn(),
  signInWithCustomToken: vi.fn(),
  writeSession: vi.fn(),
  getCliConfig: vi.fn(),
  getWebUrl: vi.fn(),
}));

vi.mock('node:crypto', async importOriginal => {
  const actual = await importOriginal<typeof import('node:crypto')>();
  return { ...actual, randomBytes: h.randomBytes, randomInt: h.randomInt };
});

vi.mock('../ui/openBrowser', () => ({ openBrowser: h.openBrowser }));

vi.mock('./firebaseSession', () => ({
  signInWithCustomToken: h.signInWithCustomToken,
}));

vi.mock('./sessionStore', () => ({ writeSession: h.writeSession }));

vi.mock('../context', () => ({
  getCliConfig: h.getCliConfig,
  getWebUrl: h.getWebUrl,
}));

const VERIFIER = Buffer.alloc(32, 7).toString('base64url');
const CHALLENGE = createHash('sha256').update(VERIFIER).digest('base64url');
const USER_CODE = 'AAAAAAAA';
const AUTHORIZE_URL = 'https://app.example.test/cli/authorize';
const REGISTER_URL = 'https://api.example.test/cli-auth/register';
const TOKEN_URL = 'https://api.example.test/cli-auth/token';

const okResponse = (body: unknown) =>
  ({ ok: true, json: async () => body }) as Response;

describe('CLI: browserLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.randomBytes.mockReturnValue(Buffer.alloc(32, 7));
    h.randomInt.mockReturnValue(0);
    h.getCliConfig.mockReturnValue({
      apiKey: 'web-api-key',
      endpoint: 'https://api.example.test/graphql',
    });
    h.getWebUrl.mockReturnValue('https://app.example.test');
    h.signInWithCustomToken.mockResolvedValue({
      idToken: 'id-token',
      refreshToken: 'refresh-token',
      expiresAt: 123,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should register the challenge under a fresh user code, open a bare authorize url, poll until authorized and store the session', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => okResponse({ success: true }))
      .mockImplementationOnce(
        async () => ({ ok: false, status: 404 }) as Response,
      )
      .mockImplementationOnce(async () =>
        okResponse({ token: 'custom-token-1' }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const onUserCode = vi.fn();
    const onAuthorizeUrl = vi.fn();
    const resultPromise = browserLogin({ onUserCode, onAuthorizeUrl });
    await vi.advanceTimersByTimeAsync(2000);
    const result = await resultPromise;

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      REGISTER_URL,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code_challenge: CHALLENGE,
          user_code: USER_CODE,
        }),
      }),
    );
    expect(onUserCode).toHaveBeenCalledWith(USER_CODE);
    expect(onAuthorizeUrl).toHaveBeenCalledWith(AUTHORIZE_URL);
    expect(h.openBrowser).toHaveBeenCalledWith(AUTHORIZE_URL);
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      TOKEN_URL,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_verifier: VERIFIER }),
      }),
    );
    expect(h.signInWithCustomToken).toHaveBeenCalledWith({
      customToken: 'custom-token-1',
      apiKey: 'web-api-key',
    });
    expect(h.writeSession).toHaveBeenCalledWith({
      idToken: 'id-token',
      refreshToken: 'refresh-token',
      expiresAt: 123,
    });
    expect(result).toEqual({ expiresAt: 123, authorizeUrl: AUTHORIZE_URL });
  });

  it('should share one in-flight login across concurrent callers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(okResponse({ token: 'custom-token-1' })),
    );

    const [first, second] = await Promise.all([browserLogin(), browserLogin()]);

    expect(first).toBe(second);
    expect(h.openBrowser).toHaveBeenCalledOnce();
    expect(h.signInWithCustomToken).toHaveBeenCalledOnce();
  });

  it('should run a new login after a prior one finished', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(okResponse({ token: 'custom-token-1' })),
    );

    await browserLogin();
    await browserLogin();

    expect(h.openBrowser).toHaveBeenCalledTimes(2);
  });

  it('should throw immediately on a non-404 polling failure', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => okResponse({ success: true }))
      .mockImplementationOnce(
        async () => ({ ok: false, status: 500 }) as Response,
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(browserLogin()).rejects.toThrowError(
      'Browser sign-in failed with status 500.',
    );
  });

  it('should time out when the challenge is never authorized', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => okResponse({ success: true }))
      .mockImplementation(async () => ({ ok: false, status: 404 }) as Response);
    vi.stubGlobal('fetch', fetchMock);

    const resultPromise = browserLogin();
    resultPromise.catch(() => {});
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 1);

    await expect(resultPromise).rejects.toThrowError(
      'Browser sign-in timed out. Run `autodroid login` again.',
    );
  });

  it('should not hang forever when a single poll request never responds', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => okResponse({ success: true }))
      .mockImplementationOnce(
        (_url: string, options: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            options.signal?.addEventListener('abort', () => {
              reject(
                new DOMException('The operation was aborted.', 'AbortError'),
              );
            });
          }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const resultPromise = browserLogin();
    resultPromise.catch(() => {});
    await vi.advanceTimersByTimeAsync(10000);

    await expect(resultPromise).rejects.toThrowError(/aborted/i);
  });

  it("should not hang forever when a response's headers arrive but its body never finishes", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => okResponse({ success: true }))
      .mockImplementationOnce(
        (_url: string, options: RequestInit) =>
          Promise.resolve({
            ok: true,
            json: () =>
              new Promise((_resolve, reject) => {
                options.signal?.addEventListener('abort', () => {
                  reject(
                    new DOMException(
                      'The operation was aborted.',
                      'AbortError',
                    ),
                  );
                });
              }),
          }) as Promise<Response>,
      );
    vi.stubGlobal('fetch', fetchMock);

    const resultPromise = browserLogin();
    resultPromise.catch(() => {});
    await vi.advanceTimersByTimeAsync(10000);

    await expect(resultPromise).rejects.toThrowError(/aborted/i);
  });

  it('should throw when registering the challenge fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({ ok: false, status: 409 } as Response),
    );

    await expect(browserLogin()).rejects.toThrowError(
      'Failed to register the sign-in request with status 409.',
    );
  });
});
