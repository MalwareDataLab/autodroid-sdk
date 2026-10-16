import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSchema } from 'graphql';
import { describe, expect, it } from 'vitest';

// Util import
import { dateTimeInputsOf } from '../../../test/support/operationCases';

// Target import
import {
  adminAccessOperations,
  operations,
  userAccessOperations,
} from './catalog';

const WORKER_ROLE_FIELDS = [
  'worker',
  'workerProcessing',
  'workerProcessingCaptureMetricsFileUpload',
  'workerProcessingCaptureResultFileUpload',
  'workerProcessingGenerateMetricsFileUpload',
  'workerProcessingGenerateResultFileUpload',
  'workerProcessingRegisterFailure',
  'workerProcessingRegisterProgress',
  'workerProcessingRegisterSuccess',
  'workerRegister',
  'workerUpdateAccessToken',
  'workerUpdateRefreshToken',
];

const NAMING_EXCEPTIONS = [
  'whoami',
  'health_check',
  'health_liveness',
  'health_readiness',
];

const hasWord = (nameWords: string[], cliWord: string): boolean =>
  nameWords.some(
    nameWord =>
      nameWord === cliWord ||
      nameWord === `${cliWord}s` ||
      `${nameWord}s` === cliWord,
  );

const schema = buildSchema(
  readFileSync(
    join(__dirname, '..', '..', 'api', 'gql', 'schema.graphql'),
    'utf8',
  ),
);

const rootFields = (type: ReturnType<typeof schema.getQueryType>) =>
  Object.keys(type?.getFields() ?? {});

const CURSOR_ARGUMENTS = ['after', 'before', 'first', 'last'];

const toCamelCase = (name: string): string =>
  name.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());

const queryFields = schema.getQueryType()?.getFields() ?? {};

const listFields = Object.values(queryFields).filter(field =>
  /PaginationConnection!?$/.test(String(field.type)),
);

const apiFields = [
  ...rootFields(schema.getQueryType()),
  ...rootFields(schema.getMutationType()),
].filter(field => !WORKER_ROLE_FIELDS.includes(field));

describe('Operations: catalog', () => {
  describe('parity with the API', () => {
    it('should cover every user, health and admin operation of the API, and nothing else', () => {
      const covered = operations.map(operation => operation.field).sort();

      expect(covered).toEqual([...apiFields].sort());
    });

    it('should never run one API operation from two catalog entries', () => {
      const fields = operations.map(operation => operation.field);

      expect(new Set(fields).size).toBe(fields.length);
    });

    it('should take every list argument of the API, cursors aside, as an input of the list operation', () => {
      const listOperations = operations.filter(operation =>
        listFields.some(field => field.name === operation.field),
      );

      expect(listOperations.map(operation => operation.field).sort()).toEqual([
        'adminDatasets',
        'adminProcesses',
        'adminProcessors',
        'adminWorkerRegistrationTokens',
        'adminWorkers',
        'userDatasets',
        'userProcesses',
        'userProcessors',
      ]);
      listOperations.forEach(operation => {
        const missing = queryFields[operation.field].args
          .map(argument => argument.name)
          .filter(name => !CURSOR_ARGUMENTS.includes(name))
          .map(toCamelCase)
          .filter(name => !(name in operation.input));

        expect(missing, operation.name).toEqual([]);
      });
    });

    it('should mark an operation admin-only exactly when its API root field name starts with `admin`', () => {
      operations.forEach(operation => {
        expect(
          operation.access === 'admin',
          `${operation.name} (${operation.field})`,
        ).toBe(operation.field.startsWith('admin'));
      });
    });
  });

  describe('shape', () => {
    it('should split into the user and admin operations of the contract', () => {
      expect(userAccessOperations).toHaveLength(26);
      expect(adminAccessOperations).toHaveLength(27);
      expect(operations).toHaveLength(53);
    });

    it('should give every operation a unique, tool-safe name', () => {
      const names = operations.map(operation => operation.name);

      expect(new Set(names).size).toBe(names.length);
      names.forEach(name => expect(name).toMatch(/^[a-z][a-z_]*$/));
    });

    it('should name every tool after its CLI command: admin_ prefix for admin, the verb first, then every word of the resource and the command', () => {
      operations
        .filter(operation => !NAMING_EXCEPTIONS.includes(operation.name))
        .forEach(operation => {
          const isAdmin = operation.command[0] === 'admin';
          const [resource, verb] = (
            isAdmin ? operation.command.slice(1) : operation.command
          ).map(segment => segment.split('-'));
          const nameWords = operation.name.replace(/^admin_/, '').split('_');

          expect(operation.name.startsWith('admin_'), operation.name).toBe(
            isAdmin,
          );
          expect(nameWords[0], operation.name).toBe(verb[0]);
          [...resource, ...verb].forEach(cliWord =>
            expect(
              hasWord(nameWords, cliWord),
              `${operation.name}: ${cliWord}`,
            ).toBe(true),
          );
        });
    });

    it('should keep the naming exceptions to operations that really are one', () => {
      expect(
        NAMING_EXCEPTIONS.map(
          name =>
            operations.find(operation => operation.name === name)?.command,
        ),
      ).toEqual([
        ['whoami'],
        ['health', 'check'],
        ['health', 'liveness'],
        ['health', 'readiness'],
      ]);
    });

    it('should find every date-time input of the catalog', () => {
      expect(dateTimeInputsOf(operations)).toHaveLength(8);
    });

    it('should declare the top-level output fields of every operation, each once', () => {
      operations.forEach(operation => {
        expect(operation.output.length, operation.name).toBeGreaterThan(0);
        expect(new Set(operation.output).size, operation.name).toBe(
          operation.output.length,
        );
      });
    });

    it('should give every command path, aliases included, to exactly one operation', () => {
      const paths = operations.flatMap(operation =>
        [operation.command, ...(operation.aliases ?? [])].map(path =>
          path.join(' '),
        ),
      );

      expect(new Set(paths).size).toBe(paths.length);
    });

    it('should keep every admin command under `admin` and nothing else there', () => {
      operations.forEach(operation => {
        expect(operation.command[0] === 'admin', operation.name).toBe(
          operation.access === 'admin',
        );
      });
    });

    it('should describe every operation, and say so when it needs admin access', () => {
      operations.forEach(operation => {
        expect(operation.description.length, operation.name).toBeGreaterThan(
          10,
        );
        if (operation.access === 'admin')
          expect(operation.description, operation.name).toContain(
            'Requires admin access.',
          );
      });
    });

    it('should only declare positionals that are real input keys', () => {
      operations.forEach(operation => {
        (operation.positionals ?? []).forEach(key =>
          expect(Object.keys(operation.input), operation.name).toContain(key),
        );
      });
    });

    it('should mark every operation that changes data as a write or a destructive one', () => {
      const readOnlyVerbs =
        /^(whoami|get_|list_|show_|estimate_|health_|admin_(list|show|estimate)_)/;

      operations.forEach(operation => {
        expect(operation.effect === 'read', operation.name).toBe(
          readOnlyVerbs.test(operation.name),
        );
      });
    });
  });
});
