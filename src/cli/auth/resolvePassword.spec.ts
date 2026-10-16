import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Target import
import { resolvePassword } from './resolvePassword';

const h = vi.hoisted(() => ({
  password: vi.fn(),
  isCancel: vi.fn(),
}));

vi.mock('@clack/prompts', () => ({
  password: h.password,
  isCancel: h.isCancel,
}));

describe('CLI: resolvePassword', () => {
  let originalIsTTY: boolean | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    originalIsTTY = process.stdin.isTTY;
  });

  afterEach(() => {
    Object.defineProperty(process.stdin, 'isTTY', {
      value: originalIsTTY,
      configurable: true,
    });
    vi.unstubAllEnvs();
  });

  it('should use the flag value when supplied', async () => {
    await expect(resolvePassword({ flagValue: 'flag-secret' })).resolves.toBe(
      'flag-secret',
    );
    expect(h.password).not.toHaveBeenCalled();
  });

  it('should fall back to AUTODROID_CLI_PASSWORD when the flag is absent', async () => {
    vi.stubEnv('AUTODROID_CLI_PASSWORD', 'env-secret');

    await expect(resolvePassword({})).resolves.toBe('env-secret');
    expect(h.password).not.toHaveBeenCalled();
  });

  it('should prompt interactively when neither source is available in a TTY', async () => {
    Object.defineProperty(process.stdin, 'isTTY', {
      value: true,
      configurable: true,
    });
    h.password.mockResolvedValue('typed-secret');
    h.isCancel.mockReturnValue(false);

    await expect(resolvePassword({})).resolves.toBe('typed-secret');
    expect(h.password).toHaveBeenCalledWith({ message: 'Password' });
  });

  it('should reject when the interactive prompt is cancelled', async () => {
    Object.defineProperty(process.stdin, 'isTTY', {
      value: true,
      configurable: true,
    });
    h.password.mockResolvedValue(Symbol('cancel'));
    h.isCancel.mockReturnValue(true);

    await expect(resolvePassword({})).rejects.toThrow('Login cancelled.');
  });

  it('should reject when running non-interactively with no password source', async () => {
    Object.defineProperty(process.stdin, 'isTTY', {
      value: false,
      configurable: true,
    });

    await expect(resolvePassword({})).rejects.toThrow(
      'Password is required. Pass --password, set AUTODROID_CLI_PASSWORD, or run interactively.',
    );
  });
});
