import { defineConfig, Options } from 'tsup';

export default defineConfig((options): Options[] => [
  {
    entry: { index: './src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    minify: !options.watch,
  },
  {
    entry: { 'cli/bin': './src/cli/bin.ts' },
    format: ['cjs'],
    outExtension: () => ({ js: '.cjs' }),
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: false,
    minify: !options.watch,
    banner: { js: '#!/usr/bin/env node' },
  },
]);
