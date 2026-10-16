import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

// Authentication import
import { IFirebaseSession } from './firebaseSession';

const SESSION_DIRECTORY_NAME = '.autodroid';
const SESSION_FILE_NAME = 'session.json';

const getSessionDirectoryPath = (): string =>
  path.join(os.homedir(), SESSION_DIRECTORY_NAME);

const getSessionFilePath = (): string =>
  path.join(getSessionDirectoryPath(), SESSION_FILE_NAME);

const readSession = async (): Promise<IFirebaseSession | null> => {
  try {
    const content = await fs.readFile(getSessionFilePath(), 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
};

const writeSession = async (session: IFirebaseSession): Promise<void> => {
  const filePath = getSessionFilePath();
  const tempPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;

  await fs.mkdir(getSessionDirectoryPath(), { recursive: true, mode: 0o700 });
  try {
    await fs.writeFile(tempPath, JSON.stringify(session, null, 2), {
      mode: 0o600,
    });
    await fs.rename(tempPath, filePath);
  } catch (error) {
    try {
      await fs.rm(tempPath, { force: true });
    } catch {}
    throw error;
  }
};

const clearSession = async (): Promise<void> => {
  await fs.rm(getSessionFilePath(), { force: true });
};

export { clearSession, getSessionFilePath, readSession, writeSession };
