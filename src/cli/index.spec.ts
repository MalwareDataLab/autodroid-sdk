import { ApolloError } from '@apollo/client/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Context import
import { NotAuthenticatedError } from './context';

// Authentication import
import { refreshSession } from './auth/firebaseSession';

// Target import
import { runCli } from './index';

const h = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
  whoami: vi.fn(),
  rememberAccountAdminStatus: vi.fn(),
  readIsAdmin: vi.fn(),
  startMcpServer: vi.fn(),
  presentBrowserLogin: vi.fn(),
}));

vi.mock('./commands', () => ({
  login: h.login,
  logout: h.logout,
  rememberAccountAdminStatus: h.rememberAccountAdminStatus,
  getSdk: () => ({ user: { getCurrent: h.whoami } }),
}));
vi.mock('./auth/accountStore', () => ({ readIsAdmin: h.readIsAdmin }));
vi.mock('./mcp/server', () => ({ startMcpServer: h.startMcpServer }));
vi.mock('./ui/presentBrowserLogin', () => ({
  presentBrowserLogin: h.presentBrowserLogin,
}));
vi.mock('./ui/withSpinner', () => ({
  withSpinner: (_label: string, task: () => Promise<unknown>) => task(),
}));

describe('CLI: runCli', () => {
  let output: string[];

  beforeEach(() => {
    vi.clearAllMocks();
    h.readIsAdmin.mockResolvedValue(false);
    output = [];
    vi.spyOn(console, 'log').mockImplementation(line => {
      output.push(String(line));
    });
    vi.spyOn(console, 'error').mockImplementation(line => {
      output.push(String(line));
    });
    vi.spyOn(console, 'table').mockImplementation(() => undefined);
  });

  const withTTY = async (value: boolean, run: () => Promise<void>) => {
    const originalStdoutIsTTY = process.stdout.isTTY;
    const originalStderrIsTTY = process.stderr.isTTY;
    const originalNoColor = process.env.NO_COLOR;
    Object.defineProperty(process.stdout, 'isTTY', {
      value,
      configurable: true,
    });
    Object.defineProperty(process.stderr, 'isTTY', {
      value,
      configurable: true,
    });
    delete process.env.NO_COLOR;
    try {
      await run();
    } finally {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: originalStdoutIsTTY,
        configurable: true,
      });
      Object.defineProperty(process.stderr, 'isTTY', {
        value: originalStderrIsTTY,
        configurable: true,
      });
      if (originalNoColor === undefined) delete process.env.NO_COLOR;
      else process.env.NO_COLOR = originalNoColor;
    }
  };

  it("should print the version this file imports, not yargs' own cwd auto-detection", async () => {
    vi.resetModules();
    vi.doMock('../../package.json', () => ({ version: '9.9.9-mocked' }));
    const { runCli: freshRunCli } = await import('./index');

    const code = await freshRunCli(['--version']);

    expect(code).toBe(0);
    expect(output.join('\n').trim()).toBe('9.9.9-mocked');

    vi.doUnmock('../../package.json');
    vi.resetModules();
  });

  it('should log in with the supplied credentials', async () => {
    h.login.mockResolvedValue({ expiresAt: 1700000000000 });

    const code = await runCli([
      'login',
      '--email',
      'user@example.test',
      '--password',
      'secret',
    ]);

    expect(h.login).toHaveBeenCalledWith({
      email: 'user@example.test',
      password: 'secret',
    });
    expect(code).toBe(0);
    expect(output.join('\n')).toContain('Logged in');
  });

  it('should log in with the password from AUTODROID_CLI_PASSWORD when --password is omitted', async () => {
    h.login.mockResolvedValue({ expiresAt: 1700000000000 });
    vi.stubEnv('AUTODROID_CLI_PASSWORD', 'env-secret');

    const code = await runCli(['login', '--email', 'user@example.test']);

    expect(h.login).toHaveBeenCalledWith({
      email: 'user@example.test',
      password: 'env-secret',
    });
    expect(code).toBe(0);

    vi.unstubAllEnvs();
  });

  it('should fail login when no password source is available non-interactively', async () => {
    const code = await runCli(['login', '--email', 'user@example.test']);

    expect(h.login).not.toHaveBeenCalled();
    expect(code).toBe(1);
    expect(output.join('\n')).toContain('Password is required.');
  });

  it('should log out', async () => {
    const code = await runCli(['logout']);

    expect(h.logout).toHaveBeenCalledOnce();
    expect(code).toBe(0);
  });

  it('should never color the logout confirmation when --json is passed, even on a TTY', async () => {
    await withTTY(true, async () => {
      await runCli(['logout', '--json']);

      expect(output.join('\n')).toBe('Logged out.');
    });
  });

  it('should serve AutoDroid tools over MCP stdio', async () => {
    h.startMcpServer.mockResolvedValue(undefined);

    const code = await runCli(['mcp']);

    expect(h.startMcpServer).toHaveBeenCalledOnce();
    expect(code).toBe(0);
  });

  it('should print the current user as a formatted table by default', async () => {
    h.whoami.mockResolvedValue({ id: 'user-1' });

    const code = await runCli(['whoami']);

    expect(code).toBe(0);
    expect(output.join('\n')).toContain('id: user-1');
  });

  it('should print the current user as json when --json is passed', async () => {
    h.whoami.mockResolvedValue({ id: 'user-1' });

    const code = await runCli(['whoami', '--json']);

    expect(code).toBe(0);
    expect(output.join('\n')).toContain('"id": "user-1"');
  });

  it('should hide the admin commands from --help for a non admin account', async () => {
    h.readIsAdmin.mockResolvedValue(false);

    await runCli(['--help']);

    const help = output.join('\n');
    expect(help).toContain('dataset');
    expect(help).not.toMatch(/autodroid admin/);
  });

  it('should list the admin commands in --help for an admin account', async () => {
    h.readIsAdmin.mockResolvedValue(true);

    await runCli(['--help']);

    expect(output.join('\n')).toMatch(/autodroid admin/);
  });

  it('should still run an admin command when it is hidden, leaving the refusal to the API', async () => {
    h.readIsAdmin.mockResolvedValue(false);

    const code = await runCli(['admin', 'worker', 'list']);

    expect(code).toBe(1);
    expect(output.join('\n')).not.toContain('Unknown argument');
  });

  it('should report a failure with a non zero exit code', async () => {
    h.whoami.mockRejectedValue(new Error('Not authenticated.'));

    const code = await runCli(['whoami']);

    expect(code).toBe(1);
    expect(output.join('\n')).toContain('Not authenticated.');
  });

  it("should report the API's constraint message for an input the API's validation rejects, as the remote MCP tools do", async () => {
    h.whoami.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [
          {
            message: 'Argument Validation Error',
            extensions: {
              code: 'GRAPHQL_VALIDATION_FAILED',
              validationErrors: [
                {
                  property: 'phone_number',
                  constraints: {
                    isPhoneNumber: 'phone_number must be a valid phone number',
                  },
                },
              ],
            },
          },
        ],
      }),
    );

    const code = await runCli(['whoami', '--json']);

    expect(code).toBe(1);
    expect(output).toEqual(['phone_number must be a valid phone number']);
  });

  it('should color the error message red on a TTY', async () => {
    h.whoami.mockRejectedValue(new Error('Not authenticated.'));

    await withTTY(true, async () => {
      const code = await runCli(['whoami']);

      expect(code).toBe(1);
      expect(output.join('\n')).toContain(
        '\u001b[31mNot authenticated.\u001b[39m',
      );
    });
  });

  it('should leave the error message plain off a TTY, with no ANSI codes at all', async () => {
    h.whoami.mockRejectedValue(new Error('Not authenticated.'));

    await withTTY(false, async () => {
      const code = await runCli(['whoami']);

      expect(code).toBe(1);
      expect(output.join('\n')).toBe('Not authenticated.');
    });
  });

  it('should never emit ANSI codes when --json is passed, even on a TTY', async () => {
    h.whoami.mockRejectedValue(new Error('Not authenticated.'));

    await withTTY(true, async () => {
      const code = await runCli(['whoami', '--json']);

      expect(code).toBe(1);
      expect(output.join('\n')).toBe('Not authenticated.');
    });
  });

  it('should never emit ANSI codes for the --json=true long form either', async () => {
    h.whoami.mockRejectedValue(new Error('Not authenticated.'));

    await withTTY(true, async () => {
      const code = await runCli(['whoami', '--json=true']);

      expect(code).toBe(1);
      expect(output.join('\n')).toBe('Not authenticated.');
    });
  });

  it.each(['--json=false', '--json=0', '--json=', '--json=no'])(
    'should color the error message when %s is passed, matching yargs own boolean coercion',
    async flag => {
      h.whoami.mockRejectedValue(new Error('Not authenticated.'));

      await withTTY(true, async () => {
        const code = await runCli(['whoami', flag]);

        expect(code).toBe(1);
        expect(output.join('\n')).toContain(
          '\u001b[31mNot authenticated.\u001b[39m',
        );
      });
    },
  );

  it('should color the login confirmation green on a TTY', async () => {
    h.login.mockResolvedValue({ expiresAt: 1700000000000 });

    await withTTY(true, async () => {
      await runCli([
        'login',
        '--email',
        'user@example.test',
        '--password',
        'secret',
      ]);

      expect(output.join('\n')).toBe(
        '\u001b[32mLogged in. Session valid until 2023-11-14T22:13:20.000Z.\u001b[39m',
      );
    });
  });

  it('should leave the login confirmation plain off a TTY', async () => {
    h.login.mockResolvedValue({ expiresAt: 1700000000000 });

    await withTTY(false, async () => {
      await runCli([
        'login',
        '--email',
        'user@example.test',
        '--password',
        'secret',
      ]);

      expect(output.join('\n')).toBe(
        'Logged in. Session valid until 2023-11-14T22:13:20.000Z.',
      );
    });
  });

  it('should never color the login confirmation when --json is passed, even on a TTY', async () => {
    h.login.mockResolvedValue({ expiresAt: 1700000000000 });

    await withTTY(true, async () => {
      await runCli([
        'login',
        '--email',
        'user@example.test',
        '--password',
        'secret',
        '--json',
      ]);

      expect(output.join('\n')).toBe(
        'Logged in. Session valid until 2023-11-14T22:13:20.000Z.',
      );
    });
  });

  it('should report a clean one-line message for a yargs validation failure, not a stack trace', async () => {
    const code = await runCli(['processing', 'run', '--processor-id', 'p1']);

    expect(code).toBe(1);
    expect(output.join('\n')).toContain(
      'Missing required argument: dataset-id',
    );
    expect(output.join('\n')).not.toContain(' at ');
  });

  it('should default to a browser login when --email is omitted', async () => {
    h.presentBrowserLogin.mockResolvedValue({ expiresAt: 1700000000000 });

    const code = await runCli(['login']);

    expect(h.presentBrowserLogin).toHaveBeenCalledOnce();
    expect(h.login).not.toHaveBeenCalled();
    expect(code).toBe(0);
    expect(output.join('\n')).toContain(
      'Logged in. Session valid until 2023-11-14T22:13:20.000Z.',
    );
  });

  it('should retry an unauthenticated command once through the browser after signing in, on a TTY', async () => {
    h.whoami
      .mockRejectedValueOnce(
        new NotAuthenticatedError(
          'Not authenticated. Run `autodroid login` first.',
        ),
      )
      .mockResolvedValueOnce({ id: 'user-1' });
    h.presentBrowserLogin.mockResolvedValue({ expiresAt: 1700000000000 });

    await withTTY(true, async () => {
      const code = await runCli(['whoami']);

      expect(h.presentBrowserLogin).toHaveBeenCalledOnce();
      expect(h.whoami).toHaveBeenCalledTimes(2);
      expect(code).toBe(0);
      expect(output.join('\n')).toContain('id: user-1');
    });
  });

  it("should retry when the SDK's Apollo Client wraps the error in an ApolloError, losing its own class identity", async () => {
    const apolloWrappedError = Object.assign(new Error('Not authenticated.'), {
      networkError: new NotAuthenticatedError(
        'Not authenticated. Run `autodroid login` first.',
      ),
    });
    h.whoami
      .mockRejectedValueOnce(apolloWrappedError)
      .mockResolvedValueOnce({ id: 'user-1' });
    h.presentBrowserLogin.mockResolvedValue({ expiresAt: 1700000000000 });

    await withTTY(true, async () => {
      const code = await runCli(['whoami']);

      expect(h.presentBrowserLogin).toHaveBeenCalledOnce();
      expect(h.whoami).toHaveBeenCalledTimes(2);
      expect(code).toBe(0);
      expect(output.join('\n')).toContain('id: user-1');
    });
  });

  const refreshFailureAsSdkError = async (providerMessage: string) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: providerMessage } }),
      }),
    );
    const refreshError = await refreshSession({
      refreshToken: 'stale',
      apiKey: 'web-api-key',
    }).then(
      () => {
        throw new Error('Expected Firebase to refuse the refresh.');
      },
      (error: Error) => error,
    );
    vi.unstubAllGlobals();

    return new ApolloError({ networkError: refreshError });
  };

  it('should sign in through the browser and retry once when the stored session can no longer be refreshed, on a TTY', async () => {
    h.whoami
      .mockRejectedValueOnce(await refreshFailureAsSdkError('USER_DISABLED'))
      .mockResolvedValueOnce({ id: 'user-1' });
    h.presentBrowserLogin.mockResolvedValue({ expiresAt: 1700000000000 });

    await withTTY(true, async () => {
      const code = await runCli(['whoami']);

      expect(h.presentBrowserLogin).toHaveBeenCalledOnce();
      expect(h.whoami).toHaveBeenCalledTimes(2);
      expect(code).toBe(0);
      expect(output.join('\n')).toContain('id: user-1');
    });
  });

  it('should report a refresh failure that a new sign-in would not fix, without opening the browser', async () => {
    h.whoami.mockRejectedValueOnce(await refreshFailureAsSdkError('INTERNAL'));

    await withTTY(true, async () => {
      const code = await runCli(['whoami']);

      expect(h.presentBrowserLogin).not.toHaveBeenCalled();
      expect(h.whoami).toHaveBeenCalledOnce();
      expect(code).toBe(1);
      expect(output.join('\n')).toContain(
        'Firebase token refresh failed. INTERNAL',
      );
    });
  });

  it('should report the failure when the retried command fails again', async () => {
    h.whoami.mockRejectedValue(
      new NotAuthenticatedError(
        'Not authenticated. Run `autodroid login` first.',
      ),
    );
    h.presentBrowserLogin.mockResolvedValue({ expiresAt: 1700000000000 });

    await withTTY(true, async () => {
      const code = await runCli(['whoami']);

      expect(h.presentBrowserLogin).toHaveBeenCalledOnce();
      expect(h.whoami).toHaveBeenCalledTimes(2);
      expect(code).toBe(1);
      expect(output.join('\n')).toContain('Not authenticated.');
    });
  });

  it('should never attempt a browser login retry off a TTY', async () => {
    h.whoami.mockRejectedValue(
      new NotAuthenticatedError(
        'Not authenticated. Run `autodroid login` first.',
      ),
    );

    await withTTY(false, async () => {
      const code = await runCli(['whoami']);

      expect(h.presentBrowserLogin).not.toHaveBeenCalled();
      expect(h.whoami).toHaveBeenCalledOnce();
      expect(code).toBe(1);
    });
  });
});
