import { GRAPHQL_MAX_INT, GRAPHQL_MIN_INT } from 'graphql';
import { z } from 'zod';

// GraphQL import
import { PROCESSOR_PARAMETER_TYPE, PROCESSOR_VISIBILITY } from '@gql/graphql';

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
import { ADMIN_PROCESSOR_OUTPUT, projectAdminProcessor } from './projections';

const processorIdInput = {
  processorId: z.string().min(1).describe('The processor id.'),
};

const processorDefinitionInput = {
  name: z.string().min(1).describe('Processor name.'),
  version: z.string().min(1).describe('Semantic version, e.g. 1.2.0.'),
  imageTag: z.string().min(1).describe('Container image tag to run.'),
  description: z.string().nullish().describe('What the processor does.'),
  tags: z.string().nullish().describe('Comma-separated tags.'),
  allowedMimeTypes: z
    .string()
    .min(1)
    .describe('Comma-separated MIME types of the datasets it accepts.'),
  visibility: z.enum(PROCESSOR_VISIBILITY).describe('Who can use it.'),
  command: z.string().min(1).describe('Command run inside the container.'),
  datasetInputArgument: z
    .string()
    .min(1)
    .describe('Argument name that receives the input dataset path.'),
  datasetInputValue: z.string().min(1).describe('Input dataset path value.'),
  datasetOutputArgument: z
    .string()
    .min(1)
    .describe('Argument name that receives the output directory.'),
  datasetOutputValue: z.string().min(1).describe('Output directory value.'),
  outputMetricsFileGlobPatterns: z
    .array(z.string().min(1))
    .min(1)
    .describe('Glob patterns of the metrics files it produces.'),
  outputResultFileGlobPatterns: z
    .array(z.string().min(1))
    .min(1)
    .describe('Glob patterns of the result files it produces.'),
  parameters: z
    .array(
      z.strictObject({
        sequence: z.number().int().min(GRAPHQL_MIN_INT).max(GRAPHQL_MAX_INT),
        name: z.string().min(1),
        description: z.string().min(1),
        type: z.enum(PROCESSOR_PARAMETER_TYPE),
        isRequired: z.boolean(),
        defaultValue: z.string().nullish(),
      }),
    )
    .min(1)
    .describe('The parameters a run of it accepts.'),
};

const toProcessorSchema = (
  input: z.infer<z.ZodObject<typeof processorDefinitionInput>>,
) => ({
  name: input.name,
  version: input.version,
  image_tag: input.imageTag,
  description: input.description ?? null,
  tags: input.tags ?? null,
  allowed_mime_types: input.allowedMimeTypes,
  visibility: input.visibility,
  configuration: {
    command: input.command,
    dataset_input_argument: input.datasetInputArgument,
    dataset_input_value: input.datasetInputValue,
    dataset_output_argument: input.datasetOutputArgument,
    dataset_output_value: input.datasetOutputValue,
    output_metrics_file_glob_patterns: input.outputMetricsFileGlobPatterns,
    output_result_file_glob_patterns: input.outputResultFileGlobPatterns,
    parameters: input.parameters.map(parameter => ({
      sequence: parameter.sequence,
      name: parameter.name,
      description: parameter.description,
      type: parameter.type,
      is_required: parameter.isRequired,
      default_value: parameter.defaultValue ?? null,
    })),
  },
});

const adminProcessorOperations = [
  defineOperation({
    name: 'admin_list_processors',
    field: 'adminProcessors',
    command: ['admin', 'processor', 'list'],
    aliases: [['admin', 'processors']],
    description: `List every processor, including non-public ones. ${LIST_PAGE_DESCRIPTION} Requires admin access.`,
    access: 'admin',
    effect: 'read',
    input: pageInput,
    run: async (sdk, input) =>
      pageOf(await sdk.admin.processor.getMany(toPage(input))),
    project: page => projectListPage(page, projectAdminProcessor),
    output: LIST_PAGE_OUTPUT,
    itemOutput: ADMIN_PROCESSOR_OUTPUT,
  }),
  defineOperation({
    name: 'admin_show_processor',
    field: 'adminProcessor',
    command: ['admin', 'processor', 'show'],
    description:
      'Show one processor with its whole definition, including non-public ones. Requires admin access.',
    access: 'admin',
    effect: 'read',
    input: processorIdInput,
    positionals: ['processorId'],
    run: (sdk, input) =>
      sdk.admin.processor.getOne({ processorId: input.processorId }),
    project: projectAdminProcessor,
    output: ADMIN_PROCESSOR_OUTPUT,
  }),
  defineOperation({
    name: 'admin_create_processor',
    field: 'adminProcessorCreate',
    command: ['admin', 'processor', 'create'],
    description: 'Create a processor. Requires admin access.',
    access: 'admin',
    effect: 'write',
    input: processorDefinitionInput,
    run: (sdk, input) =>
      sdk.admin.processor.create({ data: toProcessorSchema(input) }),
    project: projectAdminProcessor,
    output: ADMIN_PROCESSOR_OUTPUT,
  }),
  defineOperation({
    name: 'admin_update_processor',
    field: 'adminProcessorUpdate',
    command: ['admin', 'processor', 'update'],
    description:
      "Replace a processor's whole definition with the given one; an omitted description or tags is cleared. Requires admin access.",
    access: 'admin',
    effect: 'write',
    input: { ...processorIdInput, ...processorDefinitionInput },
    positionals: ['processorId'],
    run: (sdk, input) =>
      sdk.admin.processor.update({
        processorId: input.processorId,
        data: toProcessorSchema(input),
      }),
    project: projectAdminProcessor,
    output: ADMIN_PROCESSOR_OUTPUT,
  }),
  defineOperation({
    name: 'admin_delete_processor',
    field: 'adminProcessorDelete',
    command: ['admin', 'processor', 'delete'],
    description: 'Delete a processor. Requires admin access.',
    access: 'admin',
    effect: 'destructive',
    input: processorIdInput,
    positionals: ['processorId'],
    run: (sdk, input) =>
      sdk.admin.processor.delete({ processorId: input.processorId }),
    project: projectAdminProcessor,
    output: ADMIN_PROCESSOR_OUTPUT,
  }),
];

export { adminProcessorOperations };
