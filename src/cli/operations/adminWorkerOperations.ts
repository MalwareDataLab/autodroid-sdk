import { z } from 'zod';

// Operation import
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
import {
  REGISTRATION_TOKEN_OUTPUT,
  REGISTRATION_TOKEN_WITHOUT_VALUE_OUTPUT,
  WORKER_OUTPUT,
  projectRegistrationToken,
  projectRegistrationTokenWithoutValue,
  projectWorker,
} from './projections';

const workerIdInput = {
  workerId: z.string().min(1).describe('The worker id.'),
};

const tokenIdInput = {
  tokenId: z.string().min(1).describe('The registration token id.'),
};

const adminWorkerOperations = [
  defineOperation({
    name: 'admin_list_workers',
    field: 'adminWorkers',
    command: ['admin', 'worker', 'list'],
    aliases: [['admin', 'workers']],
    description: `List every registered worker across all users. ${LIST_PAGE_DESCRIPTION} Requires admin access.`,
    access: 'admin',
    effect: 'read',
    input: {
      ...pageInput,
      userId: z.string().optional().describe('Only workers of this user.'),
      registrationTokenId: z
        .string()
        .optional()
        .describe('Only workers registered with this token.'),
      archived: z.boolean().optional().describe('Only archived workers.'),
      missing: z.boolean().optional().describe('Only workers marked missing.'),
    },
    run: async (sdk, input) =>
      pageOf(
        await sdk.admin.worker.getMany({
          ...toPage(input),
          userId: input.userId,
          registrationTokenId: input.registrationTokenId,
          archived: input.archived,
          missing: input.missing,
        }),
      ),
    project: page => projectListPage(page, projectWorker),
    output: LIST_PAGE_OUTPUT,
    itemOutput: WORKER_OUTPUT,
  }),
  defineOperation({
    name: 'admin_show_worker',
    field: 'adminWorker',
    command: ['admin', 'worker', 'show'],
    description: 'Show one registered worker. Requires admin access.',
    access: 'admin',
    effect: 'read',
    input: workerIdInput,
    positionals: ['workerId'],
    run: (sdk, input) => sdk.admin.worker.getOne({ workerId: input.workerId }),
    project: projectWorker,
    output: WORKER_OUTPUT,
  }),
  defineOperation({
    name: 'admin_update_worker',
    field: 'adminWorkerUpdate',
    command: ['admin', 'worker', 'update'],
    description:
      "Change a worker's description or tags. Requires admin access.",
    access: 'admin',
    effect: 'write',
    input: {
      ...workerIdInput,
      description: z
        .string()
        .nullish()
        .describe('The new description; null clears it.'),
      tags: z
        .string()
        .nullish()
        .describe('The new comma-separated tags; null clears them.'),
    },
    positionals: ['workerId'],
    run: (sdk, input) =>
      sdk.admin.worker.update({
        workerId: input.workerId,
        data: { description: input.description, tags: input.tags },
      }),
    project: projectWorker,
    output: WORKER_OUTPUT,
  }),
  defineOperation({
    name: 'admin_delete_worker',
    field: 'adminWorkerDelete',
    command: ['admin', 'worker', 'delete'],
    description: 'Delete a worker. Requires admin access.',
    access: 'admin',
    effect: 'destructive',
    input: workerIdInput,
    positionals: ['workerId'],
    run: (sdk, input) => sdk.admin.worker.delete({ workerId: input.workerId }),
    project: projectWorker,
    output: WORKER_OUTPUT,
  }),
  defineOperation({
    name: 'admin_clean_missing_workers',
    field: 'adminWorkerCleanMissing',
    command: ['admin', 'worker', 'clean-missing'],
    description:
      'Remove every worker that stopped reporting. Requires admin access.',
    access: 'admin',
    effect: 'destructive',
    input: {},
    run: async sdk => ({ removed: await sdk.admin.worker.cleanMissing({}) }),
    output: ['removed'],
  }),
  defineOperation({
    name: 'admin_list_worker_registration_tokens',
    field: 'adminWorkerRegistrationTokens',
    command: ['admin', 'worker-token', 'list'],
    description: `List the worker registration tokens, without their values. ${LIST_PAGE_DESCRIPTION} Requires admin access.`,
    access: 'admin',
    effect: 'read',
    input: {
      ...pageInput,
      userId: z.string().optional().describe('Only tokens of this user.'),
      activatable: z.boolean().optional().describe('Only tokens still usable.'),
      activated: z.boolean().optional().describe('Only tokens already used.'),
      archived: z.boolean().optional().describe('Only archived tokens.'),
      expired: z.boolean().optional().describe('Only expired tokens.'),
      isUnlimitedUsage: z
        .boolean()
        .optional()
        .describe('Only tokens with unlimited usage.'),
      token: z
        .string()
        .optional()
        .describe('Only the token with this exact value.'),
    },
    run: async (sdk, input) =>
      pageOf(
        await sdk.admin.worker.getRegistrationTokens({
          ...toPage(input),
          userId: input.userId,
          activatable: input.activatable,
          activated: input.activated,
          archived: input.archived,
          expired: input.expired,
          isUnlimitedUsage: input.isUnlimitedUsage,
          token: input.token,
        }),
      ),
    project: page =>
      projectListPage(page, projectRegistrationTokenWithoutValue),
    output: LIST_PAGE_OUTPUT,
    itemOutput: REGISTRATION_TOKEN_WITHOUT_VALUE_OUTPUT,
  }),
  defineOperation({
    name: 'admin_show_worker_registration_token',
    field: 'adminWorkerRegistrationToken',
    command: ['admin', 'worker-token', 'show'],
    description:
      'Show one worker registration token, including its value. Requires admin access.',
    access: 'admin',
    effect: 'read',
    input: tokenIdInput,
    positionals: ['tokenId'],
    run: (sdk, input) =>
      sdk.admin.worker.getRegistrationToken({
        workerRegistrationTokenId: input.tokenId,
      }),
    project: projectRegistrationToken,
    output: REGISTRATION_TOKEN_OUTPUT,
  }),
  defineOperation({
    name: 'admin_create_worker_registration_token',
    field: 'adminWorkerRegistrationTokenCreate',
    command: ['admin', 'worker-token', 'create'],
    description:
      'Create a worker registration token and show its value. Requires admin access.',
    access: 'admin',
    effect: 'write',
    input: {
      isUnlimitedUsage: z
        .boolean()
        .default(false)
        .describe('Whether the token can register any number of workers.'),
      expiresAt: z.iso
        .datetime({ offset: true })
        .optional()
        .describe(`When the token stops working, ${DATE_TIME_DESCRIPTION}.`),
    },
    run: (sdk, input) =>
      sdk.admin.worker.createRegistrationToken({
        data: {
          is_unlimited_usage: input.isUnlimitedUsage,
          expires_at: input.expiresAt,
        },
      }),
    project: projectRegistrationToken,
    output: REGISTRATION_TOKEN_OUTPUT,
  }),
  defineOperation({
    name: 'admin_delete_worker_registration_token',
    field: 'adminWorkerRegistrationTokenDelete',
    command: ['admin', 'worker-token', 'delete'],
    description:
      'Delete a worker registration token; its value is not shown. Requires admin access.',
    access: 'admin',
    effect: 'destructive',
    input: tokenIdInput,
    positionals: ['tokenId'],
    run: (sdk, input) =>
      sdk.admin.worker.deleteRegistrationToken({
        workerRegistrationTokenId: input.tokenId,
      }),
    project: projectRegistrationTokenWithoutValue,
    output: REGISTRATION_TOKEN_WITHOUT_VALUE_OUTPUT,
  }),
];

export { adminWorkerOperations };
