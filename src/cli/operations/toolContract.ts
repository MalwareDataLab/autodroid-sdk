// Operation import
import { operations } from './catalog';

const buildToolContract = () =>
  operations.map(operation => ({
    name: operation.name,
    field: operation.field,
    description: operation.description,
    access: operation.access,
    effect: operation.effect,
    output: operation.output,
    ...(operation.itemOutput && { itemOutput: operation.itemOutput }),
  }));

export { buildToolContract };
