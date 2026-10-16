import type { z } from 'zod';

// SDK import
import type { AutoDroidSdk } from '@package';

type OperationAccess = 'user' | 'admin';

type OperationEffect = 'read' | 'write' | 'destructive';

interface IOperation<
  Shape extends z.ZodRawShape = z.ZodRawShape,
  Result = unknown,
> {
  name: string;
  field: string;
  command: string[];
  aliases?: string[][];
  description: string;
  access: OperationAccess;
  effect: OperationEffect;
  input: Shape;
  positionals?: (keyof Shape & string)[];
  pairsOption?: { key: keyof Shape & string; flag: string };
  run: (
    sdk: AutoDroidSdk,
    input: z.infer<z.ZodObject<Shape>>,
  ) => Promise<Result>;
  project?: (result: Result) => unknown;
  output: string[];
  itemOutput?: string[];
  remembersAccount?: boolean;
}

export type { IOperation };
