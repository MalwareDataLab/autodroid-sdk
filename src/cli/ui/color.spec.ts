import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Target import
import { color } from './color';

describe('CLI: color', () => {
  let originalStdoutIsTTY: boolean | undefined;
  let originalStderrIsTTY: boolean | undefined;
  let originalNoColor: string | undefined;

  beforeEach(() => {
    originalStdoutIsTTY = process.stdout.isTTY;
    originalStderrIsTTY = process.stderr.isTTY;
    originalNoColor = process.env.NO_COLOR;
    delete process.env.NO_COLOR;
  });

  afterEach(() => {
    Object.defineProperty(process.stdout, 'isTTY', {
      value: originalStdoutIsTTY,
      configurable: true,
    });
    Object.defineProperty(process.stderr, 'isTTY', {
      value: originalStderrIsTTY,
      configurable: true,
    });
    if (originalNoColor === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = originalNoColor;
  });

  const setStdoutTTY = (value: boolean) => {
    Object.defineProperty(process.stdout, 'isTTY', {
      value,
      configurable: true,
    });
  };

  const setStderrTTY = (value: boolean) => {
    Object.defineProperty(process.stderr, 'isTTY', {
      value,
      configurable: true,
    });
  };

  it('should wrap text in the red ANSI code when stderr is attached to a TTY', () => {
    setStderrTTY(true);

    expect(color.red('fail')).toBe('\u001b[31mfail\u001b[39m');
  });

  it('should return red text plain when stderr is not a TTY, even if stdout is', () => {
    setStdoutTTY(true);
    setStderrTTY(false);

    expect(color.red('fail')).toBe('fail');
  });

  it('should wrap text in the green ANSI code when stdout is attached to a TTY', () => {
    setStdoutTTY(true);

    expect(color.green('ok')).toBe('\u001b[32mok\u001b[39m');
  });

  it('should return green text plain when stdout is not a TTY, even if stderr is', () => {
    setStdoutTTY(false);
    setStderrTTY(true);

    expect(color.green('ok')).toBe('ok');
  });

  it('should return plain text when neither stream is a TTY', () => {
    setStdoutTTY(false);
    setStderrTTY(false);

    expect(color.red('fail')).toBe('fail');
    expect(color.green('ok')).toBe('ok');
  });

  it('should return plain text when NO_COLOR is set, even on a TTY', () => {
    setStdoutTTY(true);
    setStderrTTY(true);
    process.env.NO_COLOR = '1';

    expect(color.red('fail')).toBe('fail');
    expect(color.green('ok')).toBe('ok');
  });
});
