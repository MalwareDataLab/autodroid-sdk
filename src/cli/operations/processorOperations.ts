import { z } from 'zod';

// Operation import
import { defineOperation } from './defineOperation';
import {
  LIST_PAGE_DESCRIPTION,
  LIST_PAGE_OUTPUT,
  pageInput,
  pageOf,
  projectListPage,
  toPage,
} from './paging';
import { PROCESSOR_OUTPUT, projectProcessor } from './projections';

const processorOperations = [
  defineOperation({
    name: 'list_processors',
    field: 'userProcessors',
    command: ['processor', 'list'],
    aliases: [['processors']],
    description: `List the data synthesis processors you can use: every PUBLIC one plus the HIDDEN ones you created. ${LIST_PAGE_DESCRIPTION}`,
    access: 'user',
    effect: 'read',
    input: pageInput,
    run: async (sdk, input) =>
      pageOf(await sdk.processor.getMany(toPage(input))),
    project: page => projectListPage(page, projectProcessor),
    output: LIST_PAGE_OUTPUT,
    itemOutput: PROCESSOR_OUTPUT,
  }),
  defineOperation({
    name: 'show_processor',
    field: 'userProcessor',
    command: ['processor', 'show'],
    description:
      'Show one processor, any PUBLIC one or one you created, and its parameters.',
    access: 'user',
    effect: 'read',
    input: { processorId: z.string().min(1).describe('The processor id.') },
    positionals: ['processorId'],
    run: (sdk, input) =>
      sdk.processor.getOne({ processorId: input.processorId }),
    project: projectProcessor,
    output: PROCESSOR_OUTPUT,
  }),
];

export { processorOperations };
