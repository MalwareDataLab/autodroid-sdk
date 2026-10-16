import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// eslint-disable-next-line import/no-unresolved -- eslint-import-resolver-typescript doesn't follow the SDK's wildcard "./*" exports map; tsc and Node both resolve this correctly
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
// eslint-disable-next-line import/no-unresolved -- same wildcard-exports resolver limitation as above
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Operation import
import { userAccessOperations } from '../operations/catalog';

const DIST_BIN_PATH = join(
  __dirname,
  '..',
  '..',
  '..',
  'dist',
  'cli',
  'bin.cjs',
);

describe('MCP built artifact (dist/cli/bin.cjs under plain node — the real IDE launch path, zero ts-node)', () => {
  let client: Client;
  let isolatedHome: string;

  beforeEach(() => {
    isolatedHome = mkdtempSync(join(tmpdir(), 'autodroid-mcp-dist-e2e-'));
    client = new Client({
      name: 'autodroid-dist-e2e-client',
      version: '1.0.0',
    });
  });

  afterEach(async () => {
    await client.close();
    rmSync(isolatedHome, { recursive: true, force: true });
  });

  it('serves real tool calls when launched exactly as an IDE would launch it', async () => {
    await client.connect(
      new StdioClientTransport({
        command: 'node',
        args: [DIST_BIN_PATH, 'mcp'],
        env: {
          HOME: isolatedHome,
          PATH: process.env.PATH ?? '',
          AUTODROID_CLI_API_URL:
            'https://autodroid-mcp-dist-e2e.invalid/graphql',
          AUTODROID_CLI_FIREBASE_WEB_API_KEY: 'test-key',
          AUTODROID_CLI_WEB_URL: 'https://autodroid-mcp-dist-e2e.invalid',
        },
      }),
    );

    const { tools } = await client.listTools();
    expect(tools.map(tool => tool.name).sort()).toEqual(
      userAccessOperations
        .map(operation => `autodroid_${operation.name}`)
        .sort(),
    );

    const result = await client.callTool({
      name: 'autodroid_whoami',
      arguments: {},
    });

    expect(result).toEqual({
      isError: true,
      content: [{ type: 'text', text: 'fetch failed' }],
    });
  });
});
