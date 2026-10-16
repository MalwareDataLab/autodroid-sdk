import { z } from 'zod';

// Operation import
import { defineOperation } from './defineOperation';
import {
  LIST_PAGE_DESCRIPTION,
  LIST_PAGE_OUTPUT,
  pageOfAll,
  projectListPage,
} from './paging';
import {
  CONNECTION_OUTPUT,
  SESSION_OUTPUT,
  USER_OUTPUT,
  projectConnection,
  projectSession,
  projectUser,
} from './projections';

const userOperations = [
  defineOperation({
    name: 'whoami',
    field: 'user',
    command: ['whoami'],
    description: 'Show the authenticated user.',
    access: 'user',
    effect: 'read',
    input: {},
    run: sdk => sdk.user.getCurrent(),
    project: projectUser,
    remembersAccount: true,
    output: USER_OUTPUT,
  }),
  defineOperation({
    name: 'show_session',
    field: 'session',
    command: ['session', 'show'],
    description: 'Show how long the current session stays valid.',
    access: 'user',
    effect: 'read',
    input: {},
    run: sdk => sdk.user.getCurrentSession(),
    project: projectSession,
    output: SESSION_OUTPUT,
  }),
  defineOperation({
    name: 'close_sessions',
    field: 'userSessionsClose',
    command: ['session', 'close'],
    description:
      'Sign this account out everywhere: every session of the account is closed and must log in again, and every app or agent connected over MCP loses access.',
    access: 'user',
    effect: 'destructive',
    input: {},
    run: async sdk => {
      await sdk.user.closeSessions({});
      return { closed: true };
    },
    output: ['closed'],
  }),
  defineOperation({
    name: 'update_profile',
    field: 'userUpdateData',
    command: ['profile', 'update'],
    description: 'Update your profile.',
    access: 'user',
    effect: 'write',
    input: {
      name: z.string().min(1).describe('Your name.'),
      phoneNumber: z
        .string()
        .nullish()
        .describe('Phone number, e.g. "+55 99 9 9999 9999"; null clears it.'),
      language: z
        .string()
        .optional()
        .describe('Preferred language, e.g. "pt-br".'),
      notificationsEnabled: z
        .boolean()
        .optional()
        .describe('Whether to receive notifications.'),
    },
    run: (sdk, input) =>
      sdk.user.update({
        data: {
          name: input.name,
          phone_number: input.phoneNumber,
          language: input.language,
          notifications_enabled: input.notificationsEnabled,
        },
      }),
    project: projectUser,
    output: USER_OUTPUT,
  }),
  defineOperation({
    name: 'update_profile_learning_data',
    field: 'userUpdateLearningData',
    command: ['profile', 'update-learning-data'],
    description: 'Replace your learning-progress data.',
    access: 'user',
    effect: 'write',
    input: {
      data: z
        .record(z.string(), z.unknown())
        .describe('The learning data object (JSON).'),
    },
    run: (sdk, input) => sdk.user.updateLearningData({ data: input.data }),
    project: projectUser,
    output: USER_OUTPUT,
  }),
  defineOperation({
    name: 'list_mcp_connections',
    field: 'userMcpAuthorizationGrants',
    command: ['connections', 'list'],
    description: `List the apps and agents you authorized to use your account over MCP. ${LIST_PAGE_DESCRIPTION}`,
    access: 'user',
    effect: 'read',
    input: {},
    run: sdk => sdk.user.getMcpAuthorizationGrants(),
    project: connections =>
      projectListPage(pageOfAll(connections), projectConnection),
    output: LIST_PAGE_OUTPUT,
    itemOutput: CONNECTION_OUTPUT,
  }),
  defineOperation({
    name: 'revoke_mcp_connection',
    field: 'userMcpAuthorizationGrantRevoke',
    command: ['connections', 'revoke'],
    description:
      'Revoke an app or agent connection; it loses access to your account at once.',
    access: 'user',
    effect: 'destructive',
    input: { connectionId: z.string().min(1).describe('The connection id.') },
    positionals: ['connectionId'],
    run: (sdk, input) =>
      sdk.user.revokeMcpAuthorizationGrant({
        mcpAuthorizationGrantId: input.connectionId,
      }),
    project: projectConnection,
    output: CONNECTION_OUTPUT,
  }),
];

export { userOperations };
