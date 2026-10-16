// Type import
import type { IOperation } from './types';

// Operation import
import { adminDatasetOperations } from './adminDatasetOperations';
import { adminFileOperations } from './adminFileOperations';
import { adminProcessingOperations } from './adminProcessingOperations';
import { adminProcessorOperations } from './adminProcessorOperations';
import { adminWorkerOperations } from './adminWorkerOperations';
import { datasetOperations } from './datasetOperations';
import { healthOperations } from './healthOperations';
import { processingOperations } from './processingOperations';
import { processorOperations } from './processorOperations';
import { userOperations } from './userOperations';

const operations: IOperation[] = [
  ...userOperations,
  ...datasetOperations,
  ...processorOperations,
  ...processingOperations,
  ...healthOperations,
  ...adminDatasetOperations,
  ...adminProcessorOperations,
  ...adminProcessingOperations,
  ...adminWorkerOperations,
  ...adminFileOperations,
];

const userAccessOperations = operations.filter(
  operation => operation.access === 'user',
);

const adminAccessOperations = operations.filter(
  operation => operation.access === 'admin',
);

export { adminAccessOperations, operations, userAccessOperations };
