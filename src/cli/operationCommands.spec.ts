import { beforeEach, describe, expect, it, vi } from 'vitest';
import yargs from 'yargs';

// Operation import
import { operations } from './operations/catalog';

// Target import
import {
  GROUP_DESCRIPTIONS,
  registerOperationCommands,
} from './operationCommands';

const h = vi.hoisted(() => ({
  sdk: {
    dataset: { getMany: vi.fn(), getOne: vi.fn() },
    processor: { getMany: vi.fn() },
    processing: { getMany: vi.fn(), requestDatasetProcessing: vi.fn() },
    user: {
      getCurrent: vi.fn(),
      update: vi.fn(),
      updateLearningData: vi.fn(),
      closeSessions: vi.fn(),
    },
    admin: {
      dataset: { updateVisibility: vi.fn() },
      processor: { create: vi.fn() },
      worker: { getMany: vi.fn() },
    },
  },
  rememberAccountAdminStatus: vi.fn(),
}));

vi.mock('./commands', () => ({
  getSdk: () => h.sdk,
  rememberAccountAdminStatus: h.rememberAccountAdminStatus,
}));
vi.mock('./ui/withSpinner', () => ({
  withSpinner: (_label: string, task: () => Promise<unknown>) => task(),
}));

const parse = async (argv: string[], showAdmin = true) => {
  const program = yargs(argv)
    .exitProcess(false)
    .wrap(null)
    .option('json', { type: 'boolean', default: false })
    .fail((message, error) => {
      throw error ?? new Error(message);
    });
  registerOperationCommands(program, { showAdmin });
  await program.demandCommand(1).strict().parseAsync();
};

describe('CLI: registerOperationCommands', () => {
  let output: string[];

  beforeEach(() => {
    vi.clearAllMocks();
    output = [];
    vi.spyOn(console, 'log').mockImplementation(line => {
      output.push(String(line));
    });
    vi.spyOn(console, 'table').mockImplementation(() => undefined);
  });

  it.each(
    operations.flatMap(operation =>
      [operation.command, ...(operation.aliases ?? [])].map(path => ({
        path,
        description: operation.description,
      })),
    ),
  )(
    'should offer "$path" with the operation description',
    async ({ path, description }) => {
      await parse([...path, '--help']);

      const helpText = output.join(' ').replace(/\s+/g, ' ');
      expect(helpText).toContain(description.replace(/\s+/g, ' '));
    },
  );

  it('should run a list operation with the requested page size and offset', async () => {
    h.sdk.dataset.getMany.mockResolvedValue({
      edges: [],
      totalCount: 6,
      pageInfo: { hasNextPage: false },
    });

    await parse(['dataset', 'list', '--take', '3', '--skip', '6']);

    expect(h.sdk.dataset.getMany).toHaveBeenCalledWith({ skip: 6, take: 3 });
    expect(output.join('\n')).toContain('No results.');
    expect(output.join('\n')).toContain('Showing 0 of 6.');
  });

  it.each([
    ['datasets', 'dataset'],
    ['processors', 'processor'],
    ['processes', 'processing'],
  ] as const)(
    'should run the same list through its plural alias "%s"',
    async (alias, resource) => {
      h.sdk[resource].getMany.mockResolvedValue({
        edges: [],
        totalCount: 0,
        pageInfo: { hasNextPage: false },
      });

      await parse([alias, '--take', '4']);

      expect(h.sdk[resource].getMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 4 }),
      );
    },
  );

  it('should run the admin worker list through its plural alias "admin workers"', async () => {
    h.sdk.admin.worker.getMany.mockResolvedValue({
      edges: [],
      totalCount: 0,
      pageInfo: { hasNextPage: false },
    });

    await parse(['admin', 'workers']);

    expect(h.sdk.admin.worker.getMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    );
  });

  it('should pass a positional argument and print the projection, not the raw result', async () => {
    h.sdk.dataset.getOne.mockResolvedValue({
      id: 'dataset-1',
      description: 'd',
      file: { upload_url: 'https://secret.example/upload' },
    });

    await parse(['dataset', 'show', 'dataset-1', '--json']);

    expect(h.sdk.dataset.getOne).toHaveBeenCalledWith({
      datasetId: 'dataset-1',
    });
    expect(output.join('\n')).toContain('"id": "dataset-1"');
    expect(output.join('\n')).not.toContain('secret.example');
  });

  it('should collect repeatable --param pairs into processor parameters', async () => {
    h.sdk.processing.requestDatasetProcessing.mockResolvedValue({
      id: 'processing-1',
    });

    await parse([
      'processing',
      'run',
      '--dataset-id',
      'dataset-1',
      '--processor-id',
      'processor-1',
      '--param',
      'k_fold=2',
      '--param',
      'expr=a=b',
    ]);

    expect(h.sdk.processing.requestDatasetProcessing).toHaveBeenCalledWith({
      data: {
        dataset_id: 'dataset-1',
        processor_id: 'processor-1',
        parameters: [
          { name: 'k_fold', value: '2' },
          { name: 'expr', value: 'a=b' },
        ],
      },
    });
  });

  it('should reject a malformed --param before calling the API', async () => {
    await expect(
      parse([
        'processing',
        'run',
        '--dataset-id',
        'd',
        '--processor-id',
        'p',
        '--param',
        'not-a-pair',
      ]),
    ).rejects.toThrowError(
      'Invalid --param "not-a-pair", expected name=value.',
    );
    expect(h.sdk.processing.requestDatasetProcessing).not.toHaveBeenCalled();
  });

  it('should take an object option as JSON', async () => {
    h.sdk.user.updateLearningData.mockResolvedValue({ id: 'user-1' });

    await parse(['profile', 'update-learning-data', '--data', '{"level":2}']);

    expect(h.sdk.user.updateLearningData).toHaveBeenCalledWith({
      data: { level: 2 },
    });
  });

  it('should reject an object option that is not valid JSON', async () => {
    await expect(
      parse(['profile', 'update-learning-data', '--data', '{nope']),
    ).rejects.toThrowError('Invalid --data, expected JSON.');
    expect(h.sdk.user.updateLearningData).not.toHaveBeenCalled();
  });

  it('should reject a positional enum value outside the allowed set with the field named', async () => {
    await expect(
      parse(['admin', 'dataset', 'set-visibility', 'dataset-1', 'NOPE']),
    ).rejects.toThrowError(/^visibility: /);
    expect(h.sdk.admin.dataset.updateVisibility).not.toHaveBeenCalled();
  });

  it('should reject a page size above the API limit', async () => {
    await expect(
      parse(['dataset', 'list', '--take', '101']),
    ).rejects.toThrowError(/^take: /);
    expect(h.sdk.dataset.getMany).not.toHaveBeenCalled();
  });

  it('should remember the admin status from the whoami result itself, without asking the API again', async () => {
    const user = { id: 'user-1', is_admin: true };
    h.sdk.user.getCurrent.mockResolvedValue(user);

    await parse(['whoami']);

    expect(h.sdk.user.getCurrent).toHaveBeenCalledOnce();
    expect(h.rememberAccountAdminStatus).toHaveBeenCalledExactlyOnceWith(user);
  });

  it('should remember the account only for the operations that declare it', () => {
    expect(
      operations
        .filter(operation => operation.remembersAccount)
        .map(operation => operation.name),
    ).toEqual(['whoami']);
  });

  it('should not touch the stored admin status for other commands', async () => {
    h.sdk.dataset.getMany.mockResolvedValue({
      edges: [],
      totalCount: 0,
      pageInfo: { hasNextPage: false },
    });

    await parse(['dataset', 'list']);

    expect(h.rememberAccountAdminStatus).not.toHaveBeenCalled();
  });

  it('should keep the admin group out of --help but runnable when the account is not known to be an admin', async () => {
    h.sdk.admin.dataset.updateVisibility.mockResolvedValue({ id: 'dataset-1' });

    await parse(['--help'], false).catch(() => undefined);
    await parse(
      ['admin', 'dataset', 'set-visibility', 'dataset-1', 'PUBLIC'],
      false,
    );

    expect(output.join('\n')).toContain('dataset');
    expect(output.join('\n')).not.toMatch(/\badmin\b/);
    expect(h.sdk.admin.dataset.updateVisibility).toHaveBeenCalledWith({
      datasetId: 'dataset-1',
      data: { visibility: 'PUBLIC' },
    });
  });

  it.each([[['admin']], [['admin', 'dataset']], [['admin', 'worker-token']]])(
    'should list no admin subcommand in "%s --help" when the account is not known to be an admin',
    async path => {
      await parse([...path, '--help'], false).catch(() => undefined);

      const helpText = output.join(' ').replace(/\s+/g, ' ');
      const adminDescriptions = [
        ...Object.entries(GROUP_DESCRIPTIONS)
          .filter(([group]) => group.startsWith('admin '))
          .map(([, description]) => description),
        ...operations
          .filter(operation => operation.command[0] === 'admin')
          .map(operation => operation.description.replace(/\s+/g, ' ')),
      ];
      expect(helpText).toContain('Options:');
      adminDescriptions.forEach(description =>
        expect(helpText).not.toContain(description),
      );
      expect(output.join('\n')).not.toMatch(/^\s+\S+ admin \S+/m);
    },
  );

  it.each([[['admin']], [['admin', 'dataset']]])(
    'should still list the admin subcommands in "%s --help" for an admin account',
    async path => {
      await parse([...path, '--help'], true).catch(() => undefined);

      expect(output.join('\n')).toMatch(/^\s+\S+ admin \S+/m);
    },
  );

  it("should not let an input named 'version' collide with the CLI's own --version", async () => {
    h.sdk.admin.processor.create.mockResolvedValue({
      id: 'processor-1',
      configuration: { parameters: [] },
    });

    await parse([
      'admin',
      'processor',
      'create',
      '--name=Synth',
      '--processor-version=1.2.0',
      '--image-tag=synth:1.2.0',
      '--allowed-mime-types=application/zip',
      '--visibility=PUBLIC',
      '--command=run',
      '--dataset-input-argument=input',
      '--dataset-input-value=/in',
      '--dataset-output-argument=output',
      '--dataset-output-value=/out',
      '--output-metrics-file-glob-patterns=*.zip',
      '--output-result-file-glob-patterns=*.csv',
      '--parameters=[{"sequence":1,"name":"k","description":"d","type":"INTEGER","isRequired":true}]',
      '--description=Finds malware',
      '--tags=a,b',
    ]);

    expect(h.sdk.admin.processor.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Synth',
        version: '1.2.0',
        description: 'Finds malware',
        tags: 'a,b',
      }),
    });
  });

  it('should print an operation result as is when the operation declares no projection', async () => {
    h.sdk.user.closeSessions.mockResolvedValue(undefined);

    await parse(['session', 'close', '--json']);

    expect(JSON.parse(output.join('\n'))).toEqual({ closed: true });
  });

  it.each(
    [
      ...new Set(
        operations.flatMap(operation =>
          [operation.command, ...(operation.aliases ?? [])].flatMap(path =>
            path
              .slice(0, -1)
              .map((_segment, index) => path.slice(0, index + 1).join(' ')),
          ),
        ),
      ),
    ].map(group => [group]),
  )('should describe the command group "%s"', group => {
    expect(GROUP_DESCRIPTIONS[group]).toEqual(expect.any(String));
  });

  it('should describe every option so --help and the MCP tool schema explain it', () => {
    operations.forEach(operation => {
      Object.entries(operation.input).forEach(([key, schema]) => {
        expect(
          (schema as { description?: string }).description,
          `${operation.name}.${key} has no description`,
        ).toEqual(expect.any(String));
      });
    });
  });

  it('should clear a nullable input when its flag is given the literal "null"', async () => {
    h.sdk.user.update.mockResolvedValue({ id: 'user-1' });

    await parse([
      'profile',
      'update',
      '--name',
      'Ada',
      '--phone-number',
      'null',
    ]);

    expect(h.sdk.user.update).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: 'Ada', phone_number: null }),
    });
  });

  it('should keep "null" as text for an input that cannot be null', async () => {
    h.sdk.user.update.mockResolvedValue({ id: 'user-1' });

    await parse(['profile', 'update', '--name', 'null']);

    expect(h.sdk.user.update).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: 'null' }),
    });
  });

  it('should tell how to clear a nullable input in its help', async () => {
    await parse(['profile', 'update', '--help']);

    expect(output.join('\n')).toContain('Pass "null" to clear it.');
  });
});
