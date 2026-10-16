import { describe, expect, it } from 'vitest';
import { z } from 'zod';

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
import { adminProcessorOperations } from './adminProcessorOperations';

const PROJECTED_ADMIN_PROCESSOR = {
  id: 'processor-1',
  name: 'Analyzer',
  version: '1.0.0',
  image_tag: 'analyzer:1',
  description: 'Analyzes',
  tags: 'x',
  allowed_mime_types: 'text/csv',
  visibility: 'PUBLIC',
  configuration: {
    command: 'run',
    dataset_input_argument: '-i',
    dataset_input_value: '/in',
    dataset_output_argument: '-o',
    dataset_output_value: '/out',
    output_metrics_file_glob_patterns: ['*.zip'],
    output_result_file_glob_patterns: ['*.csv'],
    parameters: [PROJECTED_PARAMETER],
  },
};

const PROCESSOR_INPUT = {
  name: 'Analyzer',
  version: '1.0.0',
  imageTag: 'analyzer:1',
  description: 'Analyzes',
  tags: 'x',
  allowedMimeTypes: 'text/csv',
  visibility: 'PUBLIC',
  command: 'run',
  datasetInputArgument: '-i',
  datasetInputValue: '/in',
  datasetOutputArgument: '-o',
  datasetOutputValue: '/out',
  outputMetricsFileGlobPatterns: ['*.zip'],
  outputResultFileGlobPatterns: ['*.csv'],
  parameters: [
    {
      sequence: 1,
      name: 'threshold',
      description: 'Detection threshold',
      type: 'INTEGER',
      isRequired: true,
      defaultValue: '5',
    },
  ],
};

const PROCESSOR_SCHEMA = {
  name: 'Analyzer',
  version: '1.0.0',
  image_tag: 'analyzer:1',
  description: 'Analyzes',
  tags: 'x',
  allowed_mime_types: 'text/csv',
  visibility: 'PUBLIC',
  configuration: {
    command: 'run',
    dataset_input_argument: '-i',
    dataset_input_value: '/in',
    dataset_output_argument: '-o',
    dataset_output_value: '/out',
    output_metrics_file_glob_patterns: ['*.zip'],
    output_result_file_glob_patterns: ['*.csv'],
    parameters: [
      {
        sequence: 1,
        name: 'threshold',
        description: 'Detection threshold',
        type: 'INTEGER',
        is_required: true,
        default_value: '5',
      },
    ],
  },
};

const cases: IOperationCase[] = [
  {
    name: 'admin_list_processors',
    input: { sorting: SORTING },
    call: 'admin.processor.getMany',
    args: [{ skip: 0, take: 10, sorting: SORTING }],
    answer: connection(PROCESSOR),
    result: listPage(PROJECTED_ADMIN_PROCESSOR),
  },
  {
    name: 'admin_show_processor',
    input: { processorId: 'processor-1' },
    call: 'admin.processor.getOne',
    args: [{ processorId: 'processor-1' }],
    answer: PROCESSOR,
    result: PROJECTED_ADMIN_PROCESSOR,
  },
  {
    name: 'admin_create_processor',
    input: PROCESSOR_INPUT,
    call: 'admin.processor.create',
    args: [{ data: PROCESSOR_SCHEMA }],
    answer: PROCESSOR,
    result: PROJECTED_ADMIN_PROCESSOR,
  },
  {
    name: 'admin_create_processor',
    input: {
      ...PROCESSOR_INPUT,
      description: undefined,
      tags: undefined,
      parameters: [
        {
          sequence: 1,
          name: 'threshold',
          description: 'Detection threshold',
          type: 'INTEGER',
          isRequired: false,
        },
      ],
    },
    call: 'admin.processor.create',
    args: [
      {
        data: {
          ...PROCESSOR_SCHEMA,
          description: null,
          tags: null,
          configuration: {
            ...PROCESSOR_SCHEMA.configuration,
            parameters: [
              {
                sequence: 1,
                name: 'threshold',
                description: 'Detection threshold',
                type: 'INTEGER',
                is_required: false,
                default_value: null,
              },
            ],
          },
        },
      },
    ],
    answer: PROCESSOR,
    result: PROJECTED_ADMIN_PROCESSOR,
  },
  {
    name: 'admin_update_processor',
    input: {
      processorId: 'processor-1',
      ...PROCESSOR_INPUT,
      parameters: [{ ...PROCESSOR_INPUT.parameters[0], defaultValue: null }],
    },
    call: 'admin.processor.update',
    args: [
      {
        processorId: 'processor-1',
        data: {
          ...PROCESSOR_SCHEMA,
          configuration: {
            ...PROCESSOR_SCHEMA.configuration,
            parameters: [
              {
                ...PROCESSOR_SCHEMA.configuration.parameters[0],
                default_value: null,
              },
            ],
          },
        },
      },
    ],
    answer: PROCESSOR,
    result: PROJECTED_ADMIN_PROCESSOR,
  },
  {
    name: 'admin_update_processor',
    input: { processorId: 'processor-1', ...PROCESSOR_INPUT },
    call: 'admin.processor.update',
    args: [{ processorId: 'processor-1', data: PROCESSOR_SCHEMA }],
    answer: PROCESSOR,
    result: PROJECTED_ADMIN_PROCESSOR,
  },
  {
    name: 'admin_delete_processor',
    input: { processorId: 'processor-1' },
    call: 'admin.processor.delete',
    args: [{ processorId: 'processor-1' }],
    answer: PROCESSOR,
    result: PROJECTED_ADMIN_PROCESSOR,
  },
];

describe('Operations: admin processor', () => {
  itBehavesAsItsCases(adminProcessorOperations, cases);

  describe('processor definition input', () => {
    const schema = z.object(operationNamed('admin_create_processor').input);

    it('should accept a complete definition', () => {
      expect(() => schema.parse(PROCESSOR_INPUT)).not.toThrow();
    });

    it.each([
      ['parameters', []],
      ['outputMetricsFileGlobPatterns', []],
      ['outputResultFileGlobPatterns', []],
      ['outputResultFileGlobPatterns', ['']],
    ])(
      'should reject an empty %s, which the API would refuse too',
      (field, value) => {
        expect(() =>
          schema.parse({ ...PROCESSOR_INPUT, [field]: value }),
        ).toThrow();
      },
    );

    it("should reject a parameter with an empty description, as the API's ValidString does", () => {
      expect(() =>
        schema.parse({
          ...PROCESSOR_INPUT,
          parameters: [{ ...PROCESSOR_INPUT.parameters[0], description: '' }],
        }),
      ).toThrow();
    });

    it.each([-2147483648, 2147483647])(
      'should accept a parameter sequence of %s, the bound of a GraphQL Int',
      sequence => {
        expect(() =>
          schema.parse({
            ...PROCESSOR_INPUT,
            parameters: [{ ...PROCESSOR_INPUT.parameters[0], sequence }],
          }),
        ).not.toThrow();
      },
    );

    it.each([-2147483649, 2147483648])(
      'should reject a parameter sequence of %s, beyond a GraphQL Int',
      sequence => {
        expect(() =>
          schema.parse({
            ...PROCESSOR_INPUT,
            parameters: [{ ...PROCESSOR_INPUT.parameters[0], sequence }],
          }),
        ).toThrow();
      },
    );

    it.each([
      'parameters',
      'outputMetricsFileGlobPatterns',
      'outputResultFileGlobPatterns',
    ])('should require %s instead of defaulting it to an empty list', field => {
      const { [field]: omitted, ...rest } = PROCESSOR_INPUT as Record<
        string,
        unknown
      >;

      expect(omitted).toBeDefined();
      expect(() => schema.parse(rest)).toThrow();
    });
  });

  it("admin_create_processor and admin_update_processor should take a parameter's default value as null, as admin_show_processor returns it", () => {
    ['admin_create_processor', 'admin_update_processor'].forEach(name => {
      const parameters = z.object(operationNamed(name).input).shape
        .parameters as z.ZodType;

      expect(
        parameters.safeParse([
          {
            sequence: 1,
            name: 'k',
            description: 'd',
            type: 'INTEGER',
            isRequired: true,
            defaultValue: null,
          },
        ]).success,
      ).toBe(true);
    });
  });

  it('admin_update_processor should say that an omitted description or tags is cleared', () => {
    expect(operationNamed('admin_update_processor').description).toMatch(
      /omitted description or tags is cleared/i,
    );
  });
});
