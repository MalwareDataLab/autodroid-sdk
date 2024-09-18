/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Cursor for pagination */
  ConnectionCursor: { input: any; output: any; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  DateTimeISO: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export enum AUTH_PROVIDER {
  FIREBASE = 'FIREBASE'
}

export type AdminDatasetUpdateSchema = {
  description?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Scalars['String']['input']>;
};

export type AdminDatasetUpdateVisibilitySchema = {
  visibility: DATASET_VISIBILITY;
};

export enum DATASET_VISIBILITY {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  UNDER_REVIEW = 'UNDER_REVIEW'
}

export type Dataset = {
  __typename?: 'Dataset';
  created_at: Scalars['DateTimeISO']['output'];
  description?: Maybe<Scalars['String']['output']>;
  file: File;
  file_id: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  processes: ProcessingPaginationConnection;
  tags?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['DateTimeISO']['output'];
  user: User;
  user_id: Scalars['String']['output'];
  visibility: DATASET_VISIBILITY;
};


export type DatasetprocessesArgs = {
  after?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  before?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  dataset_id?: InputMaybe<Scalars['String']['input']>;
  finished?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  processor_id?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sorting?: InputMaybe<Array<SortingFieldSchema>>;
  started?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<PROCESSING_STATUS>;
  take?: InputMaybe<Scalars['Int']['input']>;
  visibility?: InputMaybe<PROCESSING_VISIBILITY>;
};

export type DatasetPaginationConnection = {
  __typename?: 'DatasetPaginationConnection';
  edges: Array<DatasetPaginationEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DatasetPaginationEdge = {
  __typename?: 'DatasetPaginationEdge';
  cursor: Scalars['ConnectionCursor']['output'];
  node: Dataset;
};

export enum FILE_PROVIDER_STATUS {
  NOT_FOUND = 'NOT_FOUND',
  PENDING = 'PENDING',
  READY = 'READY'
}

export enum FILE_TYPE {
  DATASET = 'DATASET'
}

export type File = {
  __typename?: 'File';
  allow_public_access: Scalars['Boolean']['output'];
  created_at: Scalars['DateTimeISO']['output'];
  filename: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  md5_hash: Scalars['String']['output'];
  mime_type: MIME_TYPE;
  payload: Scalars['JSON']['output'];
  provider_path: Scalars['String']['output'];
  provider_status: FILE_PROVIDER_STATUS;
  provider_verified_at?: Maybe<Scalars['DateTimeISO']['output']>;
  public_url?: Maybe<Scalars['String']['output']>;
  public_url_expires_at?: Maybe<Scalars['DateTimeISO']['output']>;
  size: Scalars['Int']['output'];
  storage_provider: STORAGE_PROVIDER;
  type: FILE_TYPE;
  updated_at: Scalars['DateTimeISO']['output'];
};

export enum MIME_TYPE {
  CSV = 'CSV',
  JPEG = 'JPEG',
  OTHER = 'OTHER',
  PDF = 'PDF',
  PNG = 'PNG'
}

export type Mutation = {
  __typename?: 'Mutation';
  adminDatasetDelete: Dataset;
  adminDatasetUpdate: Dataset;
  adminDatasetUpdateVisibility: Dataset;
  adminProcessorCreate: Processor;
  adminProcessorDelete: Processor;
  adminProcessorUpdate: Processor;
  adminWorkerDelete: Worker;
  adminWorkerRegistrationTokenCreate: WorkerRegistrationToken;
  adminWorkerRegistrationTokenDelete: WorkerRegistrationToken;
  userDatasetCreate: Dataset;
  userDatasetDelete: Dataset;
  userDatasetRequestPublication: Dataset;
  userDatasetUpdate: Dataset;
  userProcessingDelete: Processing;
  userProcessingExtendKeepUntil: Processing;
  userProcessingUpdateVisibility: Processing;
  userRequestDatasetProcessing: Processing;
  userSessionsClose: UserAuthProviderConn;
  userUpdateData: User;
};


export type MutationadminDatasetDeleteArgs = {
  dataset_id: Scalars['String']['input'];
};


export type MutationadminDatasetUpdateArgs = {
  data: AdminDatasetUpdateSchema;
  dataset_id: Scalars['String']['input'];
};


export type MutationadminDatasetUpdateVisibilityArgs = {
  data: AdminDatasetUpdateVisibilitySchema;
  dataset_id: Scalars['String']['input'];
};


export type MutationadminProcessorCreateArgs = {
  data: ProcessorSchema;
};


export type MutationadminProcessorDeleteArgs = {
  processor_id: Scalars['String']['input'];
};


export type MutationadminProcessorUpdateArgs = {
  data: ProcessorSchema;
  processor_id: Scalars['String']['input'];
};


export type MutationadminWorkerDeleteArgs = {
  worker_id: Scalars['String']['input'];
};


export type MutationadminWorkerRegistrationTokenCreateArgs = {
  data: WorkerRegistrationTokenCreateSchema;
};


export type MutationadminWorkerRegistrationTokenDeleteArgs = {
  worker_registration_token_id: Scalars['String']['input'];
};


export type MutationuserDatasetCreateArgs = {
  data: UserDatasetCreateSchema;
};


export type MutationuserDatasetDeleteArgs = {
  dataset_id: Scalars['String']['input'];
};


export type MutationuserDatasetRequestPublicationArgs = {
  dataset_id: Scalars['String']['input'];
};


export type MutationuserDatasetUpdateArgs = {
  data: UserDatasetUpdateSchema;
  dataset_id: Scalars['String']['input'];
};


export type MutationuserProcessingDeleteArgs = {
  processing_id: Scalars['String']['input'];
};


export type MutationuserProcessingExtendKeepUntilArgs = {
  keep_until: Scalars['DateTimeISO']['input'];
  processing_id: Scalars['String']['input'];
};


export type MutationuserProcessingUpdateVisibilityArgs = {
  processing_id: Scalars['String']['input'];
  visibility: PROCESSING_VISIBILITY;
};


export type MutationuserRequestDatasetProcessingArgs = {
  data: RequestDatasetProcessingSchema;
};


export type MutationuserUpdateDataArgs = {
  data: UserUpdateDataSchema;
};

export enum PROCESSING_STATUS {
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCEEDED = 'SUCCEEDED'
}

export enum PROCESSING_VISIBILITY {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC'
}

export enum PROCESSOR_PARAMETER_TYPE {
  BOOLEAN = 'BOOLEAN',
  INTEGER = 'INTEGER',
  STRING = 'STRING'
}

export enum PROCESSOR_VISIBILITY {
  HIDDEN = 'HIDDEN',
  PUBLIC = 'PUBLIC'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Processing = {
  __typename?: 'Processing';
  configuration: Scalars['JSON']['output'];
  created_at: Scalars['DateTimeISO']['output'];
  dataset: Dataset;
  dataset_id: Scalars['String']['output'];
  finished_at?: Maybe<Scalars['DateTimeISO']['output']>;
  id: Scalars['ID']['output'];
  keep_until?: Maybe<Scalars['DateTimeISO']['output']>;
  payload: Scalars['JSON']['output'];
  processor: Processor;
  processor_id: Scalars['String']['output'];
  result_file?: Maybe<File>;
  result_file_id?: Maybe<Scalars['String']['output']>;
  started_at?: Maybe<Scalars['DateTimeISO']['output']>;
  status: PROCESSING_STATUS;
  updated_at: Scalars['DateTimeISO']['output'];
  user: User;
  user_id: Scalars['String']['output'];
  visibility: PROCESSING_VISIBILITY;
  worker_id?: Maybe<Scalars['String']['output']>;
};

export type ProcessingPaginationConnection = {
  __typename?: 'ProcessingPaginationConnection';
  edges: Array<ProcessingPaginationEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ProcessingPaginationEdge = {
  __typename?: 'ProcessingPaginationEdge';
  cursor: Scalars['ConnectionCursor']['output'];
  node: Processing;
};

export type Processor = {
  __typename?: 'Processor';
  allowed_mime_types: Scalars['String']['output'];
  configuration: ProcessorConfiguration;
  created_at: Scalars['DateTimeISO']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image_tag: Scalars['String']['output'];
  name: Scalars['String']['output'];
  payload: Scalars['JSON']['output'];
  processes: ProcessingPaginationConnection;
  tags?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['DateTimeISO']['output'];
  version: Scalars['String']['output'];
  visibility: PROCESSOR_VISIBILITY;
};


export type ProcessorprocessesArgs = {
  after?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  before?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  dataset_id?: InputMaybe<Scalars['String']['input']>;
  finished?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  processor_id?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sorting?: InputMaybe<Array<SortingFieldSchema>>;
  started?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<PROCESSING_STATUS>;
  take?: InputMaybe<Scalars['Int']['input']>;
  visibility?: InputMaybe<PROCESSING_VISIBILITY>;
};

export type ProcessorConfiguration = {
  __typename?: 'ProcessorConfiguration';
  command: Scalars['String']['output'];
  dataset_input_argument: Scalars['String']['output'];
  dataset_input_value: Scalars['String']['output'];
  dataset_output_argument: Scalars['String']['output'];
  dataset_output_value: Scalars['String']['output'];
  parameters: Array<ProcessorParameter>;
};

export type ProcessorConfigurationParameterSchema = {
  default_value?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  is_required: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  sequence: Scalars['Int']['input'];
  type: PROCESSOR_PARAMETER_TYPE;
};

export type ProcessorConfigurationSchema = {
  command: Scalars['String']['input'];
  dataset_input_argument: Scalars['String']['input'];
  dataset_input_value: Scalars['String']['input'];
  dataset_output_argument: Scalars['String']['input'];
  dataset_output_value: Scalars['String']['input'];
  parameters: Array<ProcessorConfigurationParameterSchema>;
};

export type ProcessorPaginationConnection = {
  __typename?: 'ProcessorPaginationConnection';
  edges: Array<ProcessorPaginationEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ProcessorPaginationEdge = {
  __typename?: 'ProcessorPaginationEdge';
  cursor: Scalars['ConnectionCursor']['output'];
  node: Processor;
};

export type ProcessorParameter = {
  __typename?: 'ProcessorParameter';
  default_value?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  is_required: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  sequence: Scalars['Int']['output'];
  type: PROCESSOR_PARAMETER_TYPE;
};

export type ProcessorSchema = {
  allowed_mime_types: Scalars['String']['input'];
  configuration: ProcessorConfigurationSchema;
  description?: InputMaybe<Scalars['String']['input']>;
  image_tag: Scalars['String']['input'];
  name: Scalars['String']['input'];
  tags?: InputMaybe<Scalars['String']['input']>;
  version: Scalars['String']['input'];
  visibility: PROCESSOR_VISIBILITY;
};

export type Query = {
  __typename?: 'Query';
  adminDataset: Dataset;
  adminDatasets: DatasetPaginationConnection;
  adminProcessor: Processor;
  adminProcessors: ProcessorPaginationConnection;
  adminWorker: Worker;
  adminWorkerRegistrationToken: WorkerRegistrationToken;
  adminWorkerRegistrationTokens: WorkerRegistrationTokenPaginationConnection;
  adminWorkers: WorkerPaginationConnection;
  session: Session;
  user: User;
  userDataset: Dataset;
  userDatasets: DatasetPaginationConnection;
  userProcesses: ProcessingPaginationConnection;
  userProcessing: Processing;
  userProcessor: Processor;
  userProcessors: ProcessorPaginationConnection;
};


export type QueryadminDatasetArgs = {
  dataset_id: Scalars['String']['input'];
};


export type QueryadminDatasetsArgs = {
  after?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  before?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  file_id?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sorting?: InputMaybe<Array<SortingFieldSchema>>;
  take?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<DATASET_VISIBILITY>;
};


export type QueryadminProcessorArgs = {
  processor_id: Scalars['String']['input'];
};


export type QueryadminProcessorsArgs = {
  after?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  before?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sorting?: InputMaybe<Array<SortingFieldSchema>>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryadminWorkerArgs = {
  worker_id: Scalars['String']['input'];
};


export type QueryadminWorkerRegistrationTokenArgs = {
  worker_registration_token_id: Scalars['String']['input'];
};


export type QueryadminWorkerRegistrationTokensArgs = {
  activatable?: InputMaybe<Scalars['Boolean']['input']>;
  activated?: InputMaybe<Scalars['Boolean']['input']>;
  after?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  archived?: InputMaybe<Scalars['Boolean']['input']>;
  before?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  expired?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  is_unlimited_usage?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sorting?: InputMaybe<Array<SortingFieldSchema>>;
  take?: InputMaybe<Scalars['Int']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryadminWorkersArgs = {
  after?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  archived?: InputMaybe<Scalars['Boolean']['input']>;
  before?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  registration_token_id?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sorting?: InputMaybe<Array<SortingFieldSchema>>;
  take?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryuserDatasetArgs = {
  dataset_id: Scalars['String']['input'];
};


export type QueryuserDatasetsArgs = {
  after?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  before?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sorting?: InputMaybe<Array<SortingFieldSchema>>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryuserProcessesArgs = {
  after?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  before?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  dataset_id?: InputMaybe<Scalars['String']['input']>;
  finished?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  processor_id?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sorting?: InputMaybe<Array<SortingFieldSchema>>;
  started?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<PROCESSING_STATUS>;
  take?: InputMaybe<Scalars['Int']['input']>;
  visibility?: InputMaybe<PROCESSING_VISIBILITY>;
};


export type QueryuserProcessingArgs = {
  processing_id: Scalars['String']['input'];
};


export type QueryuserProcessorArgs = {
  processor_id: Scalars['String']['input'];
};


export type QueryuserProcessorsArgs = {
  after?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  before?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sorting?: InputMaybe<Array<SortingFieldSchema>>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type RequestDatasetProcessingParameterSchema = {
  name: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type RequestDatasetProcessingSchema = {
  dataset_id: Scalars['String']['input'];
  parameters: Array<RequestDatasetProcessingParameterSchema>;
  processor_id: Scalars['String']['input'];
};

export enum SORT_ORDER {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum STORAGE_PROVIDER {
  GOOGLE_CLOUD_STORAGE = 'GOOGLE_CLOUD_STORAGE'
}

export type Session = {
  __typename?: 'Session';
  user: User;
  user_auth_provider_conn: UserAuthProviderConn;
  user_session: UserSession;
};

export type SortingFieldSchema = {
  field: Scalars['String']['input'];
  order: SORT_ORDER;
};

export type User = {
  __typename?: 'User';
  created_at: Scalars['DateTimeISO']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  is_admin: Scalars['Boolean']['output'];
  language?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone_number?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['DateTimeISO']['output'];
};

export type UserAuthProviderConn = {
  __typename?: 'UserAuthProviderConn';
  auth_provider: AUTH_PROVIDER;
  code: Scalars['String']['output'];
  created_at: Scalars['DateTimeISO']['output'];
  disconnected_at?: Maybe<Scalars['DateTimeISO']['output']>;
  id: Scalars['ID']['output'];
  payload: Scalars['JSON']['output'];
  updated_at: Scalars['DateTimeISO']['output'];
  user_id: Scalars['String']['output'];
};

export type UserDatasetCreateSchema = {
  description?: InputMaybe<Scalars['String']['input']>;
  filename: Scalars['String']['input'];
  md5_hash: Scalars['String']['input'];
  mime_type: MIME_TYPE;
  size: Scalars['Int']['input'];
  tags?: InputMaybe<Scalars['String']['input']>;
};

export type UserDatasetUpdateSchema = {
  description?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Scalars['String']['input']>;
};

export type UserSession = {
  __typename?: 'UserSession';
  access_token: Scalars['String']['output'];
  access_token_expires_at: Scalars['DateTimeISO']['output'];
  payload: Scalars['JSON']['output'];
  refresh_token?: Maybe<Scalars['String']['output']>;
  refresh_token_expires_at?: Maybe<Scalars['DateTimeISO']['output']>;
  user_auth_provider_conn: UserAuthProviderConn;
  user_auth_provider_conn_id: Scalars['String']['output'];
};

export type UserUpdateDataSchema = {
  language?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone_number?: InputMaybe<Scalars['String']['input']>;
};

export type Worker = {
  __typename?: 'Worker';
  agent_info: Scalars['JSON']['output'];
  archived_at?: Maybe<Scalars['DateTimeISO']['output']>;
  created_at: Scalars['DateTimeISO']['output'];
  id: Scalars['ID']['output'];
  internal_id: Scalars['String']['output'];
  payload: Scalars['JSON']['output'];
  refresh_token: Scalars['String']['output'];
  refresh_token_expires_at: Scalars['DateTimeISO']['output'];
  registration_token: WorkerRegistrationToken;
  registration_token_id: Scalars['String']['output'];
  signature: Scalars['String']['output'];
  system_info: Scalars['JSON']['output'];
  updated_at: Scalars['DateTimeISO']['output'];
  user_id: Scalars['String']['output'];
};

export type WorkerPaginationConnection = {
  __typename?: 'WorkerPaginationConnection';
  edges: Array<WorkerPaginationEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type WorkerPaginationEdge = {
  __typename?: 'WorkerPaginationEdge';
  cursor: Scalars['ConnectionCursor']['output'];
  node: Worker;
};

export type WorkerRegistrationToken = {
  __typename?: 'WorkerRegistrationToken';
  activated_at?: Maybe<Scalars['DateTimeISO']['output']>;
  archived_at?: Maybe<Scalars['DateTimeISO']['output']>;
  created_at: Scalars['DateTimeISO']['output'];
  expires_at?: Maybe<Scalars['DateTimeISO']['output']>;
  id: Scalars['ID']['output'];
  is_unlimited_usage: Scalars['Boolean']['output'];
  token: Scalars['String']['output'];
  updated_at: Scalars['DateTimeISO']['output'];
  user_id: Scalars['String']['output'];
};

export type WorkerRegistrationTokenCreateSchema = {
  expires_at?: InputMaybe<Scalars['DateTimeISO']['input']>;
  is_unlimited_usage: Scalars['Boolean']['input'];
};

export type WorkerRegistrationTokenPaginationConnection = {
  __typename?: 'WorkerRegistrationTokenPaginationConnection';
  edges: Array<WorkerRegistrationTokenPaginationEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type WorkerRegistrationTokenPaginationEdge = {
  __typename?: 'WorkerRegistrationTokenPaginationEdge';
  cursor: Scalars['ConnectionCursor']['output'];
  node: WorkerRegistrationToken;
};

export type DatasetFragmentFragment = { __typename?: 'Dataset', id: string, description?: string | null, tags?: string | null, visibility: DATASET_VISIBILITY, created_at: any, updated_at: any, user_id: string, file_id: string, user: { __typename?: 'User', id: string, email: string, name?: string | null, phone_number?: string | null, language?: string | null, is_admin: boolean, created_at: any, updated_at: any }, file: { __typename?: 'File', id: string, storage_provider: STORAGE_PROVIDER, provider_path: string, provider_status: FILE_PROVIDER_STATUS, provider_verified_at?: any | null, type: FILE_TYPE, allow_public_access: boolean, public_url_expires_at?: any | null, filename: string, mime_type: MIME_TYPE, size: number, md5_hash: string, payload: any, created_at: any, updated_at: any, public_url?: string | null } };

export type UserDatasetQueryVariables = Exact<{
  datasetId: Scalars['String']['input'];
}>;


export type UserDatasetQuery = { __typename?: 'Query', userDataset: { __typename?: 'Dataset', id: string, description?: string | null, tags?: string | null, visibility: DATASET_VISIBILITY, created_at: any, updated_at: any, user_id: string, file_id: string, user: { __typename?: 'User', id: string, email: string, name?: string | null, phone_number?: string | null, language?: string | null, is_admin: boolean, created_at: any, updated_at: any }, file: { __typename?: 'File', id: string, storage_provider: STORAGE_PROVIDER, provider_path: string, provider_status: FILE_PROVIDER_STATUS, provider_verified_at?: any | null, type: FILE_TYPE, allow_public_access: boolean, public_url_expires_at?: any | null, filename: string, mime_type: MIME_TYPE, size: number, md5_hash: string, payload: any, created_at: any, updated_at: any, public_url?: string | null } } };

export type UserDatasetsQueryVariables = Exact<{
  sorting?: InputMaybe<Array<SortingFieldSchema> | SortingFieldSchema>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UserDatasetsQuery = { __typename?: 'Query', userDatasets: { __typename?: 'DatasetPaginationConnection', totalCount: number, edges: Array<{ __typename?: 'DatasetPaginationEdge', cursor: any, node: { __typename?: 'Dataset', id: string, description?: string | null, tags?: string | null, visibility: DATASET_VISIBILITY, created_at: any, updated_at: any, user_id: string, file_id: string, user: { __typename?: 'User', id: string, email: string, name?: string | null, phone_number?: string | null, language?: string | null, is_admin: boolean, created_at: any, updated_at: any }, file: { __typename?: 'File', id: string, storage_provider: STORAGE_PROVIDER, provider_path: string, provider_status: FILE_PROVIDER_STATUS, provider_verified_at?: any | null, type: FILE_TYPE, allow_public_access: boolean, public_url_expires_at?: any | null, filename: string, mime_type: MIME_TYPE, size: number, md5_hash: string, payload: any, created_at: any, updated_at: any, public_url?: string | null } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type FileFragmentFragment = { __typename?: 'File', id: string, storage_provider: STORAGE_PROVIDER, provider_path: string, provider_status: FILE_PROVIDER_STATUS, provider_verified_at?: any | null, type: FILE_TYPE, allow_public_access: boolean, public_url_expires_at?: any | null, filename: string, mime_type: MIME_TYPE, size: number, md5_hash: string, payload: any, created_at: any, updated_at: any, public_url?: string | null };

export type ProcessingFragmentFragment = { __typename?: 'Processing', id: string, status: PROCESSING_STATUS, visibility: PROCESSING_VISIBILITY, started_at?: any | null, finished_at?: any | null, keep_until?: any | null, configuration: any, payload: any, created_at: any, updated_at: any, processor_id: string, dataset_id: string, result_file_id?: string | null, worker_id?: string | null, user_id: string, processor: { __typename?: 'Processor', id: string, name: string, version: string, image_tag: string, description?: string | null, tags?: string | null, allowed_mime_types: string, visibility: PROCESSOR_VISIBILITY, payload: any, created_at: any, updated_at: any, configuration: { __typename?: 'ProcessorConfiguration', dataset_input_argument: string, dataset_input_value: string, dataset_output_argument: string, dataset_output_value: string, command: string, parameters: Array<{ __typename?: 'ProcessorParameter', sequence: number, name: string, description: string, type: PROCESSOR_PARAMETER_TYPE, is_required: boolean, default_value?: string | null }> } }, dataset: { __typename?: 'Dataset', id: string, description?: string | null, tags?: string | null, visibility: DATASET_VISIBILITY, created_at: any, updated_at: any, user_id: string, file_id: string, user: { __typename?: 'User', id: string, email: string, name?: string | null, phone_number?: string | null, language?: string | null, is_admin: boolean, created_at: any, updated_at: any }, file: { __typename?: 'File', id: string, storage_provider: STORAGE_PROVIDER, provider_path: string, provider_status: FILE_PROVIDER_STATUS, provider_verified_at?: any | null, type: FILE_TYPE, allow_public_access: boolean, public_url_expires_at?: any | null, filename: string, mime_type: MIME_TYPE, size: number, md5_hash: string, payload: any, created_at: any, updated_at: any, public_url?: string | null } }, result_file?: { __typename?: 'File', id: string, storage_provider: STORAGE_PROVIDER, provider_path: string, provider_status: FILE_PROVIDER_STATUS, provider_verified_at?: any | null, type: FILE_TYPE, allow_public_access: boolean, public_url_expires_at?: any | null, filename: string, mime_type: MIME_TYPE, size: number, md5_hash: string, payload: any, created_at: any, updated_at: any, public_url?: string | null } | null };

export type UserProcessingQueryVariables = Exact<{
  processingId: Scalars['String']['input'];
}>;


export type UserProcessingQuery = { __typename?: 'Query', userProcessing: { __typename?: 'Processing', id: string, status: PROCESSING_STATUS, visibility: PROCESSING_VISIBILITY, started_at?: any | null, finished_at?: any | null, keep_until?: any | null, configuration: any, payload: any, created_at: any, updated_at: any, processor_id: string, dataset_id: string, result_file_id?: string | null, worker_id?: string | null, user_id: string, processor: { __typename?: 'Processor', id: string, name: string, version: string, image_tag: string, description?: string | null, tags?: string | null, allowed_mime_types: string, visibility: PROCESSOR_VISIBILITY, payload: any, created_at: any, updated_at: any, configuration: { __typename?: 'ProcessorConfiguration', dataset_input_argument: string, dataset_input_value: string, dataset_output_argument: string, dataset_output_value: string, command: string, parameters: Array<{ __typename?: 'ProcessorParameter', sequence: number, name: string, description: string, type: PROCESSOR_PARAMETER_TYPE, is_required: boolean, default_value?: string | null }> } }, dataset: { __typename?: 'Dataset', id: string, description?: string | null, tags?: string | null, visibility: DATASET_VISIBILITY, created_at: any, updated_at: any, user_id: string, file_id: string, user: { __typename?: 'User', id: string, email: string, name?: string | null, phone_number?: string | null, language?: string | null, is_admin: boolean, created_at: any, updated_at: any }, file: { __typename?: 'File', id: string, storage_provider: STORAGE_PROVIDER, provider_path: string, provider_status: FILE_PROVIDER_STATUS, provider_verified_at?: any | null, type: FILE_TYPE, allow_public_access: boolean, public_url_expires_at?: any | null, filename: string, mime_type: MIME_TYPE, size: number, md5_hash: string, payload: any, created_at: any, updated_at: any, public_url?: string | null } }, result_file?: { __typename?: 'File', id: string, storage_provider: STORAGE_PROVIDER, provider_path: string, provider_status: FILE_PROVIDER_STATUS, provider_verified_at?: any | null, type: FILE_TYPE, allow_public_access: boolean, public_url_expires_at?: any | null, filename: string, mime_type: MIME_TYPE, size: number, md5_hash: string, payload: any, created_at: any, updated_at: any, public_url?: string | null } | null } };

export type UserProcessesQueryVariables = Exact<{
  datasetId?: InputMaybe<Scalars['String']['input']>;
  processorId?: InputMaybe<Scalars['String']['input']>;
  started?: InputMaybe<Scalars['Boolean']['input']>;
  finished?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<PROCESSING_STATUS>;
  visibility?: InputMaybe<PROCESSING_VISIBILITY>;
  sorting?: InputMaybe<Array<SortingFieldSchema> | SortingFieldSchema>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UserProcessesQuery = { __typename?: 'Query', userProcesses: { __typename?: 'ProcessingPaginationConnection', totalCount: number, edges: Array<{ __typename?: 'ProcessingPaginationEdge', cursor: any, node: { __typename?: 'Processing', id: string, status: PROCESSING_STATUS, visibility: PROCESSING_VISIBILITY, started_at?: any | null, finished_at?: any | null, keep_until?: any | null, configuration: any, payload: any, created_at: any, updated_at: any, processor_id: string, dataset_id: string, result_file_id?: string | null, worker_id?: string | null, user_id: string, processor: { __typename?: 'Processor', id: string, name: string, version: string, image_tag: string, description?: string | null, tags?: string | null, allowed_mime_types: string, visibility: PROCESSOR_VISIBILITY, payload: any, created_at: any, updated_at: any, configuration: { __typename?: 'ProcessorConfiguration', dataset_input_argument: string, dataset_input_value: string, dataset_output_argument: string, dataset_output_value: string, command: string, parameters: Array<{ __typename?: 'ProcessorParameter', sequence: number, name: string, description: string, type: PROCESSOR_PARAMETER_TYPE, is_required: boolean, default_value?: string | null }> } }, dataset: { __typename?: 'Dataset', id: string, description?: string | null, tags?: string | null, visibility: DATASET_VISIBILITY, created_at: any, updated_at: any, user_id: string, file_id: string, user: { __typename?: 'User', id: string, email: string, name?: string | null, phone_number?: string | null, language?: string | null, is_admin: boolean, created_at: any, updated_at: any }, file: { __typename?: 'File', id: string, storage_provider: STORAGE_PROVIDER, provider_path: string, provider_status: FILE_PROVIDER_STATUS, provider_verified_at?: any | null, type: FILE_TYPE, allow_public_access: boolean, public_url_expires_at?: any | null, filename: string, mime_type: MIME_TYPE, size: number, md5_hash: string, payload: any, created_at: any, updated_at: any, public_url?: string | null } }, result_file?: { __typename?: 'File', id: string, storage_provider: STORAGE_PROVIDER, provider_path: string, provider_status: FILE_PROVIDER_STATUS, provider_verified_at?: any | null, type: FILE_TYPE, allow_public_access: boolean, public_url_expires_at?: any | null, filename: string, mime_type: MIME_TYPE, size: number, md5_hash: string, payload: any, created_at: any, updated_at: any, public_url?: string | null } | null } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type ProcessorFragmentFragment = { __typename?: 'Processor', id: string, name: string, version: string, image_tag: string, description?: string | null, tags?: string | null, allowed_mime_types: string, visibility: PROCESSOR_VISIBILITY, payload: any, created_at: any, updated_at: any, configuration: { __typename?: 'ProcessorConfiguration', dataset_input_argument: string, dataset_input_value: string, dataset_output_argument: string, dataset_output_value: string, command: string, parameters: Array<{ __typename?: 'ProcessorParameter', sequence: number, name: string, description: string, type: PROCESSOR_PARAMETER_TYPE, is_required: boolean, default_value?: string | null }> } };

export type UserProcessorQueryVariables = Exact<{
  processorId: Scalars['String']['input'];
}>;


export type UserProcessorQuery = { __typename?: 'Query', userProcessor: { __typename?: 'Processor', id: string, name: string, version: string, image_tag: string, description?: string | null, tags?: string | null, allowed_mime_types: string, visibility: PROCESSOR_VISIBILITY, payload: any, created_at: any, updated_at: any, configuration: { __typename?: 'ProcessorConfiguration', dataset_input_argument: string, dataset_input_value: string, dataset_output_argument: string, dataset_output_value: string, command: string, parameters: Array<{ __typename?: 'ProcessorParameter', sequence: number, name: string, description: string, type: PROCESSOR_PARAMETER_TYPE, is_required: boolean, default_value?: string | null }> } } };

export type UserProcessorsQueryVariables = Exact<{
  sorting?: InputMaybe<Array<SortingFieldSchema> | SortingFieldSchema>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UserProcessorsQuery = { __typename?: 'Query', userProcessors: { __typename?: 'ProcessorPaginationConnection', totalCount: number, edges: Array<{ __typename?: 'ProcessorPaginationEdge', cursor: any, node: { __typename?: 'Processor', id: string, name: string, version: string, image_tag: string, description?: string | null, tags?: string | null, allowed_mime_types: string, visibility: PROCESSOR_VISIBILITY, payload: any, created_at: any, updated_at: any, configuration: { __typename?: 'ProcessorConfiguration', dataset_input_argument: string, dataset_input_value: string, dataset_output_argument: string, dataset_output_value: string, command: string, parameters: Array<{ __typename?: 'ProcessorParameter', sequence: number, name: string, description: string, type: PROCESSOR_PARAMETER_TYPE, is_required: boolean, default_value?: string | null }> } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type UserFragmentFragment = { __typename?: 'User', id: string, email: string, name?: string | null, phone_number?: string | null, language?: string | null, is_admin: boolean, created_at: any, updated_at: any };

export type UserAuthProviderConnFragmentFragment = { __typename?: 'UserAuthProviderConn', id: string, auth_provider: AUTH_PROVIDER, code: string, payload: any, disconnected_at?: any | null, created_at: any, updated_at: any, user_id: string };

export type UserSessionFragmentFragment = { __typename?: 'UserSession', access_token: string, access_token_expires_at: any, refresh_token?: string | null, refresh_token_expires_at?: any | null, payload: any, user_auth_provider_conn_id: string };

export type SessionFragmentFragment = { __typename?: 'Session', user: { __typename?: 'User', id: string, email: string, name?: string | null, phone_number?: string | null, language?: string | null, is_admin: boolean, created_at: any, updated_at: any }, user_auth_provider_conn: { __typename?: 'UserAuthProviderConn', id: string, auth_provider: AUTH_PROVIDER, code: string, payload: any, disconnected_at?: any | null, created_at: any, updated_at: any, user_id: string }, user_session: { __typename?: 'UserSession', access_token: string, access_token_expires_at: any, refresh_token?: string | null, refresh_token_expires_at?: any | null, payload: any, user_auth_provider_conn_id: string } };

export type UserQueryVariables = Exact<{ [key: string]: never; }>;


export type UserQuery = { __typename?: 'Query', user: { __typename?: 'User', id: string, email: string, name?: string | null, phone_number?: string | null, language?: string | null, is_admin: boolean, created_at: any, updated_at: any } };

export type SessionQueryVariables = Exact<{ [key: string]: never; }>;


export type SessionQuery = { __typename?: 'Query', session: { __typename?: 'Session', user: { __typename?: 'User', id: string, email: string, name?: string | null, phone_number?: string | null, language?: string | null, is_admin: boolean, created_at: any, updated_at: any }, user_auth_provider_conn: { __typename?: 'UserAuthProviderConn', id: string, auth_provider: AUTH_PROVIDER, code: string, payload: any, disconnected_at?: any | null, created_at: any, updated_at: any, user_id: string }, user_session: { __typename?: 'UserSession', access_token: string, access_token_expires_at: any, refresh_token?: string | null, refresh_token_expires_at?: any | null, payload: any, user_auth_provider_conn_id: string } } };

export type UserUpdateDataMutationVariables = Exact<{
  data: UserUpdateDataSchema;
}>;


export type UserUpdateDataMutation = { __typename?: 'Mutation', userUpdateData: { __typename?: 'User', id: string, email: string, name?: string | null, phone_number?: string | null, language?: string | null, is_admin: boolean, created_at: any, updated_at: any } };

export type UserSessionsCloseMutationVariables = Exact<{ [key: string]: never; }>;


export type UserSessionsCloseMutation = { __typename?: 'Mutation', userSessionsClose: { __typename?: 'UserAuthProviderConn', id: string, auth_provider: AUTH_PROVIDER, code: string, payload: any, disconnected_at?: any | null, created_at: any, updated_at: any, user_id: string } };

export const ProcessorFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProcessorFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Processor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"image_tag"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"allowed_mime_types"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"configuration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"parameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"default_value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dataset_input_argument"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_input_value"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_output_argument"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_output_value"}},{"kind":"Field","name":{"kind":"Name","value":"command"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<ProcessorFragmentFragment, unknown>;
export const UserFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<UserFragmentFragment, unknown>;
export const FileFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"storage_provider"}},{"kind":"Field","name":{"kind":"Name","value":"provider_path"}},{"kind":"Field","name":{"kind":"Name","value":"provider_status"}},{"kind":"Field","name":{"kind":"Name","value":"provider_verified_at"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"allow_public_access"}},{"kind":"Field","name":{"kind":"Name","value":"public_url_expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"mime_type"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"md5_hash"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"public_url"}}]}}]} as unknown as DocumentNode<FileFragmentFragment, unknown>;
export const DatasetFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DatasetFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Dataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"file_id"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"storage_provider"}},{"kind":"Field","name":{"kind":"Name","value":"provider_path"}},{"kind":"Field","name":{"kind":"Name","value":"provider_status"}},{"kind":"Field","name":{"kind":"Name","value":"provider_verified_at"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"allow_public_access"}},{"kind":"Field","name":{"kind":"Name","value":"public_url_expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"mime_type"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"md5_hash"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"public_url"}}]}}]} as unknown as DocumentNode<DatasetFragmentFragment, unknown>;
export const ProcessingFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProcessingFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Processing"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"started_at"}},{"kind":"Field","name":{"kind":"Name","value":"finished_at"}},{"kind":"Field","name":{"kind":"Name","value":"keep_until"}},{"kind":"Field","name":{"kind":"Name","value":"configuration"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"processor_id"}},{"kind":"Field","name":{"kind":"Name","value":"processor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProcessorFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dataset_id"}},{"kind":"Field","name":{"kind":"Name","value":"dataset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DatasetFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"result_file_id"}},{"kind":"Field","name":{"kind":"Name","value":"result_file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"worker_id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"storage_provider"}},{"kind":"Field","name":{"kind":"Name","value":"provider_path"}},{"kind":"Field","name":{"kind":"Name","value":"provider_status"}},{"kind":"Field","name":{"kind":"Name","value":"provider_verified_at"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"allow_public_access"}},{"kind":"Field","name":{"kind":"Name","value":"public_url_expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"mime_type"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"md5_hash"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"public_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProcessorFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Processor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"image_tag"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"allowed_mime_types"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"configuration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"parameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"default_value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dataset_input_argument"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_input_value"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_output_argument"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_output_value"}},{"kind":"Field","name":{"kind":"Name","value":"command"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DatasetFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Dataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"file_id"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileFragment"}}]}}]}}]} as unknown as DocumentNode<ProcessingFragmentFragment, unknown>;
export const UserAuthProviderConnFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserAuthProviderConnFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserAuthProviderConn"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"auth_provider"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"disconnected_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}}]}}]} as unknown as DocumentNode<UserAuthProviderConnFragmentFragment, unknown>;
export const UserSessionFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSessionFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSession"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"access_token_expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"refresh_token"}},{"kind":"Field","name":{"kind":"Name","value":"refresh_token_expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"user_auth_provider_conn_id"}}]}}]} as unknown as DocumentNode<UserSessionFragmentFragment, unknown>;
export const SessionFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SessionFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Session"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user_auth_provider_conn"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserAuthProviderConnFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user_session"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSessionFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserAuthProviderConnFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserAuthProviderConn"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"auth_provider"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"disconnected_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSessionFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSession"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"access_token_expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"refresh_token"}},{"kind":"Field","name":{"kind":"Name","value":"refresh_token_expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"user_auth_provider_conn_id"}}]}}]} as unknown as DocumentNode<SessionFragmentFragment, unknown>;
export const UserDatasetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserDataset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userDataset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dataset_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DatasetFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"storage_provider"}},{"kind":"Field","name":{"kind":"Name","value":"provider_path"}},{"kind":"Field","name":{"kind":"Name","value":"provider_status"}},{"kind":"Field","name":{"kind":"Name","value":"provider_verified_at"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"allow_public_access"}},{"kind":"Field","name":{"kind":"Name","value":"public_url_expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"mime_type"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"md5_hash"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"public_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DatasetFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Dataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"file_id"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileFragment"}}]}}]}}]} as unknown as DocumentNode<UserDatasetQuery, UserDatasetQueryVariables>;
export const UserDatasetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserDatasets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sorting"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SortingFieldSchema"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ConnectionCursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"before"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ConnectionCursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"last"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userDatasets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sorting"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sorting"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"before"},"value":{"kind":"Variable","name":{"kind":"Name","value":"before"}}},{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"Variable","name":{"kind":"Name","value":"last"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DatasetFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"storage_provider"}},{"kind":"Field","name":{"kind":"Name","value":"provider_path"}},{"kind":"Field","name":{"kind":"Name","value":"provider_status"}},{"kind":"Field","name":{"kind":"Name","value":"provider_verified_at"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"allow_public_access"}},{"kind":"Field","name":{"kind":"Name","value":"public_url_expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"mime_type"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"md5_hash"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"public_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DatasetFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Dataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"file_id"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileFragment"}}]}}]}}]} as unknown as DocumentNode<UserDatasetsQuery, UserDatasetsQueryVariables>;
export const UserProcessingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserProcessing"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"processingId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userProcessing"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"processing_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"processingId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProcessingFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProcessorFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Processor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"image_tag"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"allowed_mime_types"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"configuration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"parameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"default_value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dataset_input_argument"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_input_value"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_output_argument"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_output_value"}},{"kind":"Field","name":{"kind":"Name","value":"command"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"storage_provider"}},{"kind":"Field","name":{"kind":"Name","value":"provider_path"}},{"kind":"Field","name":{"kind":"Name","value":"provider_status"}},{"kind":"Field","name":{"kind":"Name","value":"provider_verified_at"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"allow_public_access"}},{"kind":"Field","name":{"kind":"Name","value":"public_url_expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"mime_type"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"md5_hash"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"public_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DatasetFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Dataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"file_id"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProcessingFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Processing"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"started_at"}},{"kind":"Field","name":{"kind":"Name","value":"finished_at"}},{"kind":"Field","name":{"kind":"Name","value":"keep_until"}},{"kind":"Field","name":{"kind":"Name","value":"configuration"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"processor_id"}},{"kind":"Field","name":{"kind":"Name","value":"processor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProcessorFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dataset_id"}},{"kind":"Field","name":{"kind":"Name","value":"dataset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DatasetFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"result_file_id"}},{"kind":"Field","name":{"kind":"Name","value":"result_file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"worker_id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}}]}}]} as unknown as DocumentNode<UserProcessingQuery, UserProcessingQueryVariables>;
export const UserProcessesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserProcesses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"processorId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"started"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"finished"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PROCESSING_STATUS"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"visibility"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PROCESSING_VISIBILITY"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sorting"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SortingFieldSchema"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ConnectionCursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"before"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ConnectionCursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"last"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userProcesses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dataset_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"datasetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"processor_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"processorId"}}},{"kind":"Argument","name":{"kind":"Name","value":"started"},"value":{"kind":"Variable","name":{"kind":"Name","value":"started"}}},{"kind":"Argument","name":{"kind":"Name","value":"finished"},"value":{"kind":"Variable","name":{"kind":"Name","value":"finished"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"visibility"},"value":{"kind":"Variable","name":{"kind":"Name","value":"visibility"}}},{"kind":"Argument","name":{"kind":"Name","value":"sorting"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sorting"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"before"},"value":{"kind":"Variable","name":{"kind":"Name","value":"before"}}},{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"Variable","name":{"kind":"Name","value":"last"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProcessingFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProcessorFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Processor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"image_tag"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"allowed_mime_types"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"configuration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"parameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"default_value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dataset_input_argument"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_input_value"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_output_argument"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_output_value"}},{"kind":"Field","name":{"kind":"Name","value":"command"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FileFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"File"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"storage_provider"}},{"kind":"Field","name":{"kind":"Name","value":"provider_path"}},{"kind":"Field","name":{"kind":"Name","value":"provider_status"}},{"kind":"Field","name":{"kind":"Name","value":"provider_verified_at"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"allow_public_access"}},{"kind":"Field","name":{"kind":"Name","value":"public_url_expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"mime_type"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"md5_hash"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"public_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DatasetFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Dataset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"file_id"}},{"kind":"Field","name":{"kind":"Name","value":"file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProcessingFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Processing"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"started_at"}},{"kind":"Field","name":{"kind":"Name","value":"finished_at"}},{"kind":"Field","name":{"kind":"Name","value":"keep_until"}},{"kind":"Field","name":{"kind":"Name","value":"configuration"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"processor_id"}},{"kind":"Field","name":{"kind":"Name","value":"processor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProcessorFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dataset_id"}},{"kind":"Field","name":{"kind":"Name","value":"dataset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DatasetFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"result_file_id"}},{"kind":"Field","name":{"kind":"Name","value":"result_file"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FileFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"worker_id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}}]}}]} as unknown as DocumentNode<UserProcessesQuery, UserProcessesQueryVariables>;
export const UserProcessorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserProcessor"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"processorId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userProcessor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"processor_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"processorId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProcessorFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProcessorFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Processor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"image_tag"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"allowed_mime_types"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"configuration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"parameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"default_value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dataset_input_argument"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_input_value"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_output_argument"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_output_value"}},{"kind":"Field","name":{"kind":"Name","value":"command"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<UserProcessorQuery, UserProcessorQueryVariables>;
export const UserProcessorsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserProcessors"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sorting"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SortingFieldSchema"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ConnectionCursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"before"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ConnectionCursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"last"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userProcessors"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sorting"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sorting"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"before"},"value":{"kind":"Variable","name":{"kind":"Name","value":"before"}}},{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"Variable","name":{"kind":"Name","value":"last"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProcessorFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProcessorFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Processor"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"image_tag"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"allowed_mime_types"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"configuration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"parameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"default_value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dataset_input_argument"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_input_value"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_output_argument"}},{"kind":"Field","name":{"kind":"Name","value":"dataset_output_value"}},{"kind":"Field","name":{"kind":"Name","value":"command"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<UserProcessorsQuery, UserProcessorsQueryVariables>;
export const UserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"User"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<UserQuery, UserQueryVariables>;
export const SessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Session"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"session"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SessionFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserAuthProviderConnFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserAuthProviderConn"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"auth_provider"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"disconnected_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserSessionFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserSession"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"access_token_expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"refresh_token"}},{"kind":"Field","name":{"kind":"Name","value":"refresh_token_expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"user_auth_provider_conn_id"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SessionFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Session"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user_auth_provider_conn"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserAuthProviderConnFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user_session"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserSessionFragment"}}]}}]}}]} as unknown as DocumentNode<SessionQuery, SessionQueryVariables>;
export const UserUpdateDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UserUpdateData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserUpdateDataSchema"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userUpdateData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone_number"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<UserUpdateDataMutation, UserUpdateDataMutationVariables>;
export const UserSessionsCloseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UserSessionsClose"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userSessionsClose"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserAuthProviderConnFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserAuthProviderConnFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserAuthProviderConn"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"auth_provider"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"disconnected_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}}]}}]} as unknown as DocumentNode<UserSessionsCloseMutation, UserSessionsCloseMutationVariables>;