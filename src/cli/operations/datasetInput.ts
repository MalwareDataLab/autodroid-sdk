import { z } from 'zod';

const datasetIdInput = {
  datasetId: z.string().min(1).describe('The dataset id.'),
};

export { datasetIdInput };
