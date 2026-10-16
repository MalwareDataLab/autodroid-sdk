import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildSchema,
  DocumentNode,
  FieldNode,
  FragmentDefinitionNode,
  Kind,
  OperationDefinitionNode,
  visit,
} from 'graphql';
import { describe, expect, it } from 'vitest';

// Service import
import * as adminDatasetQueries from '@services/admin/dataset/queries';
import * as adminFileQueries from '@services/admin/file/queries';
import * as adminProcessingQueries from '@services/admin/processing/queries';
import * as adminProcessorQueries from '@services/admin/processor/queries';
import * as adminWorkerQueries from '@services/admin/worker/queries';
import * as datasetFragments from '@services/dataset/fragments';
import * as datasetQueries from '@services/dataset/queries';
import * as fileFragments from '@services/file/fragments';
import * as healthCheckQueries from '@services/healthCheck/queries';
import * as processingFragments from '@services/processing/fragments';
import * as processingQueries from '@services/processing/queries';
import * as processorFragments from '@services/processor/fragments';
import * as processorQueries from '@services/processor/queries';
import * as userFragments from '@services/user/fragments';
import * as userQueries from '@services/user/queries';
import * as workerFragments from '@services/worker/fragments';
import * as workerQueries from '@services/worker/queries';

type DocumentModule = Record<string, unknown>;

const queryModules: Record<string, DocumentModule> = {
  'admin/dataset/queries': adminDatasetQueries,
  'admin/file/queries': adminFileQueries,
  'admin/processing/queries': adminProcessingQueries,
  'admin/processor/queries': adminProcessorQueries,
  'admin/worker/queries': adminWorkerQueries,
  'dataset/queries': datasetQueries,
  'healthCheck/queries': healthCheckQueries,
  'processing/queries': processingQueries,
  'processor/queries': processorQueries,
  'user/queries': userQueries,
  'worker/queries': workerQueries,
};

const fragmentModules: Record<string, DocumentModule> = {
  'dataset/fragments': datasetFragments,
  'file/fragments': fileFragments,
  'processing/fragments': processingFragments,
  'processor/fragments': processorFragments,
  'user/fragments': userFragments,
  'worker/fragments': workerFragments,
};

type ExportedDocument = {
  module: string;
  name: string;
  document: DocumentNode;
};

const collectExports = (
  modules: Record<string, DocumentModule>,
): ExportedDocument[] =>
  Object.entries(modules).flatMap(([module, exports]) =>
    Object.entries(exports).map(([name, document]) => ({
      module,
      name,
      document: document as DocumentNode,
    })),
  );

const collectSpreadNames = (document: DocumentNode): string[] => {
  const spreads: string[] = [];
  visit(document, {
    FragmentSpread: node => {
      spreads.push(node.name.value);
    },
  });
  return spreads;
};

const collectFragmentDefinitions = (
  document: DocumentNode,
): FragmentDefinitionNode[] =>
  document.definitions.filter(
    (definition): definition is FragmentDefinitionNode =>
      definition.kind === Kind.FRAGMENT_DEFINITION,
  );

const moduleNames = [
  ...Object.keys(queryModules),
  ...Object.keys(fragmentModules),
];
const queryExports = collectExports(queryModules);
const fragmentExports = collectExports(fragmentModules);

describe('service gql documents', () => {
  it.each(moduleNames)('exports at least one document from %s', module => {
    const exports = queryModules[module] ?? fragmentModules[module];

    expect(Object.keys(exports).length).toBeGreaterThan(0);
  });

  it.each([...queryExports, ...fragmentExports])(
    'resolves $name in $module to a parsed document instead of the gql fallback',
    ({ document }) => {
      expect(document.kind).toBe(Kind.DOCUMENT);
      expect(document.definitions.length).toBeGreaterThan(0);
    },
  );

  it.each(queryExports)(
    'declares exactly one named operation for $name in $module',
    ({ document }) => {
      const operations = document.definitions.filter(
        definition => definition.kind === Kind.OPERATION_DEFINITION,
      );

      expect(operations).toHaveLength(1);
      expect(operations[0]).toHaveProperty('name.value', expect.any(String));
    },
  );

  it.each(fragmentExports)(
    'declares only typed fragments for $name in $module',
    ({ document }) => {
      const definitions = collectFragmentDefinitions(document);
      const untyped = definitions.filter(
        fragment => !fragment.typeCondition.name.value,
      );

      expect(definitions.length).toBeGreaterThan(0);
      expect(definitions).toHaveLength(document.definitions.length);
      expect(untyped).toEqual([]);
    },
  );

  it.each([...queryExports, ...fragmentExports])(
    'inlines every fragment spread used by $name in $module',
    ({ document }) => {
      const defined = collectFragmentDefinitions(document).map(
        fragment => fragment.name.value,
      );
      const missing = collectSpreadNames(document).filter(
        spread => !defined.includes(spread),
      );

      expect(missing).toEqual([]);
    },
  );
});

const collectFieldNames = (document: DocumentNode): string[] => {
  const fields: string[] = [];
  visit(document, {
    Field: node => {
      fields.push(node.name.value);
    },
  });
  return fields;
};

describe('worker registration token documents', () => {
  it.each([
    'ADMIN_WORKER_REGISTRATION_TOKEN_GET_MANY_QUERY',
    'ADMIN_WORKER_REGISTRATION_TOKEN_DELETE_MUTATION',
  ] as const)('never selects the secret token value in %s', name => {
    expect(collectFieldNames(adminWorkerQueries[name])).not.toContain('token');
  });

  it.each([
    'ADMIN_WORKER_REGISTRATION_TOKEN_GET_ONE_QUERY',
    'ADMIN_WORKER_REGISTRATION_TOKEN_CREATE_MUTATION',
  ] as const)('selects the secret token value in %s', name => {
    expect(collectFieldNames(adminWorkerQueries[name])).toContain('token');
  });
});

const ADMIN_ONLY_FIELDS = ['payload', 'agent_info', 'registration_token'];

const nonAdminQueryExports = queryExports.filter(
  ({ module }) => !module.startsWith('admin/') && module !== 'worker/queries',
);

describe('admin-only fields', () => {
  it('detects the admin-only fields where an admin document selects them', () => {
    expect(
      collectFieldNames(adminWorkerQueries.ADMIN_WORKER_GET_ONE_QUERY),
    ).toEqual(expect.arrayContaining(['payload', 'agent_info']));
  });

  it('checks the documents a regular user runs', () => {
    expect(nonAdminQueryExports.map(({ module }) => module)).toEqual(
      expect.arrayContaining([
        'dataset/queries',
        'processing/queries',
        'processor/queries',
        'user/queries',
      ]),
    );
  });

  it.each(nonAdminQueryExports)(
    'never selects an admin-only field in $name of $module',
    ({ document }) => {
      expect(
        collectFieldNames(document).filter(field =>
          ADMIN_ONLY_FIELDS.includes(field),
        ),
      ).toEqual([]);
    },
  );
});

const schema = buildSchema(
  readFileSync(join(__dirname, '..', 'api', 'gql', 'schema.graphql'), 'utf8'),
);
const queryFields = schema.getQueryType()?.getFields() ?? {};

const rootFieldOf = (document: DocumentNode): FieldNode => {
  const operation = document.definitions.find(
    (definition): definition is OperationDefinitionNode =>
      definition.kind === Kind.OPERATION_DEFINITION,
  );
  return operation?.selectionSet.selections[0] as FieldNode;
};

const listQueryExports = queryExports.filter(({ document }) => {
  const field = queryFields[rootFieldOf(document)?.name.value];
  return !!field && /PaginationConnection!?$/.test(String(field.type));
});

describe('list query documents', () => {
  it('finds every list query of the services', () => {
    expect(
      listQueryExports.map(({ document }) => rootFieldOf(document).name.value),
    ).toEqual(
      expect.arrayContaining([
        'adminDatasets',
        'adminProcesses',
        'adminProcessors',
        'adminWorkerRegistrationTokens',
        'adminWorkers',
        'userDatasets',
        'userProcesses',
        'userProcessors',
      ]),
    );
  });

  it.each(listQueryExports)(
    'passes every argument of the API list field in $name of $module',
    ({ document }) => {
      const rootField = rootFieldOf(document);
      const passed = (rootField.arguments ?? []).map(
        argument => argument.name.value,
      );

      expect(
        queryFields[rootField.name.value].args
          .map(argument => argument.name)
          .filter(name => !passed.includes(name)),
      ).toEqual([]);
    },
  );

  it.each(listQueryExports)(
    'binds every page and sorting argument to its own variable and reads the whole page in $name of $module',
    ({ document }) => {
      const rootField = rootFieldOf(document);
      const boundVariables = Object.fromEntries(
        (rootField.arguments ?? []).map(argument => [
          argument.name.value,
          argument.value.kind === Kind.VARIABLE
            ? argument.value.name.value
            : null,
        ]),
      );
      const selected = (field: FieldNode | undefined) =>
        (field?.selectionSet?.selections ?? [])
          .map(selection => (selection as FieldNode).name.value)
          .sort();
      const childOf = (field: FieldNode, name: string) =>
        field.selectionSet?.selections.find(
          selection => (selection as FieldNode).name.value === name,
        ) as FieldNode | undefined;
      const pageArguments = [
        'skip',
        'take',
        'after',
        'first',
        'before',
        'last',
        'sorting',
      ];

      expect({
        bound: Object.fromEntries(
          pageArguments.map(name => [name, boundVariables[name]]),
        ),
        connection: selected(rootField),
        edge: selected(childOf(rootField, 'edges')),
        pageInfo: selected(childOf(rootField, 'pageInfo')),
      }).toEqual({
        bound: Object.fromEntries(pageArguments.map(name => [name, name])),
        connection: ['edges', 'pageInfo', 'totalCount'],
        edge: ['cursor', 'node'],
        pageInfo: [
          'endCursor',
          'hasNextPage',
          'hasPreviousPage',
          'startCursor',
        ],
      });
    },
  );
});
