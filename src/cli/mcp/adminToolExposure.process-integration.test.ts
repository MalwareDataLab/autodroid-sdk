import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// eslint-disable-next-line import/no-unresolved -- eslint-import-resolver-typescript doesn't follow the SDK's wildcard "./*" exports map; tsc and Node both resolve this correctly
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
// eslint-disable-next-line import/no-unresolved -- same wildcard-exports resolver limitation as above
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Operation import
import { operations, userAccessOperations } from '../operations/catalog';

const RUN_ARGS = [
  join(__dirname, '..', '..', '..', 'scripts', 'runCliSource.cjs'),
  'mcp',
];

const USER_TOOL_COUNT = userAccessOperations.length;
const ALL_TOOL_COUNT = operations.length;

const writeFixtureSession = (
  homeDir: string,
  refreshToken = 'fixture-refresh-token',
) => {
  const expiresAtSeconds = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(
    JSON.stringify({ exp: expiresAtSeconds }),
  ).toString('base64url');
  mkdirSync(join(homeDir, '.autodroid'), { recursive: true, mode: 0o700 });
  writeFileSync(
    join(homeDir, '.autodroid', 'session.json'),
    JSON.stringify({
      idToken: `header.${payload}.signature`,
      refreshToken,
      expiresAt: expiresAtSeconds * 1000,
    }),
    { mode: 0o600 },
  );
};

const startBackendStub = (initialIsAdmin: boolean, failingUserQueries = 0) =>
  new Promise<{
    server: http.Server;
    url: string;
    userQueryCount: () => number;
    setIsAdmin: (isAdmin: boolean) => void;
  }>(resolve => {
    let userQueries = 0;
    let isAdmin = initialIsAdmin;
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        const query: string = JSON.parse(body || '{}').query ?? '';
        if (/query\s+User\b/.test(query)) userQueries += 1;

        if (userQueries <= failingUserQueries) {
          res.writeHead(503, { 'Content-Type': 'text/plain' });
          res.end('Service Unavailable');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            data: {
              user: {
                id: 'user-1',
                name: 'Ada Lovelace',
                email: 'ada@example.test',
                is_admin: isAdmin,
                language: 'en-us',
              },
            },
          }),
        );
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        server,
        url: `http://127.0.0.1:${port}/graphql`,
        userQueryCount: () => userQueries,
        setIsAdmin: nextIsAdmin => {
          isAdmin = nextIsAdmin;
        },
      });
    });
  });

describe('MCP server admin tool exposure (real process, real stdio protocol, stub backend)', () => {
  let client: Client;
  let isolatedHome: string;
  let stub: Awaited<ReturnType<typeof startBackendStub>>;

  beforeEach(() => {
    isolatedHome = mkdtempSync(join(tmpdir(), 'autodroid-mcp-admin-'));
    writeFixtureSession(isolatedHome);
    client = new Client({ name: 'autodroid-admin-client', version: '1.0.0' });
  });

  afterEach(async () => {
    await client.close();
    stub.server.closeAllConnections();
    stub.server.close();
    rmSync(isolatedHome, { recursive: true, force: true });
  });

  const connect = () =>
    client.connect(
      new StdioClientTransport({
        command: 'node',
        args: RUN_ARGS,
        env: {
          HOME: isolatedHome,
          PATH: process.env.PATH ?? '',
          AUTODROID_CLI_API_URL: stub.url,
          AUTODROID_CLI_FIREBASE_WEB_API_KEY: 'fixture-firebase-key',
          AUTODROID_CLI_WEB_URL: 'https://autodroid-cli-test.invalid',
        },
      }),
    );

  it('should offer the admin tools to a signed-in admin', async () => {
    stub = await startBackendStub(true);

    await connect();

    await vi.waitFor(
      async () =>
        expect((await client.listTools()).tools).toHaveLength(ALL_TOOL_COUNT),
      { timeout: 20000, interval: 200 },
    );
    expect((await client.listTools()).tools.map(tool => tool.name)).toContain(
      'autodroid_admin_list_workers',
    );
  }, 30000);

  it('should offer the admin tools on the next tool call once the startup check failed transiently', async () => {
    stub = await startBackendStub(true, 1);
    await connect();
    await vi.waitFor(() => expect(stub.userQueryCount()).toBe(1), {
      timeout: 20000,
      interval: 100,
    });
    expect((await client.listTools()).tools).toHaveLength(USER_TOOL_COUNT);

    const whoami = await client.callTool({
      name: 'autodroid_whoami',
      arguments: {},
    });

    expect(whoami.isError).toBeUndefined();
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(ALL_TOOL_COUNT);
    expect(tools.map(tool => tool.name)).toContain(
      'autodroid_admin_list_workers',
    );
  }, 30000);

  it('should follow a sign-in made outside the server: offer the admin tools to a new admin session, then withdraw them for a non-admin one', async () => {
    stub = await startBackendStub(false);
    await connect();
    await vi.waitFor(() => expect(stub.userQueryCount()).toBe(1), {
      timeout: 20000,
      interval: 100,
    });

    writeFixtureSession(isolatedHome, 'admin-refresh-token');
    stub.setIsAdmin(true);
    await client.callTool({ name: 'autodroid_whoami', arguments: {} });

    expect((await client.listTools()).tools).toHaveLength(ALL_TOOL_COUNT);

    writeFixtureSession(isolatedHome, 'user-refresh-token');
    stub.setIsAdmin(false);
    await client.callTool({ name: 'autodroid_whoami', arguments: {} });

    const { tools } = await client.listTools();
    expect(tools).toHaveLength(USER_TOOL_COUNT);
    expect(tools.some(tool => tool.name.startsWith('autodroid_admin_'))).toBe(
      false,
    );
  }, 30000);

  it('should never offer the admin tools to a signed-in user who is not an admin', async () => {
    stub = await startBackendStub(false);

    await connect();

    await vi.waitFor(() => expect(stub.userQueryCount()).toBeGreaterThan(0), {
      timeout: 20000,
      interval: 100,
    });
    const { tools } = await client.listTools();

    expect(tools).toHaveLength(USER_TOOL_COUNT);
    expect(tools.some(tool => tool.name.startsWith('autodroid_admin_'))).toBe(
      false,
    );
  }, 30000);
});
