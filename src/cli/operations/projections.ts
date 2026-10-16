// GraphQL import
import type {
  DatasetFragmentFragment,
  FileFragmentFragment,
  McpAuthorizationGrantFragmentFragment,
  ProcessingFinishTimeEstimation,
  ProcessingFragmentFragment,
  ProcessingTimeEstimation,
  ProcessorFragmentFragment,
  SessionFragmentFragment,
  UserFragmentFragment,
  WorkerFragmentFragment,
  WorkerRegistrationTokenFragmentFragment,
  WorkerRegistrationTokenWithValueFragmentFragment,
} from '@gql/graphql';

type IProcessorParameter =
  ProcessorFragmentFragment['configuration']['parameters'][number];

const projectUser = (
  user: Pick<
    UserFragmentFragment,
    'id' | 'name' | 'email' | 'is_admin' | 'language'
  >,
) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  is_admin: user.is_admin,
  language: user.language,
});

const projectSession = (
  session: Pick<
    SessionFragmentFragment,
    'user' | 'user_auth_provider_conn' | 'user_session'
  >,
) => ({
  user: projectUser(session.user),
  user_auth_provider_conn_id: session.user_auth_provider_conn?.id,
  access_token_expires_at: session.user_session?.access_token_expires_at,
  refresh_token_expires_at: session.user_session?.refresh_token_expires_at,
});

const projectDataset = (
  dataset: Pick<
    DatasetFragmentFragment,
    'id' | 'description' | 'tags' | 'visibility' | 'created_at' | 'user_id'
  >,
) => ({
  id: dataset.id,
  description: dataset.description,
  tags: dataset.tags,
  visibility: dataset.visibility,
  created_at: dataset.created_at,
  user_id: dataset.user_id,
});

const projectProcessorParameter = (parameter: IProcessorParameter) => ({
  sequence: parameter.sequence,
  name: parameter.name,
  description: parameter.description,
  type: parameter.type,
  is_required: parameter.is_required,
  default_value: parameter.default_value,
});

const projectProcessor = (
  processor: Pick<
    ProcessorFragmentFragment,
    'id' | 'name' | 'version' | 'visibility' | 'configuration'
  >,
) => ({
  id: processor.id,
  name: processor.name,
  version: processor.version,
  visibility: processor.visibility,
  configuration: {
    parameters: processor.configuration.parameters.map(
      projectProcessorParameter,
    ),
  },
});

const projectAdminProcessor = (processor: ProcessorFragmentFragment) => ({
  id: processor.id,
  name: processor.name,
  version: processor.version,
  image_tag: processor.image_tag,
  description: processor.description,
  tags: processor.tags,
  allowed_mime_types: processor.allowed_mime_types,
  visibility: processor.visibility,
  configuration: {
    command: processor.configuration.command,
    dataset_input_argument: processor.configuration.dataset_input_argument,
    dataset_input_value: processor.configuration.dataset_input_value,
    dataset_output_argument: processor.configuration.dataset_output_argument,
    dataset_output_value: processor.configuration.dataset_output_value,
    output_metrics_file_glob_patterns:
      processor.configuration.output_metrics_file_glob_patterns,
    output_result_file_glob_patterns:
      processor.configuration.output_result_file_glob_patterns,
    parameters: processor.configuration.parameters.map(
      projectProcessorParameter,
    ),
  },
});

const projectProcessing = (
  processing: Pick<
    ProcessingFragmentFragment,
    | 'id'
    | 'status'
    | 'visibility'
    | 'keep_until'
    | 'created_at'
    | 'started_at'
    | 'finished_at'
    | 'user_id'
  >,
) => ({
  id: processing.id,
  status: processing.status,
  visibility: processing.visibility,
  keep_until: processing.keep_until,
  created_at: processing.created_at,
  started_at: processing.started_at,
  finished_at: processing.finished_at,
  user_id: processing.user_id,
});

const projectFileDownload = (
  file: Pick<
    FileFragmentFragment,
    | 'id'
    | 'filename'
    | 'mime_type'
    | 'size'
    | 'public_url'
    | 'public_url_expires_at'
  >,
) => ({
  id: file.id,
  filename: file.filename,
  mime_type: file.mime_type,
  size: file.size,
  public_url: file.public_url,
  public_url_expires_at: file.public_url_expires_at,
});

const projectDatasetDetail = (
  dataset: Parameters<typeof projectDataset>[0] &
    Pick<DatasetFragmentFragment, 'file'>,
) => ({
  ...projectDataset(dataset),
  file: projectFileDownload(dataset.file),
});

const projectProcessingDetail = (
  processing: Parameters<typeof projectProcessing>[0] &
    Pick<
      ProcessingFragmentFragment,
      'dataset' | 'processor' | 'result_file' | 'metrics_file'
    >,
) => ({
  ...projectProcessing(processing),
  dataset: {
    id: processing.dataset.id,
    description: processing.dataset.description,
  },
  processor: { id: processing.processor.id, name: processing.processor.name },
  result_file: processing.result_file
    ? projectFileDownload(processing.result_file)
    : null,
  metrics_file: processing.metrics_file
    ? projectFileDownload(processing.metrics_file)
    : null,
});

const projectWorker = (
  worker: Pick<
    WorkerFragmentFragment,
    | 'id'
    | 'name'
    | 'version'
    | 'description'
    | 'tags'
    | 'last_seen_at'
    | 'archived_at'
    | 'created_at'
    | 'user_id'
  >,
) => ({
  id: worker.id,
  name: worker.name,
  version: worker.version,
  description: worker.description,
  tags: worker.tags,
  last_seen_at: worker.last_seen_at,
  archived_at: worker.archived_at,
  created_at: worker.created_at,
  user_id: worker.user_id,
});

const projectRegistrationTokenWithoutValue = (
  token: Pick<
    WorkerRegistrationTokenFragmentFragment,
    'id' | 'is_unlimited_usage' | 'expires_at' | 'created_at'
  >,
) => ({
  id: token.id,
  is_unlimited_usage: token.is_unlimited_usage,
  expires_at: token.expires_at,
  created_at: token.created_at,
});

const projectRegistrationToken = (
  token: Parameters<typeof projectRegistrationTokenWithoutValue>[0] &
    Pick<WorkerRegistrationTokenWithValueFragmentFragment, 'token'>,
) => ({
  ...projectRegistrationTokenWithoutValue(token),
  token: token.token,
});

const projectConnection = (
  grant: Pick<
    McpAuthorizationGrantFragmentFragment,
    | 'id'
    | 'client_id'
    | 'client_name'
    | 'client_verified_host'
    | 'scopes'
    | 'created_at'
    | 'last_used_at'
    | 'expires_at'
  >,
) => ({
  id: grant.id,
  client_id: grant.client_id,
  client_name: grant.client_name,
  client_verified_host: grant.client_verified_host,
  scopes: grant.scopes,
  created_at: grant.created_at,
  last_used_at: grant.last_used_at,
  expires_at: grant.expires_at,
});

const projectProcessingTimeEstimation = (
  estimation: ProcessingTimeEstimation,
) => ({
  dataset_id: estimation.dataset_id,
  processor_id: estimation.processor_id,
  estimated_waiting_time: estimation.estimated_waiting_time,
  estimated_execution_time: estimation.estimated_execution_time,
  estimated_total_time: estimation.estimated_total_time,
});

const projectProcessingFinishEstimation = (
  estimation: ProcessingFinishTimeEstimation,
) => ({
  processing_id: estimation.processing_id,
  dataset_id: estimation.dataset_id,
  processor_id: estimation.processor_id,
  estimated_start_time: estimation.estimated_start_time,
  estimated_finish_time: estimation.estimated_finish_time,
});

const USER_OUTPUT = ['id', 'name', 'email', 'is_admin', 'language'];
const SESSION_OUTPUT = [
  'user',
  'user_auth_provider_conn_id',
  'access_token_expires_at',
  'refresh_token_expires_at',
];
const DATASET_OUTPUT = [
  'id',
  'description',
  'tags',
  'visibility',
  'created_at',
  'user_id',
];
const DATASET_DETAIL_OUTPUT = [...DATASET_OUTPUT, 'file'];
const PROCESSOR_OUTPUT = [
  'id',
  'name',
  'version',
  'visibility',
  'configuration',
];
const ADMIN_PROCESSOR_OUTPUT = [
  'id',
  'name',
  'version',
  'image_tag',
  'description',
  'tags',
  'allowed_mime_types',
  'visibility',
  'configuration',
];
const PROCESSING_OUTPUT = [
  'id',
  'status',
  'visibility',
  'keep_until',
  'created_at',
  'started_at',
  'finished_at',
  'user_id',
];
const PROCESSING_DETAIL_OUTPUT = [
  ...PROCESSING_OUTPUT,
  'dataset',
  'processor',
  'result_file',
  'metrics_file',
];
const WORKER_OUTPUT = [
  'id',
  'name',
  'version',
  'description',
  'tags',
  'last_seen_at',
  'archived_at',
  'created_at',
  'user_id',
];
const REGISTRATION_TOKEN_WITHOUT_VALUE_OUTPUT = [
  'id',
  'is_unlimited_usage',
  'expires_at',
  'created_at',
];
const REGISTRATION_TOKEN_OUTPUT = [
  ...REGISTRATION_TOKEN_WITHOUT_VALUE_OUTPUT,
  'token',
];
const CONNECTION_OUTPUT = [
  'id',
  'client_id',
  'client_name',
  'client_verified_host',
  'scopes',
  'created_at',
  'last_used_at',
  'expires_at',
];
const PROCESSING_TIME_ESTIMATION_OUTPUT = [
  'dataset_id',
  'processor_id',
  'estimated_waiting_time',
  'estimated_execution_time',
  'estimated_total_time',
];
const PROCESSING_FINISH_ESTIMATION_OUTPUT = [
  'processing_id',
  'dataset_id',
  'processor_id',
  'estimated_start_time',
  'estimated_finish_time',
];

export {
  ADMIN_PROCESSOR_OUTPUT,
  CONNECTION_OUTPUT,
  DATASET_DETAIL_OUTPUT,
  DATASET_OUTPUT,
  PROCESSING_DETAIL_OUTPUT,
  PROCESSING_FINISH_ESTIMATION_OUTPUT,
  PROCESSING_OUTPUT,
  PROCESSING_TIME_ESTIMATION_OUTPUT,
  PROCESSOR_OUTPUT,
  REGISTRATION_TOKEN_OUTPUT,
  REGISTRATION_TOKEN_WITHOUT_VALUE_OUTPUT,
  SESSION_OUTPUT,
  USER_OUTPUT,
  WORKER_OUTPUT,
  projectAdminProcessor,
  projectConnection,
  projectDataset,
  projectDatasetDetail,
  projectProcessing,
  projectProcessingDetail,
  projectProcessingFinishEstimation,
  projectProcessingTimeEstimation,
  projectProcessor,
  projectRegistrationToken,
  projectRegistrationTokenWithoutValue,
  projectSession,
  projectUser,
  projectWorker,
};
