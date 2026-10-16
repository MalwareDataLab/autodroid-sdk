// Util import
import { describePassthrough } from '../../../test/support/passthrough';

// Service import
import {
  USER_PROCESSOR_GET_MANY_QUERY,
  USER_PROCESSOR_GET_ONE_QUERY,
} from '@services/processor/queries';

// Target import
import { Processor } from '@services/processor';

describePassthrough('Processor service', context => new Processor(context), [
  {
    method: 'getOne',
    kind: 'query',
    document: USER_PROCESSOR_GET_ONE_QUERY,
    rootField: 'userProcessor',
  },
  {
    method: 'getMany',
    kind: 'query',
    document: USER_PROCESSOR_GET_MANY_QUERY,
    rootField: 'userProcessors',
  },
]);
