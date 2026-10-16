import { execFile } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

const SDK_ROOT = join(__dirname, '..', '..');
const SCRIPT_PATH = join(SDK_ROOT, 'scripts', 'checkSchemaFreshness.mjs');
const SDK_SCHEMA_PATH = join(SDK_ROOT, 'src', 'api', 'gql', 'schema.graphql');
const SDK_CONTRACT_PATH = join(
  SDK_ROOT,
  'src',
  'cli',
  'operations',
  'toolContract.json',
);

const SCHEMA_DIRECTORY = [
  'packages',
  'api',
  'src',
  'shared',
  'infrastructure',
  'graphql',
  'generated',
];
const CONTRACT_DIRECTORY = ['packages', 'api', 'test', 'fixtures'];

const runCheck = async (backendRoot: string, env: Record<string, string>) => {
  const { CI: _ci, ...inheritedEnv } = process.env;
  try {
    const { stdout, stderr } = await execFileAsync('node', [SCRIPT_PATH], {
      env: {
        ...inheritedEnv,
        BACKEND_SCHEMA_PATH: join(
          backendRoot,
          ...SCHEMA_DIRECTORY,
          'schema.gql',
        ),
        ...env,
      },
    });
    return { code: 0, output: stdout + stderr };
  } catch (error) {
    const failure = error as { code: number; stdout: string; stderr: string };
    return { code: failure.code, output: failure.stdout + failure.stderr };
  }
};

describe('scripts/checkSchemaFreshness.mjs', () => {
  let backendRoot: string;

  beforeEach(() => {
    backendRoot = mkdtempSync(join(tmpdir(), 'autodroid-backend-'));
    mkdirSync(join(backendRoot, ...SCHEMA_DIRECTORY), { recursive: true });
    copyFileSync(
      SDK_SCHEMA_PATH,
      join(backendRoot, ...SCHEMA_DIRECTORY, 'schema.gql'),
    );
  });

  afterEach(() => {
    rmSync(backendRoot, { recursive: true, force: true });
  });

  it('should say the contract check was skipped, never that it matches, when the backend has no contract copy', async () => {
    const result = await runCheck(backendRoot, {});

    expect(result.code).toBe(0);
    expect(result.output).toContain(
      'MCP tool contract check skipped: not found',
    );
    expect(result.output).not.toContain("matches the backend's copy");
  });

  it('should fail in CI when the backend has no contract copy, and name the release order', async () => {
    const result = await runCheck(backendRoot, { CI: 'true' });

    expect(result.code).toBe(1);
    expect(result.output).toContain(
      'MCP tool contract check skipped: not found',
    );
    expect(result.output).toContain('Release order');
    expect(result.output).not.toContain("matches the backend's copy");
  });

  it("should confirm the contract matches when the backend's copy is identical", async () => {
    mkdirSync(join(backendRoot, ...CONTRACT_DIRECTORY), { recursive: true });
    copyFileSync(
      SDK_CONTRACT_PATH,
      join(backendRoot, ...CONTRACT_DIRECTORY, 'mcpToolContract.json'),
    );

    const result = await runCheck(backendRoot, { CI: 'true' });

    expect(result.code).toBe(0);
    expect(result.output).toContain(
      "MCP tool contract matches the backend's copy.",
    );
  });

  it("should fail when the backend's copy differs", async () => {
    mkdirSync(join(backendRoot, ...CONTRACT_DIRECTORY), { recursive: true });
    copyFileSync(
      SDK_SCHEMA_PATH,
      join(backendRoot, ...CONTRACT_DIRECTORY, 'mcpToolContract.json'),
    );

    const result = await runCheck(backendRoot, {});

    expect(result.code).toBe(1);
    expect(result.output).toContain(
      "The backend's copy of the MCP tool contract differs from the SDK's.",
    );
  });
});
