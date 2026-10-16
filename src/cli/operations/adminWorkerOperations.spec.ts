import { describe } from 'vitest';

// Util import
import {
  connection,
  IOperationCase,
  itBehavesAsItsCases,
  itTakesDateTimeInputsWithAnOffset,
  itTakesNullToClear,
  listPage,
  SORTING,
} from '../../../test/support/operationCases';

// Target import
import { adminWorkerOperations } from './adminWorkerOperations';

const WORKER = {
  id: 'worker-1',
  name: 'builder',
  version: '1',
  description: 'd',
  tags: 't',
  last_seen_at: '2026-01-01T00:00:00.000Z',
  archived_at: null,
  created_at: '2026-01-01T00:00:00.000Z',
  user_id: 'user-1',
  refresh_token: 'live-secret',
  refresh_token_expires_at: '2027-01-01T00:00:00.000Z',
};

const PROJECTED_WORKER = {
  id: 'worker-1',
  name: 'builder',
  version: '1',
  description: 'd',
  tags: 't',
  last_seen_at: '2026-01-01T00:00:00.000Z',
  archived_at: null,
  created_at: '2026-01-01T00:00:00.000Z',
  user_id: 'user-1',
};

const TOKEN = {
  id: 'token-1',
  token: 'reg-tok',
  is_unlimited_usage: true,
  expires_at: null,
  created_at: '2026-01-01T00:00:00.000Z',
  seq: 1,
};

const PROJECTED_TOKEN_WITHOUT_VALUE = {
  id: 'token-1',
  is_unlimited_usage: true,
  expires_at: null,
  created_at: '2026-01-01T00:00:00.000Z',
};

const PROJECTED_TOKEN = { ...PROJECTED_TOKEN_WITHOUT_VALUE, token: 'reg-tok' };

const cases: IOperationCase[] = [
  {
    name: 'admin_list_workers',
    input: {
      take: 2,
      userId: 'u',
      registrationTokenId: 't',
      archived: false,
      missing: true,
      sorting: SORTING,
    },
    call: 'admin.worker.getMany',
    args: [
      {
        skip: 0,
        take: 2,
        sorting: SORTING,
        userId: 'u',
        registrationTokenId: 't',
        archived: false,
        missing: true,
      },
    ],
    answer: connection(WORKER),
    result: listPage(PROJECTED_WORKER),
  },
  {
    name: 'admin_show_worker',
    input: { workerId: 'worker-1' },
    call: 'admin.worker.getOne',
    args: [{ workerId: 'worker-1' }],
    answer: WORKER,
    result: PROJECTED_WORKER,
  },
  {
    name: 'admin_update_worker',
    input: { workerId: 'worker-1', description: 'd2', tags: 't2' },
    call: 'admin.worker.update',
    args: [{ workerId: 'worker-1', data: { description: 'd2', tags: 't2' } }],
    answer: WORKER,
    result: PROJECTED_WORKER,
  },
  {
    name: 'admin_update_worker',
    input: { workerId: 'worker-1', description: null, tags: null },
    call: 'admin.worker.update',
    args: [{ workerId: 'worker-1', data: { description: null, tags: null } }],
    answer: WORKER,
    result: PROJECTED_WORKER,
  },
  {
    name: 'admin_delete_worker',
    input: { workerId: 'worker-1' },
    call: 'admin.worker.delete',
    args: [{ workerId: 'worker-1' }],
    answer: WORKER,
    result: PROJECTED_WORKER,
  },
  {
    name: 'admin_clean_missing_workers',
    input: {},
    call: 'admin.worker.cleanMissing',
    args: [{}],
    answer: 4,
    result: { removed: 4 },
  },
  {
    name: 'admin_list_worker_registration_tokens',
    input: {
      take: 6,
      userId: 'u',
      activatable: true,
      activated: false,
      archived: false,
      expired: false,
      isUnlimitedUsage: true,
      token: 'secret',
      sorting: SORTING,
    },
    call: 'admin.worker.getRegistrationTokens',
    args: [
      {
        skip: 0,
        take: 6,
        sorting: SORTING,
        userId: 'u',
        activatable: true,
        activated: false,
        archived: false,
        expired: false,
        isUnlimitedUsage: true,
        token: 'secret',
      },
    ],
    answer: connection(TOKEN),
    result: listPage(PROJECTED_TOKEN_WITHOUT_VALUE),
  },
  {
    name: 'admin_show_worker_registration_token',
    input: { tokenId: 'token-1' },
    call: 'admin.worker.getRegistrationToken',
    args: [{ workerRegistrationTokenId: 'token-1' }],
    answer: TOKEN,
    result: PROJECTED_TOKEN,
  },
  {
    name: 'admin_create_worker_registration_token',
    input: { isUnlimitedUsage: true, expiresAt: '2030-01-01T00:00:00Z' },
    call: 'admin.worker.createRegistrationToken',
    args: [
      {
        data: { is_unlimited_usage: true, expires_at: '2030-01-01T00:00:00Z' },
      },
    ],
    answer: TOKEN,
    result: PROJECTED_TOKEN,
  },
  {
    name: 'admin_create_worker_registration_token',
    input: {},
    call: 'admin.worker.createRegistrationToken',
    args: [{ data: { is_unlimited_usage: false, expires_at: undefined } }],
    answer: TOKEN,
    result: PROJECTED_TOKEN,
  },
  {
    name: 'admin_delete_worker_registration_token',
    input: { tokenId: 'token-1' },
    call: 'admin.worker.deleteRegistrationToken',
    args: [{ workerRegistrationTokenId: 'token-1' }],
    answer: TOKEN,
    result: PROJECTED_TOKEN_WITHOUT_VALUE,
  },
];

describe('Operations: admin worker', () => {
  itBehavesAsItsCases(adminWorkerOperations, cases);

  itTakesNullToClear([
    ['admin_update_worker', 'description'],
    ['admin_update_worker', 'tags'],
  ]);

  itTakesDateTimeInputsWithAnOffset(adminWorkerOperations);
});
