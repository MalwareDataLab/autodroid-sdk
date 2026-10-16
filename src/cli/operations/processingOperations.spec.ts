import { describe, expect, it } from 'vitest';

// Util import
import {
  connection,
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
import { processingOperations } from './processingOperations';

const FINISH_ESTIMATION = {
  processing_id: 'processing-1',
  dataset_id: 'dataset-1',
  processor_id: 'processor-1',
  estimated_start_time: '2099-01-01T00:00:00.000Z',
  estimated_finish_time: '2099-01-01T02:00:00.000Z',
};

const cases: IOperationCase[] = [
  {
    name: 'list_processing',
    input: {
      take: 5,
      datasetId: 'dataset-1',
      processorId: 'processor-1',
      status: 'SUCCEEDED',
      visibility: 'PRIVATE',
      started: true,
      finished: false,
      sorting: SORTING,
    },
    call: 'processing.getMany',
    args: [
      {
        skip: 0,
        take: 5,
        sorting: SORTING,
        datasetId: 'dataset-1',
        processorId: 'processor-1',
        status: 'SUCCEEDED',
        visibility: 'PRIVATE',
        started: true,
        finished: false,
      },
    ],
    answer: connection(PROCESSING),
    result: listPage(PROJECTED_PROCESSING),
  },
  {
    name: 'show_processing',
    input: { processingId: 'processing-1' },
    call: 'processing.getOne',
    args: [{ processingId: 'processing-1' }],
    answer: PROCESSING,
    result: {
      ...PROJECTED_PROCESSING,
      dataset: { id: 'dataset-1', description: 'Samples' },
      processor: { id: 'processor-1', name: 'Analyzer' },
      result_file: {
        id: 'file-2',
        filename: 'result.csv',
        mime_type: 'text/csv',
        size: 34,
        public_url: 'https://storage.example/result',
        public_url_expires_at: '2026-01-02T00:00:00.000Z',
      },
      metrics_file: null,
    },
  },
  {
    name: 'run_processing',
    input: {
      datasetId: 'dataset-1',
      processorId: 'processor-1',
      parameters: [{ name: 'threshold', value: '7' }],
    },
    call: 'processing.requestDatasetProcessing',
    args: [
      {
        data: {
          dataset_id: 'dataset-1',
          processor_id: 'processor-1',
          parameters: [{ name: 'threshold', value: '7' }],
        },
      },
    ],
    answer: PROCESSING,
    result: PROJECTED_PROCESSING,
  },
  {
    name: 'run_processing',
    input: { datasetId: 'dataset-1', processorId: 'processor-1' },
    call: 'processing.requestDatasetProcessing',
    args: [
      {
        data: {
          dataset_id: 'dataset-1',
          processor_id: 'processor-1',
          parameters: [],
        },
      },
    ],
    answer: PROCESSING,
    result: PROJECTED_PROCESSING,
  },
  {
    name: 'delete_processing',
    input: { processingId: 'processing-1' },
    call: 'processing.delete',
    args: [{ processingId: 'processing-1' }],
    answer: PROCESSING,
    result: PROJECTED_PROCESSING,
  },
  {
    name: 'extend_processing',
    input: { processingId: 'processing-1', keepUntil: '2031-01-01T00:00:00Z' },
    call: 'processing.extendKeepUntil',
    args: [{ processingId: 'processing-1', keepUntil: '2031-01-01T00:00:00Z' }],
    answer: PROCESSING,
    result: PROJECTED_PROCESSING,
  },
  {
    name: 'set_processing_visibility',
    input: { processingId: 'processing-1', visibility: 'PUBLIC' },
    call: 'processing.updateVisibility',
    args: [{ processingId: 'processing-1', visibility: 'PUBLIC' }],
    answer: PROCESSING,
    result: PROJECTED_PROCESSING,
  },
  {
    name: 'estimate_processing_time',
    input: { datasetId: 'dataset-1', processorId: 'processor-1' },
    call: 'processing.getExecutionTimeEstimation',
    args: [{ datasetId: 'dataset-1', processorId: 'processor-1' }],
    answer: { ...TIME_ESTIMATION, extra: 'dropped' },
    result: TIME_ESTIMATION,
  },
  {
    name: 'estimate_processing_finish',
    input: { processingId: 'processing-1' },
    call: 'processing.getFinishTimeEstimation',
    args: [{ processingId: 'processing-1' }],
    answer: { ...FINISH_ESTIMATION, extra: 'dropped' },
    result: FINISH_ESTIMATION,
  },
];

describe('Operations: processing', () => {
  itBehavesAsItsCases(processingOperations, cases);

  itTakesDateTimeInputsWithAnOffset(processingOperations);

  it('show_processing should say it shows your run or any PUBLIC one, with the download links of its files', () => {
    const { description } = operationNamed('show_processing');

    expect(description).toMatch(/yours or any PUBLIC one/);
    expect(description).toMatch(/download links/);
  });

  it('list_processing should say it lists your own runs and every PUBLIC one, and that user_id is the owner', () => {
    const { description } = operationNamed('list_processing');

    expect(description).toMatch(/your own and every PUBLIC one/);
    expect(description).toMatch(/user_id is each owner's id/);
  });
});
