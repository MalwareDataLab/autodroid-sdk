// eslint-disable-next-line import/no-unresolved -- eslint-import-resolver-typescript doesn't follow the SDK's wildcard "./*" exports map; tsc and Node both resolve this correctly
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// eslint-disable-next-line import/no-unresolved -- same wildcard-exports resolver limitation as above
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
// eslint-disable-next-line import/no-unresolved -- same wildcard-exports resolver limitation as above
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Context import
import { isNotAuthenticatedError } from '../context';

// Type import
import type { IOperation } from '../operations/types';

// Data import
import { version } from '../../../package.json';

// Authentication import
import { readSession } from '../auth/sessionStore';

// Operation import
import {
  adminAccessOperations,
  userAccessOperations,
} from '../operations/catalog';

// UI import
import { presentBrowserLogin } from '../ui/presentBrowserLogin';

// CLI import
import { getSdk } from '../commands';
import { toErrorMessage } from '../errorMessage';

const SERVER_NAME = 'autodroid';
const SERVER_VERSION = version;
const TOOL_NAME_PREFIX = 'autodroid_';

const toToolResult = (result: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
});

const annotationsFor = (operation: IOperation) => ({
  readOnlyHint: operation.effect === 'read',
  destructiveHint: operation.effect === 'destructive',
  openWorldHint: false,
});

interface IAdminToolsCheckOptions {
  withdrawWhenUnsure?: boolean;
  onlyWhenSessionChanged?: boolean;
}

const runOperation = async (
  operation: IOperation,
  input: Record<string, unknown>,
) => {
  const result = await operation.run(getSdk(), input as never);
  return toToolResult(operation.project ? operation.project(result) : result);
};

const registerOperation = (
  server: McpServer,
  operation: IOperation,
  checkAdminTools: (
    owner: McpServer,
    options?: IAdminToolsCheckOptions,
  ) => Promise<void>,
): RegisteredTool =>
  server.registerTool<z.ZodRawShape, z.ZodObject>(
    `${TOOL_NAME_PREFIX}${operation.name}`,
    {
      description: operation.description,
      inputSchema: z.strictObject(operation.input),
      annotations: annotationsFor(operation),
    },
    async (input: Record<string, unknown>) => {
      await checkAdminTools(server, { onlyWhenSessionChanged: true });
      try {
        return await runOperation(operation, input || {});
      } catch (error) {
        if (isNotAuthenticatedError(error)) {
          try {
            await presentBrowserLogin();
            try {
              return await runOperation(operation, input || {});
            } finally {
              checkAdminTools(server);
            }
          } catch (retryError) {
            return {
              isError: true,
              content: [{ type: 'text', text: toErrorMessage(retryError) }],
            };
          }
        }

        return {
          isError: true,
          content: [{ type: 'text', text: toErrorMessage(error) }],
        };
      }
    },
  );

const adminToolsByServer = new WeakMap<McpServer, RegisteredTool[]>();

const checkedSessionByServer = new WeakMap<McpServer, string | undefined>();

const readSessionIdentity = async (): Promise<string | undefined> =>
  (await readSession())?.refreshToken;

const withdrawAdminTools = (server: McpServer): void => {
  adminToolsByServer.get(server)?.forEach(tool => tool.remove());
  adminToolsByServer.delete(server);
};

const exposeAdminToolsToAdmin = async (
  server: McpServer,
  {
    withdrawWhenUnsure = true,
    onlyWhenSessionChanged = false,
  }: IAdminToolsCheckOptions = {},
): Promise<void> => {
  const sessionIdentity = await readSessionIdentity();
  if (
    onlyWhenSessionChanged &&
    sessionIdentity === checkedSessionByServer.get(server)
  )
    return;

  try {
    const user = await getSdk().user.getCurrent();
    const offered = adminToolsByServer.get(server);

    if (user.is_admin && !offered) {
      adminToolsByServer.set(
        server,
        adminAccessOperations.map(operation =>
          registerOperation(server, operation, exposeAdminToolsToAdmin),
        ),
      );
    } else if (!user.is_admin && offered) {
      withdrawAdminTools(server);
    }
    checkedSessionByServer.set(server, sessionIdentity);
  } catch {
    checkedSessionByServer.delete(server);
    if (withdrawWhenUnsure) withdrawAdminTools(server);
  }
};

const createMcpServer = (): McpServer => {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  userAccessOperations.forEach(operation =>
    registerOperation(server, operation, exposeAdminToolsToAdmin),
  );

  return server;
};

const startMcpServer = async (): Promise<void> => {
  const server = createMcpServer();
  await server.connect(new StdioServerTransport());
  await exposeAdminToolsToAdmin(server, { withdrawWhenUnsure: false });
};

export { createMcpServer, exposeAdminToolsToAdmin, startMcpServer };
