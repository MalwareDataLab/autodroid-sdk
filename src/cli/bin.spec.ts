import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({ runCli: vi.fn() }));

vi.mock('./index', () => ({ runCli: h.runCli }));

describe('CLI: bin', () => {
  let originalArgv: string[];

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.exitCode = undefined;
    originalArgv = process.argv;
    process.argv = ['node', 'bin', 'whoami'];
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('should run the parsed arguments and forward the exit code', async () => {
    h.runCli.mockResolvedValue(1);

    await import('./bin');

    await vi.waitFor(() => expect(h.runCli).toHaveBeenCalledWith(['whoami']));
    await vi.waitFor(() => expect(process.exitCode).toBe(1));
  });

  it('should forward a successful exit code', async () => {
    h.runCli.mockResolvedValue(0);

    await import('./bin');

    await vi.waitFor(() => expect(process.exitCode).toBe(0));
  });
});
