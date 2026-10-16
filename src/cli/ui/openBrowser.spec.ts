import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Target import
import { openBrowser } from './openBrowser';

const h = vi.hoisted(() => ({ spawn: vi.fn() }));

vi.mock('node:child_process', () => ({ spawn: h.spawn }));

describe('CLI: openBrowser', () => {
  let child: EventEmitter & { unref: ReturnType<typeof vi.fn> };
  let originalPlatform: NodeJS.Platform;

  beforeEach(() => {
    child = Object.assign(new EventEmitter(), { unref: vi.fn() });
    h.spawn.mockReturnValue(child);
    originalPlatform = process.platform;
  });

  const setPlatform = (platform: NodeJS.Platform) => {
    Object.defineProperty(process, 'platform', {
      value: platform,
      configurable: true,
    });
  };

  afterEach(() => {
    setPlatform(originalPlatform);
  });

  it('should open the url with `open` on macOS', () => {
    setPlatform('darwin');

    openBrowser('https://app.example.test/cli/authorize?challenge=abc');

    expect(h.spawn).toHaveBeenCalledWith(
      'open',
      ['https://app.example.test/cli/authorize?challenge=abc'],
      { detached: true, stdio: 'ignore' },
    );
    expect(child.unref).toHaveBeenCalledOnce();
  });

  it('should open the url with `cmd /c start` on Windows', () => {
    setPlatform('win32');

    openBrowser('https://app.example.test/cli/authorize?challenge=abc');

    expect(h.spawn).toHaveBeenCalledWith(
      'cmd',
      [
        '/c',
        'start',
        '""',
        'https://app.example.test/cli/authorize?challenge=abc',
      ],
      { detached: true, stdio: 'ignore' },
    );
  });

  it('should open the url with `xdg-open` on linux', () => {
    setPlatform('linux');

    openBrowser('https://app.example.test/cli/authorize?challenge=abc');

    expect(h.spawn).toHaveBeenCalledWith(
      'xdg-open',
      ['https://app.example.test/cli/authorize?challenge=abc'],
      { detached: true, stdio: 'ignore' },
    );
  });

  it('should swallow a spawn failure instead of crashing', () => {
    setPlatform('linux');

    expect(() => openBrowser('https://app.example.test')).not.toThrow();

    expect(() => child.emit('error', new Error('ENOENT'))).not.toThrow();
  });
});
