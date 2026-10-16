import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

// Util import
import {
  buildFakeSdk,
  connection,
  IOperationCase,
  itBehavesAsItsCases,
  itSaysUpdateReplacesDescriptionAndTags,
  itTakesNullToClear,
  listPage,
  operationNamed,
  SORTING,
} from '../../../test/support/operationCases';
import {
  DATASET,
  PROJECTED_DATASET,
  PROJECTED_DATASET_DETAIL,
} from '../../../test/support/operationFixtures';

// Target import
import { datasetOperations } from './datasetOperations';

const uploadDatasetFileMock = vi.hoisted(() => vi.fn());

vi.mock('./datasetFile', async importOriginal => ({
  ...(await importOriginal<typeof import('./datasetFile')>()),
  uploadDatasetFile: uploadDatasetFileMock,
}));

const cases: IOperationCase[] = [
  {
    name: 'list_datasets',
    input: {},
    call: 'dataset.getMany',
    args: [{ skip: 0, take: 10 }],
    answer: connection(DATASET),
    result: listPage(PROJECTED_DATASET),
  },
  {
    name: 'list_datasets',
    input: { take: 25, skip: 50 },
    call: 'dataset.getMany',
    args: [{ skip: 50, take: 25 }],
    answer: connection(DATASET),
    result: listPage(PROJECTED_DATASET),
  },
  {
    name: 'list_datasets',
    input: { take: 25, sorting: SORTING },
    call: 'dataset.getMany',
    args: [{ skip: 0, take: 25, sorting: SORTING }],
    answer: connection(DATASET),
    result: listPage(PROJECTED_DATASET),
  },
  {
    name: 'show_dataset',
    input: { datasetId: 'dataset-1' },
    call: 'dataset.getOne',
    args: [{ datasetId: 'dataset-1' }],
    answer: DATASET,
    result: PROJECTED_DATASET_DETAIL,
  },
  {
    name: 'update_dataset',
    input: { datasetId: 'dataset-1', description: 'New', tags: 'c' },
    call: 'dataset.update',
    args: [{ datasetId: 'dataset-1', data: { description: 'New', tags: 'c' } }],
    answer: DATASET,
    result: PROJECTED_DATASET,
  },
  {
    name: 'update_dataset',
    input: { datasetId: 'dataset-1', description: null, tags: null },
    call: 'dataset.update',
    args: [{ datasetId: 'dataset-1', data: { description: null, tags: null } }],
    answer: DATASET,
    result: PROJECTED_DATASET,
  },
  {
    name: 'delete_dataset',
    input: { datasetId: 'dataset-1' },
    call: 'dataset.delete',
    args: [{ datasetId: 'dataset-1' }],
    answer: DATASET,
    result: PROJECTED_DATASET,
  },
  {
    name: 'publish_dataset',
    input: { datasetId: 'dataset-1' },
    call: 'dataset.requestPublication',
    args: [{ datasetId: 'dataset-1' }],
    answer: DATASET,
    result: PROJECTED_DATASET,
  },
];

describe('Operations: dataset', () => {
  itBehavesAsItsCases(datasetOperations, cases, {
    coveredByOwnFlows: ['create_dataset'],
  });

  describe('create_dataset', () => {
    let directory: string;

    beforeAll(() => {
      directory = mkdtempSync(join(tmpdir(), 'autodroid-create-dataset-'));
    });

    afterAll(() => {
      rmSync(directory, { recursive: true, force: true });
    });

    const csvPath = () => {
      const path = join(directory, 'samples.csv');
      writeFileSync(path, 'a,b\n1,2\n');
      return path;
    };

    it('should describe the file, register the dataset, upload the file to the signed URL and return the projected dataset', async () => {
      uploadDatasetFileMock.mockReset().mockResolvedValue(undefined);
      const operation = operationNamed('create_dataset');
      const { sdk, calls } = buildFakeSdk({ 'dataset.create': DATASET });

      const result = await operation.run(
        sdk,
        z.object(operation.input).parse({
          filePath: csvPath(),
          description: 'Samples',
          tags: 'a,b',
        }) as never,
      );

      expect(calls).toEqual([
        {
          path: 'dataset.create',
          args: [
            {
              data: {
                description: 'Samples',
                tags: 'a,b',
                filename: 'samples.csv',
                md5_hash: expect.stringMatching(/^[0-9a-f]{32}$/),
                mime_type: 'CSV',
                size: 8,
              },
            },
          ],
        },
      ]);
      expect(uploadDatasetFileMock).toHaveBeenCalledWith({
        uploadUrl: 'https://storage.example/upload',
        file: expect.objectContaining({
          filename: 'samples.csv',
          mime_type: 'CSV',
        }),
      });
      expect(operation.project?.(result)).toEqual(PROJECTED_DATASET);
      expect(Object.keys(operation.project?.(result) as object).sort()).toEqual(
        [...operation.output].sort(),
      );
    });

    it('should delete the dataset it just registered when the upload fails, and report the upload failure', async () => {
      uploadDatasetFileMock
        .mockReset()
        .mockRejectedValue(
          new Error('The file upload failed with status 403.'),
        );
      const operation = operationNamed('create_dataset');
      const { sdk, calls } = buildFakeSdk({ 'dataset.create': DATASET });

      await expect(
        operation.run(
          sdk,
          z.object(operation.input).parse({ filePath: csvPath() }) as never,
        ),
      ).rejects.toThrowError('The file upload failed with status 403.');

      expect(calls.map(call => call.path)).toEqual([
        'dataset.create',
        'dataset.delete',
      ]);
      expect(calls[1].args).toEqual([{ datasetId: 'dataset-1' }]);
    });

    it('should still report the upload failure when removing the half-created dataset fails too', async () => {
      uploadDatasetFileMock
        .mockReset()
        .mockRejectedValue(new Error('upload failed'));
      const operation = operationNamed('create_dataset');
      const { sdk } = buildFakeSdk({
        'dataset.create': DATASET,
        'dataset.delete': new Error('delete failed'),
      });

      await expect(
        operation.run(
          sdk,
          z.object(operation.input).parse({ filePath: csvPath() }) as never,
        ),
      ).rejects.toThrowError('upload failed');
    });

    it('should delete the dataset and fail when the API returned no upload URL', async () => {
      uploadDatasetFileMock.mockReset();
      const operation = operationNamed('create_dataset');
      const { sdk, calls } = buildFakeSdk({
        'dataset.create': { ...DATASET, file: { upload_url: null } },
      });

      await expect(
        operation.run(
          sdk,
          z.object(operation.input).parse({ filePath: csvPath() }) as never,
        ),
      ).rejects.toThrowError('The API did not return an upload URL.');

      expect(uploadDatasetFileMock).not.toHaveBeenCalled();
      expect(calls.map(call => call.path)).toEqual([
        'dataset.create',
        'dataset.delete',
      ]);
    });

    it('should not register anything when the file cannot be read', async () => {
      const operation = operationNamed('create_dataset');
      const { sdk, calls } = buildFakeSdk();

      await expect(
        operation.run(
          sdk,
          z
            .object(operation.input)
            .parse({ filePath: join(directory, 'missing.csv') }) as never,
        ),
      ).rejects.toThrowError(/ENOENT/);

      expect(calls).toEqual([]);
    });
  });

  itSaysUpdateReplacesDescriptionAndTags(['update_dataset']);

  itTakesNullToClear([
    ['update_dataset', 'description'],
    ['update_dataset', 'tags'],
  ]);

  it('show_dataset should say it shows your dataset or any PUBLIC one, with its download link', () => {
    const { description } = operationNamed('show_dataset');

    expect(description).toMatch(/yours or any PUBLIC one/);
    expect(description).toMatch(/download link/);
  });

  it('list_datasets should say it lists your PRIVATE datasets and every PUBLIC one, not yours under review, and that user_id is the owner', () => {
    const { description } = operationNamed('list_datasets');

    expect(description).toMatch(/your PRIVATE datasets plus every PUBLIC one/);
    expect(description).toMatch(/your datasets under review are not listed/i);
    expect(description).toMatch(/user_id is each owner's id/);
  });
});
