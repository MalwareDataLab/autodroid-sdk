export const DATASET = {
  id: 'dataset-1',
  description: 'Samples',
  tags: 'a,b',
  visibility: 'PRIVATE',
  created_at: '2026-01-01T00:00:00.000Z',
  user_id: 'owner',
  user: { id: 'owner', email: 'owner@example.test', phone_number: '+55 1' },
  file: {
    id: 'file-1',
    filename: 'samples.csv',
    mime_type: 'text/csv',
    size: 12,
    provider_path: 'datasets/samples.csv',
    upload_url: 'https://storage.example/upload',
    upload_url_expires_at: '2026-01-01T00:10:00.000Z',
    public_url: 'https://storage.example/download',
    public_url_expires_at: '2026-01-02T00:00:00.000Z',
  },
};

export const PROJECTED_DATASET = {
  id: 'dataset-1',
  description: 'Samples',
  tags: 'a,b',
  visibility: 'PRIVATE',
  created_at: '2026-01-01T00:00:00.000Z',
  user_id: 'owner',
};

export const PROJECTED_DATASET_DETAIL = {
  ...PROJECTED_DATASET,
  file: {
    id: 'file-1',
    filename: 'samples.csv',
    mime_type: 'text/csv',
    size: 12,
    public_url: 'https://storage.example/download',
    public_url_expires_at: '2026-01-02T00:00:00.000Z',
  },
};

const PARAMETER = {
  sequence: 1,
  name: 'threshold',
  description: 'Detection threshold',
  type: 'INTEGER',
  is_required: true,
  default_value: '5',
  extra: 'dropped',
};

export const PROCESSOR = {
  id: 'processor-1',
  name: 'Analyzer',
  version: '1.0.0',
  image_tag: 'analyzer:1',
  description: 'Analyzes',
  tags: 'x',
  allowed_mime_types: 'text/csv',
  visibility: 'PUBLIC',
  seq: 1,
  configuration: {
    command: 'run',
    dataset_input_argument: '-i',
    dataset_input_value: '/in',
    dataset_output_argument: '-o',
    dataset_output_value: '/out',
    output_metrics_file_glob_patterns: ['*.zip'],
    output_result_file_glob_patterns: ['*.csv'],
    parameters: [PARAMETER],
  },
};

export const PROJECTED_PARAMETER = {
  sequence: 1,
  name: 'threshold',
  description: 'Detection threshold',
  type: 'INTEGER',
  is_required: true,
  default_value: '5',
};

export const PROCESSING = {
  id: 'processing-1',
  status: 'SUCCEEDED',
  visibility: 'PRIVATE',
  keep_until: '2030-01-01T00:00:00.000Z',
  created_at: '2026-01-01T00:00:00.000Z',
  started_at: '2026-01-01T00:01:00.000Z',
  finished_at: '2026-01-01T00:02:00.000Z',
  user_id: 'owner',
  dataset: {
    id: 'dataset-1',
    description: 'Samples',
    user: { email: 'x@y.z' },
  },
  processor: { id: 'processor-1', name: 'Analyzer', configuration: {} },
  result_file: {
    id: 'file-2',
    filename: 'result.csv',
    mime_type: 'text/csv',
    size: 34,
    provider_path: 'processing/result.csv',
    upload_url: null,
    upload_url_expires_at: null,
    public_url: 'https://storage.example/result',
    public_url_expires_at: '2026-01-02T00:00:00.000Z',
  },
  metrics_file: null,
};

export const PROJECTED_PROCESSING = {
  id: 'processing-1',
  status: 'SUCCEEDED',
  visibility: 'PRIVATE',
  keep_until: '2030-01-01T00:00:00.000Z',
  created_at: '2026-01-01T00:00:00.000Z',
  started_at: '2026-01-01T00:01:00.000Z',
  finished_at: '2026-01-01T00:02:00.000Z',
  user_id: 'owner',
};

export const TIME_ESTIMATION = {
  dataset_id: 'dataset-1',
  processor_id: 'processor-1',
  estimated_waiting_time: 1,
  estimated_execution_time: 2,
  estimated_total_time: 3,
};
