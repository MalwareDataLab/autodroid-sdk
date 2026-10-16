import { describe } from 'vitest';

// Util import
import {
  IOperationCase,
  itBehavesAsItsCases,
} from '../../../test/support/operationCases';

// Target import
import { userOperations } from './userOperations';

const USER = {
  id: 'user-1',
  name: 'Ada',
  email: 'ada@example.test',
  is_admin: false,
  language: 'en-us',
  phone_number: '+55 1',
  learning_data: { secret: true },
};

const PROJECTED_USER = {
  id: 'user-1',
  name: 'Ada',
  email: 'ada@example.test',
  is_admin: false,
  language: 'en-us',
};

const GRANT = {
  id: 'grant-1',
  client_id: 'https://app.example/client.json',
  client_name: 'Example Agent',
  client_verified_host: 'app.example',
  resource: 'https://api.autodroid.example/mcp',
  scopes: ['autodroid:read'],
  created_at: '2026-01-01T00:00:00.000Z',
  last_used_at: '2026-01-02T00:00:00.000Z',
  expires_at: '2026-04-01T00:00:00.000Z',
};

const PROJECTED_GRANT = {
  id: 'grant-1',
  client_id: 'https://app.example/client.json',
  client_name: 'Example Agent',
  client_verified_host: 'app.example',
  scopes: ['autodroid:read'],
  created_at: '2026-01-01T00:00:00.000Z',
  last_used_at: '2026-01-02T00:00:00.000Z',
  expires_at: '2026-04-01T00:00:00.000Z',
};

const cases: IOperationCase[] = [
  {
    name: 'whoami',
    input: {},
    call: 'user.getCurrent',
    args: [],
    answer: USER,
    result: PROJECTED_USER,
  },
  {
    name: 'show_session',
    input: {},
    call: 'user.getCurrentSession',
    args: [],
    answer: {
      user: USER,
      user_auth_provider_conn: { id: 'conn-1' },
      user_session: {
        access_token: 'live-id-token',
        refresh_token: 'live-refresh-token',
        access_token_expires_at: '2026-01-01T01:00:00.000Z',
        refresh_token_expires_at: '2026-02-01T00:00:00.000Z',
      },
    },
    result: {
      user: PROJECTED_USER,
      user_auth_provider_conn_id: 'conn-1',
      access_token_expires_at: '2026-01-01T01:00:00.000Z',
      refresh_token_expires_at: '2026-02-01T00:00:00.000Z',
    },
  },
  {
    name: 'close_sessions',
    input: {},
    call: 'user.closeSessions',
    args: [{}],
    answer: { id: 'conn-1' },
    result: { closed: true },
  },
  {
    name: 'update_profile',
    input: {
      name: 'Ada',
      phoneNumber: '+55 1',
      language: 'pt-br',
      notificationsEnabled: true,
    },
    call: 'user.update',
    args: [
      {
        data: {
          name: 'Ada',
          phone_number: '+55 1',
          language: 'pt-br',
          notifications_enabled: true,
        },
      },
    ],
    answer: USER,
    result: PROJECTED_USER,
  },
  {
    name: 'update_profile',
    input: { name: 'Ada', phoneNumber: null },
    call: 'user.update',
    args: [
      {
        data: {
          name: 'Ada',
          phone_number: null,
          language: undefined,
          notifications_enabled: undefined,
        },
      },
    ],
    answer: USER,
    result: PROJECTED_USER,
  },
  {
    name: 'update_profile_learning_data',
    input: { data: { module: 3 } },
    call: 'user.updateLearningData',
    args: [{ data: { module: 3 } }],
    answer: USER,
    result: PROJECTED_USER,
  },
  {
    name: 'list_mcp_connections',
    input: {},
    call: 'user.getMcpAuthorizationGrants',
    args: [],
    answer: [GRANT],
    result: { items: [PROJECTED_GRANT], total_count: 1, has_next_page: false },
  },
  {
    name: 'revoke_mcp_connection',
    input: { connectionId: 'grant-1' },
    call: 'user.revokeMcpAuthorizationGrant',
    args: [{ mcpAuthorizationGrantId: 'grant-1' }],
    answer: GRANT,
    result: PROJECTED_GRANT,
  },
];

describe('Operations: user', () => {
  itBehavesAsItsCases(userOperations, cases);
});
