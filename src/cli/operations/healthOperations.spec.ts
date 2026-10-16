import { describe } from 'vitest';

// Util import
import {
  IOperationCase,
  itBehavesAsItsCases,
} from '../../../test/support/operationCases';

// Target import
import { healthOperations } from './healthOperations';

const cases: IOperationCase[] = [
  {
    name: 'health_check',
    input: {},
    call: 'healthCheck.healthCheck',
    args: [{}],
    answer: '2026-01-01T00:00:00.000Z',
    result: { checked_at: '2026-01-01T00:00:00.000Z' },
  },
  {
    name: 'health_liveness',
    input: {},
    call: 'healthCheck.livenessCheck',
    args: [{}],
    answer: '2026-01-01T00:00:01.000Z',
    result: { checked_at: '2026-01-01T00:00:01.000Z' },
  },
  {
    name: 'health_readiness',
    input: {},
    call: 'healthCheck.readinessCheck',
    args: [{}],
    answer: '2026-01-01T00:00:02.000Z',
    result: { checked_at: '2026-01-01T00:00:02.000Z' },
  },
];

describe('Operations: health', () => {
  itBehavesAsItsCases(healthOperations, cases);
});
