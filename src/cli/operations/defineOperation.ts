import type { z } from 'zod';

// Type import
import type { IOperation } from './types';

const defineOperation = <Shape extends z.ZodRawShape, Result>(
  operation: IOperation<Shape, Result>,
): IOperation => operation as unknown as IOperation;

export { defineOperation };
