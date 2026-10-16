import { ApolloError } from '@apollo/client/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Context import
import { NotAuthenticatedError } from '../context';

// Authentication import
import { refreshSession } from '../auth/firebaseSession';

// Operation import
import {
  adminAccessOperations,
  userAccessOperations,
} from '../operations/catalog';

// Target import
import {
  createMcpServer,
  exposeAdminToolsToAdmin,
  startMcpServer,
} from './server';

const h = vi.hoisted(() => ({
  closeSessions: vi.fn(),
  registerTool: vi.fn(),
  removeTool: vi.fn(),
  connect: vi.fn(),
  McpServer: vi.fn(),
  StdioServerTransport: vi.fn(),
  getCurrent: vi.fn(),
  datasetGetOne: vi.fn(),
  adminDatasetGetOne: vi.fn(),
  presentBrowserLogin: vi.fn(),
  readSession: vi.fn(),
}));

vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: h.McpServer.mockImplementation(() => ({
    registerTool: h.registerTool,
    connect: h.connect,
  })),
}));

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: h.StdioServerTransport,
}));

vi.mock('../commands', () => ({
  getSdk: () => ({
    user: { getCurrent: h.getCurrent, closeSessions: h.closeSessions },
    dataset: { getOne: h.datasetGetOne },
    admin: { dataset: { getOne: h.adminDatasetGetOne } },
  }),
}));

vi.mock('../auth/sessionStore', () => ({
  readSession: h.readSession,
}));

vi.mock('../ui/presentBrowserLogin', () => ({
  presentBrowserLogin: h.presentBrowserLogin,
}));

const USER = {
  id: 'user-1',
  name: 'Ada',
  email: 'ada@example.test',
  is_admin: false,
  language: 'en-us',
  phone_number: '+55 1',
};
const PROJECTED_USER = {
  id: 'user-1',
  name: 'Ada',
  email: 'ada@example.test',
  is_admin: false,
  language: 'en-us',
};

const USER_TOOL_COUNT = userAccessOperations.length;
const ADMIN_TOOL_COUNT = adminAccessOperations.length;

const registeredToolNames = (): string[] =>
  h.registerTool.mock.calls.map((call: any[]) => call[0] as string);

const handlerOf = (toolName: string) => {
  const call = h.registerTool.mock.calls.find(
    (candidate: any[]) => candidate[0] === toolName,
  );
  if (!call) throw new Error(`${toolName} was not registered`);
  return call[2] as (input?: Record<string, any>) => Promise<any>;
};

const configOf = (toolName: string) =>
  h.registerTool.mock.calls.find(
    (candidate: any[]) => candidate[0] === toolName,
  )![1];

describe('MCP: server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.McpServer.mockImplementation(() => ({
      registerTool: h.registerTool,
      connect: h.connect,
    }));
    h.registerTool.mockImplementation(() => ({ remove: h.removeTool }));
    h.getCurrent.mockResolvedValue(USER);
    h.readSession.mockResolvedValue(null);
  });

  it('should register only the user tools up front, never the admin ones', () => {
    createMcpServer();

    expect(h.registerTool).toHaveBeenCalledTimes(USER_TOOL_COUNT);
    expect(registeredToolNames()).toContain('autodroid_whoami');
    expect(
      registeredToolNames().some(name => name.startsWith('autodroid_admin_')),
    ).toBe(false);
  });

  it('should name every tool with the autodroid_ prefix and describe it for the model', () => {
    createMcpServer();

    h.registerTool.mock.calls.forEach((call: any[]) => {
      expect(call[0]).toMatch(/^autodroid_[a-z_]+$/);
      expect(call[1].description.length).toBeGreaterThan(10);
      expect(call[1].inputSchema).toBeDefined();
    });
  });

  it.each([
    ['autodroid_whoami', { readOnlyHint: true, destructiveHint: false }],
    [
      'autodroid_update_profile',
      { readOnlyHint: false, destructiveHint: false },
    ],
    [
      'autodroid_delete_dataset',
      { readOnlyHint: false, destructiveHint: true },
    ],
  ])(
    'should annotate %s so a host knows whether to ask first',
    (toolName, expected) => {
      createMcpServer();

      expect(configOf(toolName).annotations).toEqual({
        ...expected,
        openWorldHint: false,
      });
    },
  );

  it('should identify itself to the client', () => {
    createMcpServer();

    expect(h.McpServer).toHaveBeenCalledWith({
      name: 'autodroid',
      version: expect.any(String),
    });
  });

  it('should answer a tool call with the projected, serialised result', async () => {
    createMcpServer();
    const result = await handlerOf('autodroid_whoami')({});

    expect(result).toEqual({
      content: [
        { type: 'text', text: JSON.stringify(PROJECTED_USER, null, 2) },
      ],
    });
    expect(result.content[0].text).not.toContain('+55 1');
  });

  it('should tolerate a tool call arriving without input', async () => {
    createMcpServer();
    const result = await handlerOf('autodroid_whoami')(undefined);

    expect(JSON.parse(result.content[0].text)).toEqual(PROJECTED_USER);
  });

  it('should pass the tool input to the operation', async () => {
    createMcpServer();
    h.datasetGetOne.mockResolvedValue({ id: 'dataset-1', description: 'd' });

    await handlerOf('autodroid_show_dataset')({ datasetId: 'dataset-1' });

    expect(h.datasetGetOne).toHaveBeenCalledWith({ datasetId: 'dataset-1' });
  });

  it('should report a failing tool call as an error result', async () => {
    createMcpServer();
    h.getCurrent.mockRejectedValue(new Error('boom'));

    await expect(handlerOf('autodroid_whoami')({})).resolves.toEqual({
      isError: true,
      content: [{ type: 'text', text: 'boom' }],
    });
  });

  it("should report the API's constraint message for an input the API's validation rejects, as the remote MCP tools do", async () => {
    createMcpServer();
    h.getCurrent.mockRejectedValue(
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

    await expect(handlerOf('autodroid_whoami')({})).resolves.toEqual({
      isError: true,
      content: [
        { type: 'text', text: 'phone_number must be a valid phone number' },
      ],
    });
  });

  it('should run a browser login and retry once when the session is missing', async () => {
    createMcpServer();
    h.getCurrent
      .mockRejectedValueOnce(new NotAuthenticatedError('Not authenticated.'))
      .mockResolvedValue(USER);
    h.presentBrowserLogin.mockResolvedValue({ expiresAt: 123 });

    const result = await handlerOf('autodroid_whoami')({});

    expect(h.presentBrowserLogin).toHaveBeenCalledOnce();
    expect(result.content[0].text).toBe(
      JSON.stringify(PROJECTED_USER, null, 2),
    );
    await vi.waitFor(() => expect(h.getCurrent).toHaveBeenCalledTimes(3));
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

  it('should run a browser login and retry once when the stored session can no longer be refreshed', async () => {
    createMcpServer();
    h.getCurrent
      .mockRejectedValueOnce(await refreshFailureAsSdkError('TOKEN_EXPIRED'))
      .mockResolvedValue(USER);
    h.presentBrowserLogin.mockResolvedValue({ expiresAt: 123 });

    const result = await handlerOf('autodroid_whoami')({});

    expect(h.presentBrowserLogin).toHaveBeenCalledOnce();
    expect(result).toEqual({
      content: [
        { type: 'text', text: JSON.stringify(PROJECTED_USER, null, 2) },
      ],
    });
    await vi.waitFor(() => expect(h.getCurrent).toHaveBeenCalledTimes(3));
  });

  it('should report a refresh failure that a new sign-in would not fix, without opening the browser', async () => {
    createMcpServer();
    h.getCurrent.mockRejectedValueOnce(
      await refreshFailureAsSdkError('INTERNAL'),
    );

    const result = await handlerOf('autodroid_whoami')({});

    expect(h.presentBrowserLogin).not.toHaveBeenCalled();
    expect(result).toEqual({
      isError: true,
      content: [
        { type: 'text', text: 'Firebase token refresh failed. INTERNAL' },
      ],
    });
    expect(h.getCurrent).toHaveBeenCalledOnce();
  });

  it('should treat a call that carries no input as an empty one, also when it is retried after a sign-in', async () => {
    createMcpServer();
    h.getCurrent
      .mockRejectedValueOnce(new NotAuthenticatedError('Not authenticated.'))
      .mockResolvedValue(USER);
    h.presentBrowserLogin.mockResolvedValue({ expiresAt: 123 });

    const result = await handlerOf('autodroid_whoami')(undefined);

    expect(result.content[0].text).toBe(
      JSON.stringify(PROJECTED_USER, null, 2),
    );
  });

  it('should return an operation result as is when the operation declares no projection', async () => {
    createMcpServer();
    h.closeSessions.mockResolvedValue(undefined);

    const result = await handlerOf('autodroid_close_sessions')({});

    expect(JSON.parse(result.content[0].text)).toEqual({ closed: true });
  });

  it("should retry when the SDK's Apollo Client wraps the error in an ApolloError, losing its own class identity", async () => {
    createMcpServer();
    h.getCurrent
      .mockRejectedValueOnce(
        Object.assign(new Error('wrapped'), {
          networkError: new NotAuthenticatedError('Not authenticated.'),
        }),
      )
      .mockResolvedValue(USER);
    h.presentBrowserLogin.mockResolvedValue({ expiresAt: 123 });

    await handlerOf('autodroid_whoami')({});

    expect(h.presentBrowserLogin).toHaveBeenCalledOnce();
    await vi.waitFor(() => expect(h.getCurrent).toHaveBeenCalledTimes(3));
  });

  it('should report an error result when the retried call fails again', async () => {
    createMcpServer();
    h.getCurrent.mockRejectedValue(
      new NotAuthenticatedError(
        'Not authenticated. Run `autodroid login` first.',
      ),
    );
    h.presentBrowserLogin.mockResolvedValue({ expiresAt: 123 });

    await expect(handlerOf('autodroid_whoami')({})).resolves.toEqual({
      isError: true,
      content: [
        {
          type: 'text',
          text: 'Not authenticated. Run `autodroid login` first.',
        },
      ],
    });
    expect(h.presentBrowserLogin).toHaveBeenCalledOnce();
    expect(h.getCurrent).toHaveBeenCalledTimes(3);
  });

  describe('unknown input keys', () => {
    it('should refuse a misspelled update_dataset key instead of dropping it and clearing the description', () => {
      createMcpServer();

      const result = configOf('autodroid_update_dataset').inputSchema.safeParse(
        { datasetId: 'dataset-1', descripton: 'Typo', tags: 'a' },
      );

      expect(result.success).toBe(false);
      expect(result.error.issues).toEqual([
        {
          code: 'unrecognized_keys',
          keys: ['descripton'],
          path: [],
          message: 'Unrecognized key: "descripton"',
        },
      ]);
    });

    it('should refuse an unknown top-level key on every user and admin tool', async () => {
      h.getCurrent.mockResolvedValue({ ...USER, is_admin: true });
      await startMcpServer();

      const unknownKeyIssues = registeredToolNames().map(toolName =>
        configOf(toolName)
          .inputSchema.safeParse({ unexpectedKey: 'x' })
          .error?.issues.find(
            (issue: { code: string }) => issue.code === 'unrecognized_keys',
          ),
      );

      expect(unknownKeyIssues).toEqual(
        Array(USER_TOOL_COUNT + ADMIN_TOOL_COUNT).fill({
          code: 'unrecognized_keys',
          keys: ['unexpectedKey'],
          path: [],
          message: 'Unrecognized key: "unexpectedKey"',
        }),
      );
    });

    it.each([
      [
        'autodroid_list_datasets',
        {
          sorting: [{ field: 'created_at', order: 'ASC', direction: 'up' }],
        },
        ['sorting', 0],
        'direction',
      ],
      [
        'autodroid_run_processing',
        {
          datasetId: 'dataset-1',
          processorId: 'processor-1',
          parameters: [{ name: 'epochs', value: '3', note: 'x' }],
        },
        ['parameters', 0],
        'note',
      ],
      [
        'autodroid_admin_create_processor',
        {
          parameters: [
            {
              sequence: 1,
              name: 'epochs',
              description: 'Training epochs.',
              type: 'INTEGER',
              isRequired: true,
              defaultValue: null,
              extraField: 1,
            },
          ],
        },
        ['parameters', 0],
        'extraField',
      ],
    ])(
      'should refuse an unknown key nested inside %s',
      async (toolName, input, path, unknownKey) => {
        h.getCurrent.mockResolvedValue({ ...USER, is_admin: true });
        await startMcpServer();

        const result = configOf(toolName).inputSchema.safeParse(input);

        expect(result.error?.issues).toContainEqual({
          code: 'unrecognized_keys',
          keys: [unknownKey],
          path,
          message: `Unrecognized key: "${unknownKey}"`,
        });
      },
    );
  });

  describe('admin tools', () => {
    it('should add the admin tools once the signed-in user turns out to be an admin', async () => {
      h.getCurrent.mockResolvedValue({ ...USER, is_admin: true });

      await startMcpServer();

      expect(h.registerTool).toHaveBeenCalledTimes(
        USER_TOOL_COUNT + ADMIN_TOOL_COUNT,
      );
      expect(registeredToolNames()).toContain('autodroid_admin_list_workers');
    });

    it('should annotate the admin write and destructive tools', async () => {
      h.getCurrent.mockResolvedValue({ ...USER, is_admin: true });

      await startMcpServer();

      expect(configOf('autodroid_admin_delete_worker').annotations).toEqual({
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: false,
      });
      expect(configOf('autodroid_admin_create_processor').annotations).toEqual({
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      });
    });

    it('should keep the admin tools hidden from a signed-in user who is not an admin', async () => {
      await startMcpServer();

      expect(h.registerTool).toHaveBeenCalledTimes(USER_TOOL_COUNT);
    });

    it('should start with only the user tools, and not fail, when nobody is signed in yet', async () => {
      h.getCurrent.mockRejectedValue(new NotAuthenticatedError());

      await expect(startMcpServer()).resolves.toBeUndefined();

      expect(h.registerTool).toHaveBeenCalledTimes(USER_TOOL_COUNT);
      expect(h.connect).toHaveBeenCalledOnce();
    });

    it('should start with only the user tools, and not fail, when the admin check itself fails', async () => {
      h.getCurrent.mockRejectedValue(new Error('network down'));

      await expect(startMcpServer()).resolves.toBeUndefined();

      expect(h.registerTool).toHaveBeenCalledTimes(USER_TOOL_COUNT);
    });

    it('should reveal the admin tools after a browser login that happens during a tool call, when the new session is an admin', async () => {
      h.getCurrent
        .mockRejectedValueOnce(new NotAuthenticatedError())
        .mockResolvedValue({ ...USER, is_admin: true });
      h.presentBrowserLogin.mockResolvedValue(undefined);
      createMcpServer();

      await handlerOf('autodroid_whoami')({});

      await vi.waitFor(() =>
        expect(h.registerTool).toHaveBeenCalledTimes(
          USER_TOOL_COUNT + ADMIN_TOOL_COUNT,
        ),
      );
    });

    it('should withdraw the admin tools when the account that is signed in later is not an admin, and offer them again to an admin', async () => {
      h.getCurrent.mockResolvedValue({ ...USER, is_admin: true });
      const server = createMcpServer();
      await exposeAdminToolsToAdmin(server);

      h.getCurrent.mockResolvedValue({ ...USER, is_admin: false });
      await exposeAdminToolsToAdmin(server);

      expect(h.removeTool).toHaveBeenCalledTimes(ADMIN_TOOL_COUNT);

      h.getCurrent.mockResolvedValue({ ...USER, is_admin: true });
      await exposeAdminToolsToAdmin(server);

      expect(h.registerTool).toHaveBeenCalledTimes(
        USER_TOOL_COUNT + 2 * ADMIN_TOOL_COUNT,
      );
    });

    it('should withdraw the admin tools after a browser login as a non-admin, even when the retried call then fails', async () => {
      h.getCurrent
        .mockResolvedValueOnce({ ...USER, is_admin: true })
        .mockRejectedValueOnce(new NotAuthenticatedError())
        .mockRejectedValueOnce(new Error('Forbidden'))
        .mockResolvedValue({ ...USER, is_admin: false });
      h.presentBrowserLogin.mockResolvedValue(undefined);
      const server = createMcpServer();
      await exposeAdminToolsToAdmin(server);

      const result = await handlerOf('autodroid_whoami')({});

      expect(result).toEqual({
        isError: true,
        content: [{ type: 'text', text: 'Forbidden' }],
      });
      await vi.waitFor(() =>
        expect(h.removeTool).toHaveBeenCalledTimes(ADMIN_TOOL_COUNT),
      );
    });

    it('should withdraw the admin tools when the account that just signed in cannot be checked', async () => {
      h.getCurrent
        .mockResolvedValueOnce({ ...USER, is_admin: true })
        .mockRejectedValueOnce(new NotAuthenticatedError())
        .mockResolvedValueOnce({ ...USER, is_admin: false })
        .mockRejectedValue(new Error('network down'));
      h.presentBrowserLogin.mockResolvedValue(undefined);
      const server = createMcpServer();
      await exposeAdminToolsToAdmin(server);

      await handlerOf('autodroid_whoami')({});

      await vi.waitFor(() =>
        expect(h.removeTool).toHaveBeenCalledTimes(ADMIN_TOOL_COUNT),
      );
    });

    it('should re-check the account after a browser login that happens during an admin tool call too', async () => {
      h.getCurrent.mockResolvedValue({ ...USER, is_admin: true });
      h.adminDatasetGetOne
        .mockRejectedValueOnce(new NotAuthenticatedError())
        .mockResolvedValue({ id: 'dataset-1' });
      h.presentBrowserLogin.mockResolvedValue(undefined);
      const server = createMcpServer();
      await exposeAdminToolsToAdmin(server);
      h.getCurrent.mockClear();

      await handlerOf('autodroid_admin_show_dataset')({
        datasetId: 'dataset-1',
      });

      expect(h.presentBrowserLogin).toHaveBeenCalledOnce();
      await vi.waitFor(() => expect(h.getCurrent).toHaveBeenCalledOnce());
    });

    it('should keep the admin tools a background startup check cannot confirm hidden, and leave offered ones alone', async () => {
      h.getCurrent
        .mockResolvedValueOnce({ ...USER, is_admin: true })
        .mockRejectedValue(new Error('network down'));
      const server = createMcpServer();
      await exposeAdminToolsToAdmin(server);

      await exposeAdminToolsToAdmin(server, { withdrawWhenUnsure: false });

      expect(h.removeTool).not.toHaveBeenCalled();
    });

    describe('when the signed-in session changes outside a tool call', () => {
      const sessionOf = (refreshToken: string) => ({
        idToken: 'id-token',
        refreshToken,
        expiresAt: 123,
      });

      it('should offer the admin tools on the next tool call once an admin signs in elsewhere after startup', async () => {
        h.getCurrent
          .mockRejectedValueOnce(new NotAuthenticatedError())
          .mockResolvedValue({ ...USER, is_admin: true });
        await startMcpServer();
        h.readSession.mockResolvedValue(sessionOf('admin-session'));

        await handlerOf('autodroid_whoami')({});

        expect(h.registerTool).toHaveBeenCalledTimes(
          USER_TOOL_COUNT + ADMIN_TOOL_COUNT,
        );
        expect(h.presentBrowserLogin).not.toHaveBeenCalled();
      });

      it('should retry an admin check that failed at startup on the next tool call', async () => {
        h.readSession.mockResolvedValue(sessionOf('admin-session'));
        h.getCurrent
          .mockRejectedValueOnce(new Error('network down'))
          .mockResolvedValue({ ...USER, is_admin: true });
        await startMcpServer();

        await handlerOf('autodroid_whoami')({});

        expect(h.registerTool).toHaveBeenCalledTimes(
          USER_TOOL_COUNT + ADMIN_TOOL_COUNT,
        );
      });

      it('should withdraw the admin tools on the next tool call once a non-admin signs in elsewhere', async () => {
        h.readSession.mockResolvedValue(sessionOf('admin-session'));
        h.getCurrent.mockResolvedValue({ ...USER, is_admin: true });
        await startMcpServer();
        h.readSession.mockResolvedValue(sessionOf('user-session'));
        h.getCurrent.mockResolvedValue({ ...USER, is_admin: false });

        await handlerOf('autodroid_whoami')({});

        expect(h.removeTool).toHaveBeenCalledTimes(ADMIN_TOOL_COUNT);
      });

      it('should withdraw the admin tools when a session that changed cannot be checked', async () => {
        h.readSession.mockResolvedValue(sessionOf('admin-session'));
        h.getCurrent.mockResolvedValue({ ...USER, is_admin: true });
        await startMcpServer();
        h.readSession.mockResolvedValue(sessionOf('other-session'));
        h.getCurrent
          .mockRejectedValueOnce(new Error('network down'))
          .mockResolvedValue(USER);

        await handlerOf('autodroid_whoami')({});

        expect(h.removeTool).toHaveBeenCalledTimes(ADMIN_TOOL_COUNT);
      });

      it('should check again on the next tool call when the session changes while an admin check is in flight', async () => {
        h.readSession.mockResolvedValue(sessionOf('admin-session'));
        h.getCurrent
          .mockImplementationOnce(async () => {
            h.readSession.mockResolvedValue(sessionOf('user-session'));
            return { ...USER, is_admin: true };
          })
          .mockResolvedValue({ ...USER, is_admin: false });
        await startMcpServer();

        await handlerOf('autodroid_whoami')({});

        expect(h.removeTool).toHaveBeenCalledTimes(ADMIN_TOOL_COUNT);
      });

      it('should not ask the API again while the session stays the same', async () => {
        h.readSession.mockResolvedValue(sessionOf('admin-session'));
        h.getCurrent.mockResolvedValue({ ...USER, is_admin: true });
        await startMcpServer();

        await handlerOf('autodroid_whoami')({});
        await handlerOf('autodroid_whoami')({});

        expect(h.getCurrent).toHaveBeenCalledTimes(3);
        expect(h.registerTool).toHaveBeenCalledTimes(
          USER_TOOL_COUNT + ADMIN_TOOL_COUNT,
        );
      });
    });

    it('should register the admin tools only once however many times the admin check runs', async () => {
      h.getCurrent.mockResolvedValue({ ...USER, is_admin: true });
      const server = createMcpServer();

      await exposeAdminToolsToAdmin(server);
      await exposeAdminToolsToAdmin(server);

      expect(h.registerTool).toHaveBeenCalledTimes(
        USER_TOOL_COUNT + ADMIN_TOOL_COUNT,
      );
    });

    it('should not register the admin tools twice when two admin checks overlap', async () => {
      h.getCurrent.mockResolvedValue({ ...USER, is_admin: true });
      const server = createMcpServer();

      await Promise.all([
        exposeAdminToolsToAdmin(server),
        exposeAdminToolsToAdmin(server),
      ]);

      expect(h.registerTool).toHaveBeenCalledTimes(
        USER_TOOL_COUNT + ADMIN_TOOL_COUNT,
      );
    });
  });

  it('should serve over stdio', async () => {
    await startMcpServer();

    expect(h.StdioServerTransport).toHaveBeenCalledOnce();
    expect(h.connect).toHaveBeenCalledOnce();
  });
});
