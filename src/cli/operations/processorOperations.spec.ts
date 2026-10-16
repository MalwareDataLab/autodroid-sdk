import { describe, expect, it } from 'vitest';

// Util import
import {
  connection,
  IOperationCase,
  itBehavesAsItsCases,
  listPage,
  operationNamed,
  SORTING,
} from '../../../test/support/operationCases';
import {
  PROCESSOR,
  PROJECTED_PARAMETER,
} from '../../../test/support/operationFixtures';

// Target import
import { processorOperations } from './processorOperations';

const PROJECTED_PROCESSOR = {
  id: 'processor-1',
  name: 'Analyzer',
  version: '1.0.0',
  visibility: 'PUBLIC',
  configuration: { parameters: [PROJECTED_PARAMETER] },
};

const cases: IOperationCase[] = [
  {
    name: 'list_processors',
    input: { sorting: SORTING },
    call: 'processor.getMany',
    args: [{ skip: 0, take: 10, sorting: SORTING }],
    answer: connection(PROCESSOR),
    result: listPage(PROJECTED_PROCESSOR),
  },
  {
    name: 'show_processor',
    input: { processorId: 'processor-1' },
    call: 'processor.getOne',
    args: [{ processorId: 'processor-1' }],
    answer: PROCESSOR,
    result: PROJECTED_PROCESSOR,
  },
];

describe('Operations: processor', () => {
  itBehavesAsItsCases(processorOperations, cases);

  it('show_processor should say it shows any PUBLIC processor or one you created', () => {
    expect(operationNamed('show_processor').description).toMatch(
      /any PUBLIC one or one you created/,
    );
  });

  it('list_processors should say it lists every PUBLIC processor plus the HIDDEN ones you created', () => {
    expect(operationNamed('list_processors').description).toMatch(
      /every PUBLIC one plus the HIDDEN ones you created/,
    );
  });
});
