import { z } from 'zod';

// GraphQL import
import { PROCESSING_STATUS, PROCESSING_VISIBILITY } from '@gql/graphql';

// Operation import
import { DATE_TIME_DESCRIPTION } from './dateTimeInput';
import { defineOperation } from './defineOperation';
import {
  LIST_PAGE_DESCRIPTION,
  LIST_PAGE_OUTPUT,
  pageInput,
  pageOf,
  pageOfAll,
  projectListPage,
  toPage,
} from './paging';
import { processingFilterInput, processingIdInput } from './processingInput';
import {
  PROCESSING_DETAIL_OUTPUT,
  PROCESSING_OUTPUT,
  PROCESSING_TIME_ESTIMATION_OUTPUT,
  projectProcessing,
  projectProcessingDetail,
  projectProcessingTimeEstimation,
} from './projections';

const adminProcessingOperations = [
  defineOperation({
    name: 'admin_list_processing',
    field: 'adminProcesses',
    command: ['admin', 'processing', 'list'],
    aliases: [['admin', 'processes']],
    description: `List every processing run across all users. ${LIST_PAGE_DESCRIPTION} Requires admin access.`,
    access: 'admin',
    effect: 'read',
    input: {
      ...pageInput,
      userId: z.string().optional().describe('Only runs of this user.'),
      workerId: z.string().optional().describe('Only runs of this worker.'),
      ...processingFilterInput,
      resultFileId: z
        .string()
        .optional()
        .describe('Only the run with this result file.'),
      metricsFileId: z
        .string()
        .optional()
        .describe('Only the run with this metrics file.'),
      createdAtStartDate: z.iso
        .datetime({ offset: true })
        .optional()
        .describe(
          `Only runs created at or after this moment, ${DATE_TIME_DESCRIPTION}.`,
        ),
      createdAtEndDate: z.iso
        .datetime({ offset: true })
        .optional()
        .describe(
          `Only runs created at or before this moment, ${DATE_TIME_DESCRIPTION}.`,
        ),
      keepUntilStartDate: z.iso
        .datetime({ offset: true })
        .optional()
        .describe(
          `Only runs kept until at least this moment, ${DATE_TIME_DESCRIPTION}.`,
        ),
      keepUntilEndDate: z.iso
        .datetime({ offset: true })
        .optional()
        .describe(
          `Only runs kept until at most this moment, ${DATE_TIME_DESCRIPTION}.`,
        ),
      includeArchived: z
        .boolean()
        .optional()
        .describe('Also list deleted (archived) runs.'),
    },
    run: async (sdk, input) =>
      pageOf(
        await sdk.admin.processing.getMany({
          ...toPage(input),
          userId: input.userId,
          workerId: input.workerId,
          datasetId: input.datasetId,
          processorId: input.processorId,
          status: input.status,
          visibility: input.visibility,
          started: input.started,
          finished: input.finished,
          resultFileId: input.resultFileId,
          metricsFileId: input.metricsFileId,
          createdAtStartDate: input.createdAtStartDate,
          createdAtEndDate: input.createdAtEndDate,
          keepUntilStartDate: input.keepUntilStartDate,
          keepUntilEndDate: input.keepUntilEndDate,
          includeArchived: input.includeArchived,
        }),
      ),
    project: page => projectListPage(page, projectProcessing),
    output: LIST_PAGE_OUTPUT,
    itemOutput: PROCESSING_OUTPUT,
  }),
  defineOperation({
    name: 'admin_show_processing',
    field: 'adminProcessing',
    command: ['admin', 'processing', 'show'],
    description:
      'Show one processing run, owned by any user. Requires admin access.',
    access: 'admin',
    effect: 'read',
    input: processingIdInput,
    positionals: ['processingId'],
    run: (sdk, input) =>
      sdk.admin.processing.getOne({ processingId: input.processingId }),
    project: projectProcessingDetail,
    output: PROCESSING_DETAIL_OUTPUT,
  }),
  defineOperation({
    name: 'admin_update_processing',
    field: 'adminProcessingUpdate',
    command: ['admin', 'processing', 'update'],
    description:
      "Change any processing run's keep-until moment and, optionally, its visibility. Requires admin access.",
    access: 'admin',
    effect: 'write',
    input: {
      ...processingIdInput,
      keepUntil: z.iso
        .datetime({ offset: true })
        .describe(`Keep-until moment, ${DATE_TIME_DESCRIPTION}.`),
      visibility: z
        .enum(PROCESSING_VISIBILITY)
        .optional()
        .describe('The new visibility.'),
    },
    positionals: ['processingId'],
    run: (sdk, input) =>
      sdk.admin.processing.update({
        processingId: input.processingId,
        data: { keep_until: input.keepUntil, visibility: input.visibility },
      }),
    project: projectProcessing,
    output: PROCESSING_OUTPUT,
  }),
  defineOperation({
    name: 'admin_delete_processing',
    field: 'adminProcessingDelete',
    command: ['admin', 'processing', 'delete'],
    description: 'Delete any processing run. Requires admin access.',
    access: 'admin',
    effect: 'destructive',
    input: processingIdInput,
    positionals: ['processingId'],
    run: (sdk, input) =>
      sdk.admin.processing.delete({ processingId: input.processingId }),
    project: projectProcessing,
    output: PROCESSING_OUTPUT,
  }),
  defineOperation({
    name: 'admin_clean_expired_processing',
    field: 'adminProcessingCleanExpired',
    command: ['admin', 'processing', 'clean-expired'],
    description:
      'Permanently remove every expired processing run. Requires admin access.',
    access: 'admin',
    effect: 'destructive',
    input: {},
    run: async sdk => ({
      removed: await sdk.admin.processing.cleanExpired({}),
    }),
    output: ['removed'],
  }),
  defineOperation({
    name: 'admin_estimate_processing_time',
    field: 'adminProcessingTimeEstimation',
    command: ['admin', 'processing', 'estimate'],
    description: `Estimate processing durations for a dataset and/or a processor (all combinations when omitted). ${LIST_PAGE_DESCRIPTION} Requires admin access.`,
    access: 'admin',
    effect: 'read',
    input: {
      datasetId: z.string().optional().describe('Limit to this dataset.'),
      processorId: z.string().optional().describe('Limit to this processor.'),
    },
    run: (sdk, input) =>
      sdk.admin.processing.getTimeEstimation({
        datasetId: input.datasetId,
        processorId: input.processorId,
      }),
    project: estimations =>
      projectListPage(pageOfAll(estimations), projectProcessingTimeEstimation),
    output: LIST_PAGE_OUTPUT,
    itemOutput: PROCESSING_TIME_ESTIMATION_OUTPUT,
  }),
  defineOperation({
    name: 'admin_fail_dangling_processing',
    field: 'adminProcessingFailDangling',
    command: ['admin', 'processing', 'fail-dangling'],
    description:
      'Mark processing runs left dangling (not progressing) as failed. Without filters, fails the PENDING runs created more than one day ago. Requires admin access.',
    access: 'admin',
    effect: 'destructive',
    input: {
      createdBefore: z.iso
        .datetime({ offset: true })
        .optional()
        .describe(
          `Only runs created before this moment, ${DATE_TIME_DESCRIPTION}, in the past. Defaults to one day ago.`,
        ),
      status: z
        .enum([PROCESSING_STATUS.PENDING, PROCESSING_STATUS.RUNNING])
        .optional()
        .describe('Only runs in this status. Defaults to PENDING.'),
    },
    run: async (sdk, input) => ({
      failed: await sdk.admin.processing.failDangling({
        createdAtEndDate: input.createdBefore,
        status: input.status,
      }),
    }),
    output: ['failed'],
  }),
];

export { adminProcessingOperations };
