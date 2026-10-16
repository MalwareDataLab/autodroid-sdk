import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Target import
import { withSpinner } from './withSpinner';

const h = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  spinner: vi.fn(),
}));

vi.mock('@clack/prompts', () => ({
  spinner: h.spinner,
}));

describe('CLI: withSpinner', () => {
  let originalIsTTY: boolean | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    originalIsTTY = process.stdout.isTTY;
    h.spinner.mockReturnValue({ start: h.start, stop: h.stop });
  });

  afterEach(() => {
    Object.defineProperty(process.stdout, 'isTTY', {
      value: originalIsTTY,
      configurable: true,
    });
  });

  it('should run the task directly when not attached to a TTY', async () => {
    Object.defineProperty(process.stdout, 'isTTY', {
      value: false,
      configurable: true,
    });
    const task = vi.fn().mockResolvedValue('result');

    await expect(withSpinner('Loading...', task)).resolves.toBe('result');
    expect(h.spinner).not.toHaveBeenCalled();
  });

  it('should show a spinner around the task in a TTY', async () => {
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      configurable: true,
    });
    const task = vi.fn().mockResolvedValue('result');

    await expect(withSpinner('Loading...', task)).resolves.toBe('result');
    expect(h.start).toHaveBeenCalledWith('Loading...');
    expect(h.stop).toHaveBeenCalledWith('Loading...');
  });

  it('should stop the spinner with an error state when the task fails', async () => {
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      configurable: true,
    });
    const task = vi.fn().mockRejectedValue(new Error('boom'));

    await expect(withSpinner('Loading...', task)).rejects.toThrow('boom');
    expect(h.stop).toHaveBeenCalledWith('Loading...', 2);
  });
});
