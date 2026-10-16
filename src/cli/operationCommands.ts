import type { Argv, CommandModule, Options } from 'yargs';
import { z } from 'zod';

// Type import
import type { IOperation } from './operations/types';

// Operation import
import { operations } from './operations/catalog';
import { parseNameValuePairs } from './operations/nameValuePairs';

// UI import
import { printResult } from './ui/printResult';
import { withSpinner } from './ui/withSpinner';

// CLI import
import { getSdk, rememberAccountAdminStatus } from './commands';

type PropertySchema = {
  type?: string | string[];
  enum?: string[];
  description?: string;
  items?: { type?: string };
  nullable?: boolean;
};

const NULL_FLAG_VALUE = 'null';

const toKebabCase = (name: string): string =>
  name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

const YARGS_RESERVED_FLAGS = new Set(['version', 'help']);

const toFlagName = (operation: IOperation, key: string): string => {
  const flag = toKebabCase(key);
  if (!YARGS_RESERVED_FLAGS.has(flag)) return flag;
  const resource = operation.command[operation.command.length - 2];
  return `${resource}-${flag}`;
};

const toCamelCase = (flag: string): string =>
  flag.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());

const isPlainList = (property: PropertySchema): boolean =>
  property.type === 'array' && property.items?.type === 'string';

const describeInput = (operation: IOperation) => {
  const schema = z.toJSONSchema(z.object(operation.input), {
    io: 'input',
  }) as { properties: Record<string, PropertySchema>; required?: string[] };
  const required = new Set(schema.required ?? []);
  Object.values(schema.properties).forEach(property => {
    if (Array.isArray(property.type))
      Object.assign(property, {
        type: property.type.find(type => type !== 'null'),
        nullable: property.type.includes('null'),
      });
  });
  return { properties: schema.properties, required };
};

const SCALAR_OPTION_TYPES = new Map<string, 'number' | 'boolean' | 'string'>([
  ['integer', 'number'],
  ['number', 'number'],
  ['boolean', 'boolean'],
  ['string', 'string'],
]);

const toOption = (property: PropertySchema, demandOption: boolean): Options => {
  const describe = property.nullable
    ? `${property.description as string} Pass "${NULL_FLAG_VALUE}" to clear it.`
    : (property.description as string);
  if (property.enum)
    return { type: 'string', choices: property.enum, demandOption, describe };
  const scalarType = SCALAR_OPTION_TYPES.get(property.type as string);
  if (scalarType) return { type: scalarType, demandOption, describe };
  if (isPlainList(property))
    return {
      type: 'array',
      string: true,
      demandOption,
      describe: `${describe} Repeatable.`,
    };
  return {
    type: 'string',
    demandOption,
    describe: `${describe} As a JSON string.`,
  };
};

const registerOption = (
  builder: Argv,
  key: string,
  property: PropertySchema,
  isRequired: boolean,
  operation: IOperation,
): void => {
  if (operation.pairsOption?.key === key) {
    builder.option(operation.pairsOption.flag, {
      type: 'array',
      default: [],
      describe: `${property.description as string} Repeatable name=value.`,
    });
    return;
  }

  builder.option(toFlagName(operation, key), toOption(property, isRequired));
};

const readInput = (
  operation: IOperation,
  args: Record<string, unknown>,
  properties: Record<string, PropertySchema>,
): Record<string, unknown> => {
  const input: Record<string, unknown> = {};

  Object.entries(properties).forEach(([key, property]) => {
    if (operation.pairsOption?.key === key) {
      input[key] = parseNameValuePairs(
        operation.pairsOption.flag,
        args[operation.pairsOption.flag] as (string | number)[],
      );
      return;
    }

    const value = args[toCamelCase(toFlagName(operation, key))];
    if (value === undefined) return;
    if (property.nullable && value === NULL_FLAG_VALUE) {
      input[key] = null;
      return;
    }

    const isJson =
      !property.enum &&
      !SCALAR_OPTION_TYPES.has(property.type as string) &&
      !isPlainList(property);
    if (!isJson) {
      input[key] = value;
      return;
    }

    try {
      input[key] = JSON.parse(value as string);
    } catch {
      throw new Error(
        `Invalid --${toFlagName(operation, key)}, expected JSON.`,
      );
    }
  });

  return input;
};

const buildCommand = (
  operation: IOperation,
  path: string[],
): CommandModule<object, Record<string, unknown>> => {
  const { properties, required } = describeInput(operation);
  const positionals = operation.positionals ?? [];
  const leaf = path[path.length - 1];
  const usage = [leaf, ...positionals.map(name => `<${name}>`)].join(' ');

  return {
    command: usage,
    describe: operation.description,
    builder: builder => {
      positionals.forEach(name => {
        builder.positional(name, {
          type: 'string',
          demandOption: true,
          describe: properties[name]?.description,
        });
      });
      Object.entries(properties)
        .filter(([key]) => !positionals.includes(key))
        .forEach(([key, property]) =>
          registerOption(builder, key, property, required.has(key), operation),
        );
      return builder;
    },
    handler: async args => {
      const parsed = z
        .object(operation.input)
        .safeParse(readInput(operation, args, properties));
      if (!parsed.success)
        throw new Error(
          parsed.error.issues
            .map(issue => `${issue.path.join('.')}: ${issue.message}`)
            .join('; '),
        );
      const input = parsed.data;
      const result = await withSpinner('Working...', () =>
        operation.run(getSdk(), input as never),
      );
      if (operation.remembersAccount)
        await rememberAccountAdminStatus(result as { is_admin: boolean });
      printResult(
        operation.project ? operation.project(result) : result,
        args.json as boolean,
      );
    },
  };
};

const registerAt = (
  builder: Argv,
  entries: { operation: IOperation; path: string[] }[],
  depth: number,
  descriptions: Record<string, string>,
  hiddenGroups: Set<string>,
  isHidden = false,
): void => {
  const leaves = entries.filter(entry => entry.path.length === depth + 1);
  const groups = new Map<string, typeof entries>();
  entries
    .filter(entry => entry.path.length > depth + 1)
    .forEach(entry => {
      const name = entry.path[depth];
      groups.set(name, [...(groups.get(name) ?? []), entry]);
    });

  leaves.forEach(({ operation, path }) => {
    const module = buildCommand(operation, path);
    builder.command(isHidden ? { ...module, describe: false } : module);
  });

  groups.forEach((groupEntries, name) => {
    const groupPath = groupEntries[0].path.slice(0, depth + 1).join(' ');
    const isGroupHidden = isHidden || hiddenGroups.has(groupPath);
    const describe = (
      isGroupHidden ? false : descriptions[groupPath]
    ) as string;
    builder.command(name, describe, child => {
      registerAt(
        child,
        groupEntries,
        depth + 1,
        descriptions,
        hiddenGroups,
        isGroupHidden,
      );
      return child.demandCommand(1);
    });
  });
};

const GROUP_DESCRIPTIONS: Record<string, string> = {
  session: 'Inspect or close your sessions.',
  profile: 'Manage your AutoDroid profile.',
  connections: 'Manage the apps and agents connected to your account.',
  dataset: 'Manage your datasets.',
  processor: 'Browse the available processors.',
  processing: 'Manage your processing runs.',
  health: 'Check the service health.',
  admin:
    'Administrative operations. Only offered to an admin account; the API rejects them for any other.',
  'admin dataset': 'Manage any dataset.',
  'admin processor': 'Manage processors.',
  'admin processing': 'Manage any processing run.',
  'admin worker': 'Manage workers.',
  'admin worker-token': 'Manage worker registration tokens.',
  'admin file': 'Manage stored files.',
};

const registerOperationCommands = (
  builder: Argv,
  options: { showAdmin: boolean },
): void => {
  const entries = operations.flatMap(operation =>
    [operation.command, ...(operation.aliases ?? [])].map(path => ({
      operation,
      path,
    })),
  );
  const hiddenGroups = new Set(options.showAdmin ? [] : ['admin']);

  registerAt(builder, entries, 0, GROUP_DESCRIPTIONS, hiddenGroups);
};

export { GROUP_DESCRIPTIONS, registerOperationCommands };
