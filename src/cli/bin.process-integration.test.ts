import { execFile } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const BIN_PATH = join(__dirname, '..', '..', 'dist', 'cli', 'bin.cjs');

const paginationConnection = (nodes: Record<string, unknown>[]) => ({
  edges: nodes.map(node => ({ node })),
  totalCount: 7,
  pageInfo: { hasNextPage: true },
});

const PROCESSING_DETAIL = {
  id: 'processing-1',
  status: 'SUCCEEDED',
  dataset: { id: 'dataset-1', description: 'Drebin Android Malware Dataset' },
  processor: { id: 'processor-1', name: 'DroidAugmentor' },
};

const GRAPHQL_HANDLERS: Record<
  string,
  (variables?: Record<string, unknown>) => Record<string, unknown>
> = {
  'query User': () => ({
    user: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.test' },
  }),
  'query UserDatasets': () => ({
    userDatasets: paginationConnection([
      { id: 'dataset-1', description: 'Drebin Android Malware Dataset' },
    ]),
  }),
  'query UserProcessors': () => ({
    userProcessors: paginationConnection([
      {
        id: 'processor-1',
        name: 'DroidAugmentor',
        version: '0.0.1',
        configuration: { parameters: [] },
      },
    ]),
  }),
  'query UserProcesses': () => ({
    userProcesses: paginationConnection([
      { id: 'processing-1', status: 'SUCCEEDED' },
    ]),
  }),
  'query UserProcessing': (variables: Record<string, unknown> = {}) => {
    if (variables.processingId === 'does-not-exist') {
      throw Object.assign(new Error('GraphQL error'), {
        graphqlErrors: [{ message: 'Processing not found.' }],
      });
    }
    return { userProcessing: PROCESSING_DETAIL };
  },
  'query UserProcessingTimeEstimation': () => ({
    userProcessingTimeEstimation: {
      estimated_execution_time: 120,
      estimated_total_time: 180,
      estimated_waiting_time: 60,
    },
  }),
  'query UserProcessingEstimatedFinish': () => ({
    userProcessingEstimatedFinish: {
      estimated_start_time: '2099-01-01T00:00:00.000Z',
      estimated_finish_time: '2099-01-01T02:00:00.000Z',
    },
  }),
  'mutation UserUpdateData': () => ({
    userUpdateData: { id: 'user-1', name: 'Ada L.' },
  }),
  'mutation UserRequestDatasetProcessing': () => ({
    userRequestDatasetProcessing: { id: 'processing-2', status: 'PENDING' },
  }),
};

const startGraphqlStub = () =>
  new Promise<{ server: http.Server; url: string }>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        const parsed = JSON.parse(body || '{}');
        const query = typeof parsed.query === 'string' ? parsed.query : '';
        const operation = query.match(/(?:query|mutation)\s+(\w+)/);
        const key = operation
          ? `${query.trim().startsWith('mutation') ? 'mutation' : 'query'} ${operation[1]}`
          : undefined;
        const handler = key ? GRAPHQL_HANDLERS[key] : undefined;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        if (!handler) {
          res.end(
            JSON.stringify({
              errors: [{ message: `Unexpected operation for query: ${query}` }],
            }),
          );
          return;
        }
        try {
          res.end(JSON.stringify({ data: handler(parsed.variables) }));
        } catch (error: any) {
          res.end(
            JSON.stringify({
              errors: error.graphqlErrors ?? [{ message: error.message }],
            }),
          );
        }
      });
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number };
      resolve({ server, url: `http://127.0.0.1:${port}/graphql` });
    });
  });

const buildFixtureSession = (homeDir: string) => {
  const futureExpirySeconds = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(
    JSON.stringify({ exp: futureExpirySeconds }),
  ).toString('base64url');
  const sessionDir = join(homeDir, '.autodroid');
  mkdirSync(sessionDir, { recursive: true, mode: 0o700 });
  writeFileSync(
    join(sessionDir, 'session.json'),
    JSON.stringify({
      idToken: `header.${payload}.signature`,
      refreshToken: 'fixture-refresh-token',
      expiresAt: futureExpirySeconds * 1000,
    }),
    { mode: 0o600 },
  );
};

describe('CLI dist artifact (real built bin.cjs, real spawned process, stub GraphQL backend)', () => {
  let server: http.Server;
  let apiUrl: string;
  let isolatedHome: string;

  beforeAll(async () => {
    ({ server, url: apiUrl } = await startGraphqlStub());
  });

  afterAll(() => {
    server?.close();
  });

  afterEach(() => {
    rmSync(isolatedHome, { recursive: true, force: true });
  });

  const runCli = (args: string[], authenticated = true) => {
    isolatedHome = mkdtempSync(join(tmpdir(), 'autodroid-cli-e2e-'));
    if (authenticated) buildFixtureSession(isolatedHome);

    return execFileAsync('node', [BIN_PATH, ...args], {
      env: {
        ...process.env,
        HOME: isolatedHome,
        AUTODROID_CLI_API_URL: apiUrl,
        AUTODROID_CLI_FIREBASE_WEB_API_KEY: 'test-key',
        AUTODROID_CLI_WEB_URL: 'https://autodroid-cli-test.invalid',
      },
    });
  };

  it('should print the signed-in user the stub backend returns, as JSON, for whoami --json', async () => {
    const { stdout } = await runCli(['whoami', '--json']);
    expect(JSON.parse(stdout)).toEqual({
      id: 'user-1',
      name: 'Ada Lovelace',
      email: 'ada@example.test',
    });
  });

  it("should list the stub backend's datasets as a human-readable table for datasets", async () => {
    const { stdout } = await runCli(['datasets']);
    expect(stdout).toContain('dataset-1');
    expect(stdout).toContain('Drebin Android Malware Dataset');
    expect(stdout).toContain('Showing 1 of 7.');
  });

  it("should list the stub backend's processors as one page for processor list --json", async () => {
    const { stdout } = await runCli(['processor', 'list', '--json']);
    expect(JSON.parse(stdout)).toEqual({
      items: [
        expect.objectContaining({
          id: 'processor-1',
          name: 'DroidAugmentor',
          version: '0.0.1',
        }),
      ],
      total_count: 7,
      has_next_page: true,
    });
  });

  it("should list the stub backend's processing runs as one page for processes --json", async () => {
    const { stdout } = await runCli(['processes', '--json']);
    expect(JSON.parse(stdout)).toEqual({
      items: [
        expect.objectContaining({ id: 'processing-1', status: 'SUCCEEDED' }),
      ],
      total_count: 7,
      has_next_page: true,
    });
  });

  it("should show the stub backend's processing run and its processor for processing show <id>", async () => {
    const { stdout } = await runCli([
      'processing',
      'show',
      'processing-1',
      '--json',
    ]);
    expect(JSON.parse(stdout)).toEqual(
      expect.objectContaining({
        id: 'processing-1',
        status: 'SUCCEEDED',
        processor: { id: 'processor-1', name: 'DroidAugmentor' },
      }),
    );
  });

  it("should print the stub backend's time estimate for processing estimate", async () => {
    const { stdout } = await runCli([
      'processing',
      'estimate',
      '--dataset-id',
      'dataset-1',
      '--processor-id',
      'processor-1',
      '--json',
    ]);
    expect(JSON.parse(stdout)).toEqual({
      estimated_execution_time: 120,
      estimated_total_time: 180,
      estimated_waiting_time: 60,
    });
  });

  it("should print the stub backend's finish estimate for processing estimate-finish <id>", async () => {
    const { stdout } = await runCli([
      'processing',
      'estimate-finish',
      'processing-1',
      '--json',
    ]);
    expect(JSON.parse(stdout)).toEqual({
      estimated_start_time: '2099-01-01T00:00:00.000Z',
      estimated_finish_time: '2099-01-01T02:00:00.000Z',
    });
  });

  it('should start a processing run on the stub backend with a repeatable --param for processing run', async () => {
    const { stdout } = await runCli([
      'processing',
      'run',
      '--dataset-id',
      'dataset-1',
      '--processor-id',
      'processor-1',
      '--param',
      'epochs=10',
      '--json',
    ]);
    expect(JSON.parse(stdout)).toEqual({
      id: 'processing-2',
      status: 'PENDING',
    });
  });

  it('should print the profile the stub backend returns after profile update', async () => {
    const { stdout } = await runCli([
      'profile',
      'update',
      '--name',
      'Ada L.',
      '--json',
    ]);
    expect(JSON.parse(stdout)).toEqual({ id: 'user-1', name: 'Ada L.' });
  });

  it("should reject an invalid --param without an '=' with a clean error and no stack trace", async () => {
    await expect(
      runCli([
        'processing',
        'run',
        '--dataset-id',
        'dataset-1',
        '--processor-id',
        'processor-1',
        '--param',
        'epochs',
      ]),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining(
        'Invalid --param "epochs", expected name=value.',
      ),
    });
  });

  it('should report not being authenticated when no session is stored, not crash', async () => {
    await expect(runCli(['whoami'], false)).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('Not authenticated'),
    });
  });

  it('should reject an unknown processing subcommand cleanly, with no stack trace', async () => {
    await expect(
      runCli(['processing', 'does-not-exist', '--json']),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.not.stringContaining(' at '),
    });
  });
});
