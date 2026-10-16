const enabled = (stream: NodeJS.WriteStream) =>
  !!stream.isTTY && !process.env.NO_COLOR;

const wrap =
  (stream: NodeJS.WriteStream, open: string, close: string) =>
  (text: string): string =>
    enabled(stream) ? `[${open}m${text}[${close}m` : text;

const color = {
  red: wrap(process.stderr, '31', '39'),
  green: wrap(process.stdout, '32', '39'),
};

export { color };
