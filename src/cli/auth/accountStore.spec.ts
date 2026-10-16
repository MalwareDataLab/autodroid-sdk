import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  mkdirSync,
  statSync,
} from 'node:fs';
import os from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Target import
import {
  clearAccount,
  getAccountFilePath,
  readIsAdmin,
  writeIsAdmin,
} from './accountStore';

describe('CLI: accountStore', () => {
  let home: string;

  beforeEach(() => {
    home = mkdtempSync(join(os.tmpdir(), 'autodroid-account-'));
    vi.spyOn(os, 'homedir').mockReturnValue(home);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(home, { recursive: true, force: true });
  });

  it('should keep the account file next to the session file', () => {
    expect(getAccountFilePath()).toBe(join(home, '.autodroid', 'account.json'));
  });

  it('should treat a missing file as not an admin', async () => {
    await expect(readIsAdmin()).resolves.toBe(false);
  });

  it('should remember an admin and a non-admin', async () => {
    await writeIsAdmin(true);
    await expect(readIsAdmin()).resolves.toBe(true);

    await writeIsAdmin(false);
    await expect(readIsAdmin()).resolves.toBe(false);
  });

  it('should write the file readable by its owner only', async () => {
    await writeIsAdmin(true);

    // eslint-disable-next-line no-bitwise -- file mode bits are a bitmask
    expect(statSync(getAccountFilePath()).mode & 0o777).toBe(0o600);
  });

  it.each(['not json', '{}', '{"is_admin":"yes"}', 'null'])(
    'should treat a corrupt file (%s) as not an admin',
    async content => {
      mkdirSync(join(home, '.autodroid'), { recursive: true });
      writeFileSync(getAccountFilePath(), content);

      await expect(readIsAdmin()).resolves.toBe(false);
    },
  );

  it('should forget the account, and not fail when there is none', async () => {
    await writeIsAdmin(true);

    await clearAccount();
    await expect(readIsAdmin()).resolves.toBe(false);
    await expect(clearAccount()).resolves.toBeUndefined();
  });
});
