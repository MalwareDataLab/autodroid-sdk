import { z } from 'zod';

// GraphQL import
import { PROCESSING_VISIBILITY } from '@gql/graphql';

// Operation import
import { datasetIdInput } from './datasetInput';
import { DATE_TIME_DESCRIPTION } from './dateTimeInput';
import { defineOperation } from './defineOperation';
import {
  LIST_PAGE_DESCRIPTION,
  LIST_PAGE_OUTPUT,
  pageInput,
  pageOf,
  projectListPage,
  toPage,
} from './paging';
import { processingFilterInput, processingIdInput } from './processingInput';
import {
  PROCESSING_DETAIL_OUTPUT,
  PROCESSING_FINISH_ESTIMATION_OUTPUT,
  PROCESSING_OUTPUT,
  PROCESSING_TIME_ESTIMATION_OUTPUT,
  projectProcessing,
  projectProcessingDetail,
  projectProcessingFinishEstimation,
  projectProcessingTimeEstimation,
} from './projections';

const estimationTargetInput = {
  ...datasetIdInput,
  processorId: z.string().min(1).describe('The processor id.'),
};

const processingOperations = [
  defineOperation({
    name: 'list_processing',
    field: 'userProcesses',
    command: ['processing', 'list'],
    aliases: [['processes']],
    description: `List the processing runs you can see: your own and every PUBLIC one (user_id is each owner's id). ${LIST_PAGE_DESCRIPTION}`,
    access: 'user',
    effect: 'read',
    input: {
      ...pageInput,
      ...processingFilterInput,
    },
    run: async (sdk, input) =>
      pageOf(
        await sdk.processing.getMany({
          ...toPage(input),
          datasetId: input.datasetId,
          processorId: input.processorId,
          status: input.status,
          visibility: input.visibility,
          started: input.started,
          finished: input.finished,
        }),
      ),
    project: page => projectListPage(page, projectProcessing),
    output: LIST_PAGE_OUTPUT,
    itemOutput: PROCESSING_OUTPUT,
  }),
  defineOperation({
    name: 'show_processing',
    field: 'userProcessing',
    command: ['processing', 'show'],
    description:
      'Show one processing run, yours or any PUBLIC one, including its status, its dataset and processor, and the download links of its result and metrics files.',
    access: 'user',
    effect: 'read',
    input: processingIdInput,
    positionals: ['processingId'],
    run: (sdk, input) =>
      sdk.processing.getOne({ processingId: input.processingId }),
    project: projectProcessingDetail,
    output: PROCESSING_DETAIL_OUTPUT,
  }),
  defineOperation({
    name: 'run_processing',
    field: 'userRequestDatasetProcessing',
    command: ['processing', 'run'],
    description: 'Start a processing run of a dataset with a processor.',
    access: 'user',
    effect: 'write',
    input: {
      ...estimationTargetInput,
      parameters: z
        .array(z.strictObject({ name: z.string().min(1), value: z.string() }))
        .default([])
        .describe('Processor parameters as name/value pairs.'),
    },
    pairsOption: { key: 'parameters', flag: 'param' },
    run: (sdk, input) =>
      sdk.processing.requestDatasetProcessing({
        data: {
          dataset_id: input.datasetId,
          processor_id: input.processorId,
          parameters: input.parameters,
        },
      }),
    project: projectProcessing,
    output: PROCESSING_OUTPUT,
  }),
  defineOperation({
    name: 'delete_processing',
    field: 'userProcessingDelete',
    command: ['processing', 'delete'],
    description: 'Delete one of your processing runs.',
    access: 'user',
    effect: 'destructive',
    input: processingIdInput,
    positionals: ['processingId'],
    run: (sdk, input) =>
      sdk.processing.delete({ processingId: input.processingId }),
    project: projectProcessing,
    output: PROCESSING_OUTPUT,
  }),
  defineOperation({
    name: 'extend_processing',
    field: 'userProcessingExtendKeepUntil',
    command: ['processing', 'extend'],
    description: 'Keep the files of a processing run until a later date.',
    access: 'user',
    effect: 'write',
    input: {
      ...processingIdInput,
      keepUntil: z.iso
        .datetime({ offset: true })
        .describe(
          `The new keep-until moment, ${DATE_TIME_DESCRIPTION} (e.g. 2030-01-31T00:00:00Z).`,
        ),
    },
    positionals: ['processingId'],
    run: (sdk, input) =>
      sdk.processing.extendKeepUntil({
        processingId: input.processingId,
        keepUntil: input.keepUntil,
      }),
    project: projectProcessing,
    output: PROCESSING_OUTPUT,
  }),
  defineOperation({
    name: 'set_processing_visibility',
    field: 'userProcessingUpdateVisibility',
    command: ['processing', 'set-visibility'],
    description: 'Make a processing run private or public.',
    access: 'user',
    effect: 'write',
    input: {
      ...processingIdInput,
      visibility: z.enum(PROCESSING_VISIBILITY).describe('The new visibility.'),
    },
    positionals: ['processingId', 'visibility'],
    run: (sdk, input) =>
      sdk.processing.updateVisibility({
        processingId: input.processingId,
        visibility: input.visibility,
      }),
    project: projectProcessing,
    output: PROCESSING_OUTPUT,
  }),
  defineOperation({
    name: 'estimate_processing_time',
    field: 'userProcessingTimeEstimation',
    command: ['processing', 'estimate'],
    description:
      "Estimate a processing run's duration before starting it, given a dataset and a processor.",
    access: 'user',
    effect: 'read',
    input: estimationTargetInput,
    run: (sdk, input) =>
      sdk.processing.getExecutionTimeEstimation({
        datasetId: input.datasetId,
        processorId: input.processorId,
      }),
    project: projectProcessingTimeEstimation,
    output: PROCESSING_TIME_ESTIMATION_OUTPUT,
  }),
  defineOperation({
    name: 'estimate_processing_finish',
    field: 'userProcessingEstimatedFinish',
    command: ['processing', 'estimate-finish'],
    description: 'Estimate when an in-progress processing run will finish.',
    access: 'user',
    effect: 'read',
    input: processingIdInput,
    positionals: ['processingId'],
    run: (sdk, input) =>
      sdk.processing.getFinishTimeEstimation({
        processingId: input.processingId,
      }),
    project: projectProcessingFinishEstimation,
    output: PROCESSING_FINISH_ESTIMATION_OUTPUT,
  }),
];

export { processingOperations };
