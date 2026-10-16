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

const RUN_ARGS = [
  join(__dirname, '..', '..', '..', 'scripts', 'runCliSource.cjs'),
  'mcp',
];

describe('MCP server (real process, real stdio protocol, zero mocking)', () => {
  let client: Client;
  let isolatedHome: string;

  beforeEach(() => {
    isolatedHome = mkdtempSync(join(tmpdir(), 'autodroid-mcp-e2e-'));
    client = new Client({ name: 'autodroid-e2e-client', version: '1.0.0' });
  });

  afterEach(async () => {
    await client.close();
    rmSync(isolatedHome, { recursive: true, force: true });
  });

  it('lists only the user tools over a real stdio handshake when nobody is signed in', async () => {
    await client.connect(
      new StdioClientTransport({
        command: 'node',
        args: RUN_ARGS,
        env: { HOME: isolatedHome, PATH: process.env.PATH ?? '' },
      }),
    );

    const { tools } = await client.listTools();

    expect(tools.map(tool => tool.name).sort()).toEqual(
      userAccessOperations
        .map(operation => `autodroid_${operation.name}`)
        .sort(),
    );
    expect(
      tools.find(tool => tool.name === 'autodroid_show_processing')?.inputSchema
        .required,
    ).toEqual(['processingId']);
  });

  it('attempts a real browser login retry and surfaces its own failure as a tool error, not a protocol crash', async () => {
    await client.connect(
      new StdioClientTransport({
        command: 'node',
        args: RUN_ARGS,
        env: {
          HOME: isolatedHome,
          PATH: process.env.PATH ?? '',
          AUTODROID_CLI_API_URL: 'https://autodroid-mcp-e2e.invalid/graphql',
          AUTODROID_CLI_FIREBASE_WEB_API_KEY: 'test-key',
          AUTODROID_CLI_WEB_URL: 'https://autodroid-mcp-e2e.invalid',
        },
      }),
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

  it('rejects a tool call for an unregistered tool name', async () => {
    await client.connect(
      new StdioClientTransport({
        command: 'node',
        args: RUN_ARGS,
        env: { HOME: isolatedHome, PATH: process.env.PATH ?? '' },
      }),
    );

    const result = await client.callTool({
      name: 'autodroid_delete_everything',
      arguments: {},
    });

    expect(result.isError).toBe(true);
    expect((result.content as Array<{ text: string }>)[0].text).toContain(
      'autodroid_delete_everything',
    );
  });

  it('refuses a misspelled argument before the tool runs, so a typo cannot clear a dataset description', async () => {
    await client.connect(
      new StdioClientTransport({
        command: 'node',
        args: RUN_ARGS,
        env: {
          HOME: isolatedHome,
          PATH: process.env.PATH ?? '',
          AUTODROID_CLI_API_URL: 'https://autodroid-mcp-e2e.invalid/graphql',
          AUTODROID_CLI_FIREBASE_WEB_API_KEY: 'test-key',
          AUTODROID_CLI_WEB_URL: 'https://autodroid-mcp-e2e.invalid',
        },
      }),
    );

    const result = await client.callTool({
      name: 'autodroid_update_dataset',
      arguments: { datasetId: 'dataset-1', descripton: 'Typo', tags: 'a' },
    });

    expect(result).toEqual({
      isError: true,
      content: [
        {
          type: 'text',
          text: 'MCP error -32602: Input validation error: Invalid arguments for tool autodroid_update_dataset: Unrecognized key: "descripton"',
        },
      ],
    });
  });

  it('rejects a required argument missing from the input schema', async () => {
    await client.connect(
      new StdioClientTransport({
        command: 'node',
        args: RUN_ARGS,
        env: { HOME: isolatedHome, PATH: process.env.PATH ?? '' },
      }),
    );

    const result = await client.callTool({
      name: 'autodroid_show_processing',
      arguments: {},
    });

    expect(result.isError).toBe(true);
    expect((result.content as Array<{ text: string }>)[0].text).toContain(
      'processingId',
    );
  });
});
