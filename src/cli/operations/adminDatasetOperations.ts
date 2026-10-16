import { z } from 'zod';

// GraphQL import
import { DATASET_VISIBILITY } from '@gql/graphql';

// Operation import
import { datasetIdInput } from './datasetInput';
import { defineOperation } from './defineOperation';
import {
  LIST_PAGE_DESCRIPTION,
  LIST_PAGE_OUTPUT,
  pageInput,
  pageOf,
  projectListPage,
  toPage,
} from './paging';
import {
  DATASET_DETAIL_OUTPUT,
  DATASET_OUTPUT,
  projectDataset,
  projectDatasetDetail,
} from './projections';

const adminDatasetOperations = [
  defineOperation({
    name: 'admin_list_datasets',
    field: 'adminDatasets',
    command: ['admin', 'dataset', 'list'],
    aliases: [['admin', 'datasets']],
    description: `List every dataset across all users. ${LIST_PAGE_DESCRIPTION} Requires admin access.`,
    access: 'admin',
    effect: 'read',
    input: {
      ...pageInput,
      userId: z.string().optional().describe('Only datasets of this user.'),
      fileId: z.string().optional().describe('Only the dataset of this file.'),
      visibility: z
        .enum(DATASET_VISIBILITY)
        .optional()
        .describe('Only datasets with this visibility.'),
    },
    run: async (sdk, input) =>
      pageOf(
        await sdk.admin.dataset.getMany({
          ...toPage(input),
          userId: input.userId,
          fileId: input.fileId,
          visibility: input.visibility,
        }),
      ),
    project: page => projectListPage(page, projectDataset),
    output: LIST_PAGE_OUTPUT,
    itemOutput: DATASET_OUTPUT,
  }),
  defineOperation({
    name: 'admin_show_dataset',
    field: 'adminDataset',
    command: ['admin', 'dataset', 'show'],
    description: 'Show one dataset, owned by any user. Requires admin access.',
    access: 'admin',
    effect: 'read',
    input: datasetIdInput,
    positionals: ['datasetId'],
    run: (sdk, input) =>
      sdk.admin.dataset.getOne({ datasetId: input.datasetId }),
    project: projectDatasetDetail,
    output: DATASET_DETAIL_OUTPUT,
  }),
  defineOperation({
    name: 'admin_update_dataset',
    field: 'adminDatasetUpdate',
    command: ['admin', 'dataset', 'update'],
    description:
      "Change any dataset's description and tags. Replaces both: an omitted one is cleared. Requires admin access.",
    access: 'admin',
    effect: 'write',
    input: {
      ...datasetIdInput,
      description: z
        .string()
        .nullish()
        .describe('The new description; null or an omitted one is cleared.'),
      tags: z
        .string()
        .nullish()
        .describe(
          'The new comma-separated tags; null or omitted tags are cleared.',
        ),
    },
    positionals: ['datasetId'],
    run: (sdk, input) =>
      sdk.admin.dataset.update({
        datasetId: input.datasetId,
        data: { description: input.description, tags: input.tags },
      }),
    project: projectDataset,
    output: DATASET_OUTPUT,
  }),
  defineOperation({
    name: 'admin_set_dataset_visibility',
    field: 'adminDatasetUpdateVisibility',
    command: ['admin', 'dataset', 'set-visibility'],
    description: "Change any dataset's visibility. Requires admin access.",
    access: 'admin',
    effect: 'write',
    input: {
      ...datasetIdInput,
      visibility: z.enum(DATASET_VISIBILITY).describe('The new visibility.'),
    },
    positionals: ['datasetId', 'visibility'],
    run: (sdk, input) =>
      sdk.admin.dataset.updateVisibility({
        datasetId: input.datasetId,
        data: { visibility: input.visibility },
      }),
    project: projectDataset,
    output: DATASET_OUTPUT,
  }),
  defineOperation({
    name: 'admin_delete_dataset',
    field: 'adminDatasetDelete',
    command: ['admin', 'dataset', 'delete'],
    description: 'Delete any dataset. Requires admin access.',
    access: 'admin',
    effect: 'destructive',
    input: datasetIdInput,
    positionals: ['datasetId'],
    run: (sdk, input) =>
      sdk.admin.dataset.delete({ datasetId: input.datasetId }),
    project: projectDataset,
    output: DATASET_OUTPUT,
  }),
];

export { adminDatasetOperations };
