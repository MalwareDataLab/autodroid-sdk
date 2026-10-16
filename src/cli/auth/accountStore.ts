import fs from 'node:fs/promises';
import path from 'node:path';

// Authentication import
import { getSessionFilePath } from './sessionStore';

const ACCOUNT_FILE_NAME = 'account.json';

const getAccountFilePath = (): string =>
  path.join(path.dirname(getSessionFilePath()), ACCOUNT_FILE_NAME);

const readIsAdmin = async (): Promise<boolean> => {
  try {
    const account = JSON.parse(await fs.readFile(getAccountFilePath(), 'utf8'));
    return account.is_admin === true;
  } catch {
    return false;
  }
};

const writeIsAdmin = async (isAdmin: boolean): Promise<void> => {
  await fs.mkdir(path.dirname(getAccountFilePath()), {
    recursive: true,
    mode: 0o700,
  });
  await fs.writeFile(
    getAccountFilePath(),
    JSON.stringify({ is_admin: isAdmin }),
    { mode: 0o600 },
  );
};

const clearAccount = async (): Promise<void> => {
  await fs.rm(getAccountFilePath(), { force: true });
};

export { clearAccount, getAccountFilePath, readIsAdmin, writeIsAdmin };
