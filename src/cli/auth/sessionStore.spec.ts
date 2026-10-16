import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Target import
import {
  clearSession,
  getSessionFilePath,
  readSession,
  writeSession,
} from './sessionStore';

const h = vi.hoisted(() => ({
  mkdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  rename: vi.fn(),
  rm: vi.fn(),
  homedir: vi.fn(() => '/home/tester'),
}));

vi.mock('node:fs/promises', () => ({
  default: {
    mkdir: h.mkdir,
    readFile: h.readFile,
    writeFile: h.writeFile,
    rename: h.rename,
    rm: h.rm,
  },
  mkdir: h.mkdir,
  readFile: h.readFile,
  writeFile: h.writeFile,
  rename: h.rename,
  rm: h.rm,
}));

vi.mock('node:os', () => ({
  default: { homedir: h.homedir },
  homedir: h.homedir,
}));

const session = {
  idToken: 'id-token',
  refreshToken: 'refresh-token',
  expiresAt: 1700000000000,
};

describe('CLI: sessionStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should keep the session inside the user home directory', () => {
    expect(getSessionFilePath()).toBe(
      path.join('/home/tester', '.autodroid', 'session.json'),
    );
  });

  it('should return the stored session', async () => {
    h.readFile.mockResolvedValue(JSON.stringify(session));

    await expect(readSession()).resolves.toEqual(session);
    expect(h.readFile).toHaveBeenCalledWith(getSessionFilePath(), 'utf8');
  });

  it('should report no session when the file is absent', async () => {
    h.readFile.mockRejectedValue(
      Object.assign(new Error('missing'), { code: 'ENOENT' }),
    );

    await expect(readSession()).resolves.toBeNull();
  });

  it('should report no session when the file is unreadable', async () => {
    h.readFile.mockResolvedValue('{ not json');

    await expect(readSession()).resolves.toBeNull();
  });

  it('should store the session readable only by its owner', async () => {
    await writeSession(session);

    expect(h.mkdir).toHaveBeenCalledWith(
      path.join('/home/tester', '.autodroid'),
      { recursive: true, mode: 0o700 },
    );
    expect(h.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(`${getSessionFilePath()}.`),
      JSON.stringify(session, null, 2),
      { mode: 0o600 },
    );
  });

  it('should atomically publish the session via rename from the same temp path it wrote to', async () => {
    await writeSession(session);

    const [tempPath] = h.writeFile.mock.calls[0];
    expect(h.rename).toHaveBeenCalledWith(tempPath, getSessionFilePath());
  });

  it('should use a distinct temp file per write so concurrent writes never race on the same path', async () => {
    await Promise.all([writeSession(session), writeSession(session)]);

    const [firstTempPath] = h.writeFile.mock.calls[0];
    const [secondTempPath] = h.writeFile.mock.calls[1];
    expect(firstTempPath).not.toBe(secondTempPath);
  });

  it('should clean up its temp file when the rename fails, instead of leaving a stray copy of the session on disk', async () => {
    h.rename.mockRejectedValueOnce(new Error('EPERM'));

    await expect(writeSession(session)).rejects.toThrow('EPERM');

    const [tempPath] = h.writeFile.mock.calls[0];
    expect(h.rm).toHaveBeenCalledWith(tempPath, { force: true });
  });

  it('should clean up its temp file when the write itself fails, not just the rename', async () => {
    h.writeFile.mockRejectedValueOnce(new Error('ENOSPC'));

    await expect(writeSession(session)).rejects.toThrow('ENOSPC');

    const [tempPath] = h.writeFile.mock.calls[0];
    expect(h.rm).toHaveBeenCalledWith(tempPath, { force: true });
  });

  it('should still surface the original failure even when the cleanup itself fails', async () => {
    h.rename.mockRejectedValueOnce(new Error('EXDEV'));
    h.rm.mockRejectedValueOnce(new Error('EACCES'));

    await expect(writeSession(session)).rejects.toThrow('EXDEV');
  });

  it('should drop the stored session', async () => {
    await clearSession();

    expect(h.rm).toHaveBeenCalledWith(getSessionFilePath(), { force: true });
  });
});
