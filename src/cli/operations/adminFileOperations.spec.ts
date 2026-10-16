import { describe } from 'vitest';

// Util import
import {
  IOperationCase,
  itBehavesAsItsCases,
} from '../../../test/support/operationCases';

// Target import
import { adminFileOperations } from './adminFileOperations';

const cases: IOperationCase[] = [
  {
    name: 'admin_remove_dangling_files',
    input: {},
    call: 'admin.file.removeAllDangling',
    args: [{}],
    answer: 9,
    result: { removed: 9 },
  },
];

describe('Operations: admin file', () => {
  itBehavesAsItsCases(adminFileOperations, cases);
});
