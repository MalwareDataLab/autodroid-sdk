import { describe } from 'vitest';

// Util import
import {
  connection,
  IOperationCase,
  itBehavesAsItsCases,
  itSaysUpdateReplacesDescriptionAndTags,
  itTakesNullToClear,
  listPage,
  SORTING,
} from '../../../test/support/operationCases';
import {
  DATASET,
  PROJECTED_DATASET,
  PROJECTED_DATASET_DETAIL,
} from '../../../test/support/operationFixtures';

// Target import
import { adminDatasetOperations } from './adminDatasetOperations';

const cases: IOperationCase[] = [
  {
    name: 'admin_list_datasets',
    input: {
      take: 3,
      userId: 'user-1',
      fileId: 'file-1',
      visibility: 'PUBLIC',
      sorting: SORTING,
    },
    call: 'admin.dataset.getMany',
    args: [
      {
        skip: 0,
        take: 3,
        sorting: SORTING,
        userId: 'user-1',
        fileId: 'file-1',
        visibility: 'PUBLIC',
      },
    ],
    answer: connection(DATASET),
    result: listPage(PROJECTED_DATASET),
  },
  {
    name: 'admin_show_dataset',
    input: { datasetId: 'dataset-1' },
    call: 'admin.dataset.getOne',
    args: [{ datasetId: 'dataset-1' }],
    answer: DATASET,
    result: PROJECTED_DATASET_DETAIL,
  },
  {
    name: 'admin_update_dataset',
    input: { datasetId: 'dataset-1', description: 'New', tags: 'c' },
    call: 'admin.dataset.update',
    args: [{ datasetId: 'dataset-1', data: { description: 'New', tags: 'c' } }],
    answer: DATASET,
    result: PROJECTED_DATASET,
  },
  {
    name: 'admin_update_dataset',
    input: { datasetId: 'dataset-1', description: null, tags: null },
    call: 'admin.dataset.update',
    args: [{ datasetId: 'dataset-1', data: { description: null, tags: null } }],
    answer: DATASET,
    result: PROJECTED_DATASET,
  },
  {
    name: 'admin_set_dataset_visibility',
    input: { datasetId: 'dataset-1', visibility: 'PUBLIC' },
    call: 'admin.dataset.updateVisibility',
    args: [{ datasetId: 'dataset-1', data: { visibility: 'PUBLIC' } }],
    answer: DATASET,
    result: PROJECTED_DATASET,
  },
  {
    name: 'admin_delete_dataset',
    input: { datasetId: 'dataset-1' },
    call: 'admin.dataset.delete',
    args: [{ datasetId: 'dataset-1' }],
    answer: DATASET,
    result: PROJECTED_DATASET,
  },
];

describe('Operations: admin dataset', () => {
  itBehavesAsItsCases(adminDatasetOperations, cases);

  itSaysUpdateReplacesDescriptionAndTags(['admin_update_dataset']);

  itTakesNullToClear([
    ['admin_update_dataset', 'description'],
    ['admin_update_dataset', 'tags'],
  ]);
});
