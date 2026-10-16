import { describe, expect, it } from 'vitest';
import { z } from 'zod';

// Util import
import {
  connection,
  inputOf,
  IOperationCase,
  itBehavesAsItsCases,
  itTakesDateTimeInputsWithAnOffset,
  listPage,
  operationNamed,
  SORTING,
} from '../../../test/support/operationCases';
import {
  PROCESSING,
  PROJECTED_PROCESSING,
  TIME_ESTIMATION,
} from '../../../test/support/operationFixtures';

// Target import
import { adminProcessingOperations } from './adminProcessingOperations';

const cases: IOperationCase[] = [
  {
    name: 'admin_list_processing',
    input: {
      take: 4,
      userId: 'u',
      workerId: 'w',
      datasetId: 'd',
      processorId: 'p',
      status: 'FAILED',
      visibility: 'PUBLIC',
      started: true,
      finished: true,
      resultFileId: 'r',
      metricsFileId: 'm',
      createdAtStartDate: '2026-01-01T00:00:00Z',
      createdAtEndDate: '2026-02-01T00:00:00Z',
      keepUntilStartDate: '2026-03-01T00:00:00Z',
      keepUntilEndDate: '2026-04-01T00:00:00Z',
      includeArchived: true,
      sorting: SORTING,
    },
    call: 'admin.processing.getMany',
    args: [
      {
        skip: 0,
        take: 4,
        sorting: SORTING,
        userId: 'u',
        workerId: 'w',
        datasetId: 'd',
        processorId: 'p',
        status: 'FAILED',
        visibility: 'PUBLIC',
        started: true,
        finished: true,
        resultFileId: 'r',
        metricsFileId: 'm',
        createdAtStartDate: '2026-01-01T00:00:00Z',
        createdAtEndDate: '2026-02-01T00:00:00Z',
        keepUntilStartDate: '2026-03-01T00:00:00Z',
        keepUntilEndDate: '2026-04-01T00:00:00Z',
        includeArchived: true,
      },
    ],
    answer: connection(PROCESSING),
    result: listPage(PROJECTED_PROCESSING),
  },
  {
    name: 'admin_show_processing',
    input: { processingId: 'processing-1' },
    call: 'admin.processing.getOne',
    args: [{ processingId: 'processing-1' }],
    answer: {
      ...PROCESSING,
      result_file: null,
      metrics_file: PROCESSING.result_file,
    },
    result: {
      ...PROJECTED_PROCESSING,
      dataset: { id: 'dataset-1', description: 'Samples' },
      processor: { id: 'processor-1', name: 'Analyzer' },
      result_file: null,
      metrics_file: {
        id: 'file-2',
        filename: 'result.csv',
        mime_type: 'text/csv',
        size: 34,
        public_url: 'https://storage.example/result',
        public_url_expires_at: '2026-01-02T00:00:00.000Z',
      },
    },
  },
  {
    name: 'admin_update_processing',
    input: {
      processingId: 'processing-1',
      keepUntil: '2031-01-01T00:00:00Z',
      visibility: 'PUBLIC',
    },
    call: 'admin.processing.update',
    args: [
      {
        processingId: 'processing-1',
        data: { keep_until: '2031-01-01T00:00:00Z', visibility: 'PUBLIC' },
      },
    ],
    answer: PROCESSING,
    result: PROJECTED_PROCESSING,
  },
  {
    name: 'admin_delete_processing',
    input: { processingId: 'processing-1' },
    call: 'admin.processing.delete',
    args: [{ processingId: 'processing-1' }],
    answer: PROCESSING,
    result: PROJECTED_PROCESSING,
  },
  {
    name: 'admin_clean_expired_processing',
    input: {},
    call: 'admin.processing.cleanExpired',
    args: [{}],
    answer: 3,
    result: { removed: 3 },
  },
  {
    name: 'admin_estimate_processing_time',
    input: { datasetId: 'dataset-1', processorId: 'processor-1' },
    call: 'admin.processing.getTimeEstimation',
    args: [{ datasetId: 'dataset-1', processorId: 'processor-1' }],
    answer: [{ ...TIME_ESTIMATION, extra: 'dropped' }],
    result: { items: [TIME_ESTIMATION], total_count: 1, has_next_page: false },
  },
  {
    name: 'admin_fail_dangling_processing',
    input: { createdBefore: '2026-01-01T00:00:00Z', status: 'RUNNING' },
    call: 'admin.processing.failDangling',
    args: [{ createdAtEndDate: '2026-01-01T00:00:00Z', status: 'RUNNING' }],
    answer: 2,
    result: { failed: 2 },
  },
];

describe('Operations: admin processing', () => {
  itBehavesAsItsCases(adminProcessingOperations, cases);

  itTakesDateTimeInputsWithAnOffset(adminProcessingOperations);

  describe('admin_fail_dangling_processing', () => {
    const operation = operationNamed('admin_fail_dangling_processing');
    const schema = z.object(operation.input);

    it.each(['PENDING', 'RUNNING'])('should accept status %s', status => {
      expect(schema.safeParse({ status }).success).toBe(true);
    });

    it.each(['FAILED', 'SUCCEEDED', 'CANCELLED'])(
      'should reject status %s, which the API refuses',
      status => {
        expect(schema.safeParse({ status }).success).toBe(false);
      },
    );

    it('should state both defaults the API applies', () => {
      const { properties } = inputOf('admin_fail_dangling_processing');

      expect(properties.status.enum).toEqual(['PENDING', 'RUNNING']);
      expect(properties.status.description).toMatch(/defaults to PENDING/i);
      expect(properties.createdBefore.description).toMatch(
        /defaults to one day ago/i,
      );
    });
  });
});
