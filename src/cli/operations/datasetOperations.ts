import { z } from 'zod';

// GraphQL import
import type { MIME_TYPE } from '@gql/graphql';

// Operation import
import { readDatasetFile, uploadDatasetFile } from './datasetFile';
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

const datasetOperations = [
  defineOperation({
    name: 'list_datasets',
    field: 'userDatasets',
    command: ['dataset', 'list'],
    aliases: [['datasets']],
    description: `List the datasets you can use: your PRIVATE datasets plus every PUBLIC one (user_id is each owner's id); your datasets under review are not listed. ${LIST_PAGE_DESCRIPTION}`,
    access: 'user',
    effect: 'read',
    input: pageInput,
    run: async (sdk, input) => pageOf(await sdk.dataset.getMany(toPage(input))),
    project: page => projectListPage(page, projectDataset),
    output: LIST_PAGE_OUTPUT,
    itemOutput: DATASET_OUTPUT,
  }),
  defineOperation({
    name: 'show_dataset',
    field: 'userDataset',
    command: ['dataset', 'show'],
    description:
      'Show one dataset, yours or any PUBLIC one, with a download link to its file.',
    access: 'user',
    effect: 'read',
    input: datasetIdInput,
    positionals: ['datasetId'],
    run: (sdk, input) => sdk.dataset.getOne({ datasetId: input.datasetId }),
    project: projectDatasetDetail,
    output: DATASET_DETAIL_OUTPUT,
  }),
  defineOperation({
    name: 'create_dataset',
    field: 'userDatasetCreate',
    command: ['dataset', 'create'],
    description:
      'Create a dataset from a local file: the file is described, registered and uploaded.',
    access: 'user',
    effect: 'write',
    input: {
      filePath: z.string().min(1).describe('Path of the file to upload.'),
      description: z.string().optional().describe('What the dataset contains.'),
      tags: z.string().optional().describe('Comma-separated tags.'),
    },
    run: async (sdk, input) => {
      const file = await readDatasetFile(input.filePath);

      const dataset = await sdk.dataset.create({
        data: {
          description: input.description,
          tags: input.tags,
          filename: file.filename,
          md5_hash: file.md5_hash,
          mime_type: file.mime_type as MIME_TYPE,
          size: file.size,
        },
      });

      try {
        if (!dataset.file.upload_url)
          throw new Error('The API did not return an upload URL.');

        await uploadDatasetFile({ uploadUrl: dataset.file.upload_url, file });
      } catch (error) {
        await sdk.dataset
          .delete({ datasetId: dataset.id })
          .catch(() => undefined);
        throw error;
      }

      return dataset;
    },
    project: projectDataset,
    output: DATASET_OUTPUT,
  }),
  defineOperation({
    name: 'update_dataset',
    field: 'userDatasetUpdate',
    command: ['dataset', 'update'],
    description:
      "Change one of your datasets' description and tags. Replaces both: an omitted one is cleared.",
    access: 'user',
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
      sdk.dataset.update({
        datasetId: input.datasetId,
        data: { description: input.description, tags: input.tags },
      }),
    project: projectDataset,
    output: DATASET_OUTPUT,
  }),
  defineOperation({
    name: 'delete_dataset',
    field: 'userDatasetDelete',
    command: ['dataset', 'delete'],
    description: 'Delete one of your datasets.',
    access: 'user',
    effect: 'destructive',
    input: datasetIdInput,
    positionals: ['datasetId'],
    run: (sdk, input) => sdk.dataset.delete({ datasetId: input.datasetId }),
    project: projectDataset,
    output: DATASET_OUTPUT,
  }),
  defineOperation({
    name: 'publish_dataset',
    field: 'userDatasetRequestPublication',
    command: ['dataset', 'publish'],
    description: 'Ask for one of your datasets to be reviewed for publication.',
    access: 'user',
    effect: 'write',
    input: datasetIdInput,
    positionals: ['datasetId'],
    run: (sdk, input) =>
      sdk.dataset.requestPublication({ datasetId: input.datasetId }),
    project: projectDataset,
    output: DATASET_OUTPUT,
  }),
];

export { datasetOperations };
