import { z } from 'zod';

// GraphQL import
import { PROCESSING_STATUS, PROCESSING_VISIBILITY } from '@gql/graphql';

const processingIdInput = {
  processingId: z.string().min(1).describe('The processing run id.'),
};

const processingFilterInput = {
  datasetId: z.string().optional().describe('Only runs of this dataset.'),
  processorId: z.string().optional().describe('Only runs of this processor.'),
  status: z
    .enum(PROCESSING_STATUS)
    .optional()
    .describe('Only runs in this status.'),
  visibility: z
    .enum(PROCESSING_VISIBILITY)
    .optional()
    .describe('Only runs with this visibility.'),
  started: z.boolean().optional().describe('Only runs that already started.'),
  finished: z.boolean().optional().describe('Only runs that already finished.'),
};

export { processingFilterInput, processingIdInput };
