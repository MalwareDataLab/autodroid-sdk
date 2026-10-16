import { expect, it } from 'vitest';
import { z } from 'zod';

// SDK import
import type { AutoDroidSdk } from '@package';

// Type import
import type { IOperation } from '../../src/cli/operations/types';

// Operation import
import { operations } from '../../src/cli/operations/catalog';

interface IRecordedCall {
  path: string;
  args: unknown[];
}

export interface IOperationCase {
  name: string;
  input: Record<string, unknown>;
  call: string;
  args: unknown[];
  answer: unknown;
  result: unknown;
}

export const buildFakeSdk = (answers: Record<string, unknown> = {}) => {
  const calls: IRecordedCall[] = [];
  const proxyFor = (path: string[]): any =>
    new Proxy(() => undefined, {
      get: (_target, key) => proxyFor([...path, String(key)]),
      apply: (_target, _this, args) => {
        const joined = path.join('.');
        calls.push({ path: joined, args });
        const answer = answers[joined];
        return answer instanceof Error
          ? Promise.reject(answer)
          : Promise.resolve(answer);
      },
    });

  return { sdk: proxyFor([]) as AutoDroidSdk, calls };
};

export const operationNamed = (name: string) => {
  const operation = operations.find(candidate => candidate.name === name);
  if (!operation) throw new Error(`No operation named ${name}`);
  return operation;
};

export const inputOf = (name: string) =>
  z.toJSONSchema(z.object(operationNamed(name).input), { io: 'input' }) as {
    properties: Record<string, { description?: string; enum?: string[] }>;
  };

export const SORTING = [
  { field: 'created_at', order: 'ASC' },
  { field: 'id', order: 'DESC' },
];

export const connection = (...nodes: unknown[]) => ({
  edges: nodes.map(node => ({ node })),
  totalCount: 12,
  pageInfo: { hasNextPage: true },
});

export const listPage = (...items: unknown[]) => ({
  items,
  total_count: 12,
  has_next_page: true,
});

export const dateTimeInputsOf = (operationList: IOperation[]) =>
  operationList.flatMap(operation =>
    Object.entries(
      (
        z.toJSONSchema(z.object(operation.input), { io: 'input' }) as {
          properties: Record<string, { format?: string; description?: string }>;
        }
      ).properties,
    )
      .filter(([, property]) => property.format === 'date-time')
      .map(
        ([key, property]) =>
          [operation.name, key, property.description] as const,
      ),
  );

export const itTakesDateTimeInputsWithAnOffset = (
  operationList: IOperation[],
) =>
  it.each(dateTimeInputsOf(operationList))(
    '%s should take %s with Z or a UTC offset, and say so',
    (name, key, description) => {
      const property = z.object(operationNamed(name).input).shape[
        key
      ] as z.ZodType;

      expect(property.safeParse('2030-01-31T00:00:00Z').success).toBe(true);
      expect(property.safeParse('2030-01-31T00:00:00+03:00').success).toBe(
        true,
      );
      expect(property.safeParse('2030-01-31T00:00:00-0300').success).toBe(
        false,
      );
      expect(property.safeParse('2030-01-31T00:00:00').success).toBe(false);
      expect(property.safeParse('2030-01-31').success).toBe(false);
      expect(description).toMatch(/with Z or a UTC offset/);
    },
  );

export const itTakesNullToClear = (cases: [string, string][]) =>
  it.each(cases)(
    '%s should take null for %s and say that null clears it',
    (name, key) => {
      const schema = z.object(operationNamed(name).input);

      expect((schema.shape[key] as z.ZodType).safeParse(null).success).toBe(
        true,
      );
      expect(inputOf(name).properties[key].description).toMatch(/null.*clear/i);
    },
  );

export const itSaysUpdateReplacesDescriptionAndTags = (names: string[]) =>
  it.each(names)(
    '%s should say that the API replaces both description and tags, clearing an omitted one',
    name => {
      const { properties } = inputOf(name);

      expect(properties.description.description).toMatch(/omitted.*cleared/i);
      expect(properties.tags.description).toMatch(/omitted.*cleared/i);
      expect(operationNamed(name).description).toMatch(/replaces both/i);
    },
  );

export const itBehavesAsItsCases = (
  domainOperations: IOperation[],
  cases: IOperationCase[],
  { coveredByOwnFlows = [] }: { coveredByOwnFlows?: string[] } = {},
) => {
  it.each(cases)(
    '$name should call sdk.$call with exactly the mapped arguments and return only the projected fields ($input)',
    async ({ name, input, call, args, answer, result }) => {
      const operation = operationNamed(name);
      const { sdk, calls } = buildFakeSdk({ [call]: answer });

      const raw = await operation.run(
        sdk,
        z.object(operation.input).parse(input) as never,
      );

      expect(calls).toEqual([{ path: call, args }]);
      expect(operation.project ? operation.project(raw) : raw).toEqual(result);
    },
  );

  it.each(cases)(
    '$name should return exactly its declared output fields ($input)',
    async ({ name, input, call, answer }) => {
      const operation = operationNamed(name);
      const { sdk } = buildFakeSdk({ [call]: answer });

      const raw = await operation.run(
        sdk,
        z.object(operation.input).parse(input) as never,
      );
      const projected = operation.project ? operation.project(raw) : raw;
      const records = Array.isArray(projected) ? projected : [projected];

      expect(records.length).toBeGreaterThan(0);
      records.forEach(record =>
        expect(Object.keys(record as object).sort()).toEqual(
          [...operation.output].sort(),
        ),
      );
    },
  );

  const listCases = cases.filter(
    ({ name }) =>
      /(^|_)list_/.test(name) || operationNamed(name).itemOutput !== undefined,
  );
  if (listCases.length > 0)
    it.each(listCases)(
      '$name should return one page: its items with their declared fields, the total count and whether more follow ($input)',
      async ({ name, input, call, answer }) => {
        const operation = operationNamed(name);
        const { sdk } = buildFakeSdk({ [call]: answer });

        const raw = await operation.run(
          sdk,
          z.object(operation.input).parse(input) as never,
        );
        const projected = (
          operation.project ? operation.project(raw) : raw
        ) as {
          items: object[];
        };

        expect(operation.output).toEqual([
          'items',
          'total_count',
          'has_next_page',
        ]);
        expect(operation.description).toMatch(
          /Returns one page: items, total_count .*has_next_page/,
        );
        expect(projected.items.length).toBeGreaterThan(0);
        projected.items.forEach(item =>
          expect(Object.keys(item).sort()).toEqual(
            [...(operation.itemOutput ?? [])].sort(),
          ),
        );
      },
    );

  it('should have a behaviour case for every operation', () => {
    const covered = new Set([
      ...cases.map(testCase => testCase.name),
      ...coveredByOwnFlows,
    ]);

    expect(
      domainOperations
        .map(operation => operation.name)
        .filter(name => !covered.has(name)),
    ).toEqual([]);
  });
};
