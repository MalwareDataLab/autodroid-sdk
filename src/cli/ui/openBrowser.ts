import { spawn } from 'node:child_process';

const OPEN_COMMAND_BY_PLATFORM: Partial<Record<NodeJS.Platform, string>> = {
  darwin: 'open',
  win32: 'cmd',
};

const openBrowser = (url: string): void => {
  const command = OPEN_COMMAND_BY_PLATFORM[process.platform] ?? 'xdg-open';
  const args =
    process.platform === 'win32' ? ['/c', 'start', '""', url] : [url];

  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.on('error', () => {});
  child.unref();
};

export { openBrowser };
