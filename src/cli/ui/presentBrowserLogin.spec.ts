import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Target import
import { presentBrowserLogin } from './presentBrowserLogin';

const h = vi.hoisted(() => ({
  browserLogin: vi.fn(),
  rememberAccountAdminStatus: vi.fn(),
}));

vi.mock('../auth/browserLogin', () => ({ browserLogin: h.browserLogin }));

vi.mock('../commands', () => ({
  rememberAccountAdminStatus: h.rememberAccountAdminStatus,
}));

describe('CLI: presentBrowserLogin', () => {
  let originalStderrIsTTY: boolean | undefined;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    originalStderrIsTTY = process.stderr.isTTY;
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    Object.defineProperty(process.stderr, 'isTTY', {
      value: originalStderrIsTTY,
      configurable: true,
    });
  });

  it('should print the user code and the authorize url, and return the login result', async () => {
    h.browserLogin.mockImplementation(
      async ({ onUserCode, onAuthorizeUrl }) => {
        onUserCode('ABCDEFGH');
        onAuthorizeUrl('https://app.example.test/cli/authorize');
        return { expiresAt: 123, authorizeUrl: 'https://app.example.test' };
      },
    );

    const result = await presentBrowserLogin();

    expect(result).toEqual({
      expiresAt: 123,
      authorizeUrl: 'https://app.example.test',
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('ABCDEFGH'),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://app.example.test/cli/authorize'),
    );
  });

  it('should remember whether the new session belongs to an admin, after the login succeeded', async () => {
    h.browserLogin.mockResolvedValue({ expiresAt: 1, authorizeUrl: 'u' });

    await presentBrowserLogin();

    expect(h.rememberAccountAdminStatus).toHaveBeenCalledOnce();
  });

  it('should propagate a browser login failure', async () => {
    const error = new Error('timed out');
    h.browserLogin.mockImplementation(
      async ({ onUserCode, onAuthorizeUrl }) => {
        onUserCode('ABCDEFGH');
        onAuthorizeUrl('https://app.example.test/cli/authorize');
        throw error;
      },
    );

    await expect(presentBrowserLogin()).rejects.toThrowError('timed out');
    expect(h.rememberAccountAdminStatus).not.toHaveBeenCalled();
  });
});
