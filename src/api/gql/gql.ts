/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
    "\n  fragment DatasetFragment on Dataset {\n    id\n    description\n    tags\n    visibility\n    created_at\n    updated_at\n\n    user_id\n    user {\n      ...UserFragment\n    }\n\n    file_id\n    file {\n      ...FileFragment\n    }\n  }\n": types.DatasetFragmentFragmentDoc,
    "\n  query UserDataset($datasetId: String!) {\n    userDataset(dataset_id: $datasetId) {\n      ...DatasetFragment\n    }\n  }\n": types.UserDatasetDocument,
    "\n  query UserDatasets(\n    $sorting: [SortingFieldSchema!]\n\n    $skip: Int,\n    $take: Int,\n\n    $after: ConnectionCursor,\n    $first: Int,\n\n    $before: ConnectionCursor,\n    $last: Int,\n  ) {\n    userDatasets(\n      sorting: $sorting\n\n      skip: $skip,\n      take: $take,\n\n      first: $first,\n      after: $after,\n\n      before: $before,\n      last: $last,\n    ) {\n      edges {\n        node {\n          ...DatasetFragment\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n": types.UserDatasetsDocument,
    "\n  mutation UserDatasetCreate($data: UserDatasetCreateSchema!) {\n    userDatasetCreate(data: $data) {\n      ...DatasetFragment\n    }\n  }\n": types.UserDatasetCreateDocument,
    "\n  mutation UserDatasetUpdate($datasetId: String!, $data: UserDatasetUpdateSchema!) {\n    userDatasetUpdate(dataset_id: $datasetId, data: $data) {\n      ...DatasetFragment\n    }\n  }\n": types.UserDatasetUpdateDocument,
    "\n  mutation UserDatasetRequestPublication($datasetId: String!) {\n    userDatasetRequestPublication(dataset_id: $datasetId) {\n      ...DatasetFragment\n    }\n  }\n": types.UserDatasetRequestPublicationDocument,
    "\n  mutation UserDatasetDelete($datasetId: String!) {\n    userDatasetDelete(dataset_id: $datasetId) {\n      ...DatasetFragment\n    }\n  }\n": types.UserDatasetDeleteDocument,
    "\n  fragment FileFragment on File {\n    id\n    storage_provider\n    provider_path\n    provider_status\n    provider_verified_at\n    type\n    upload_url\n    upload_url_expires_at\n    allow_public_access\n    public_url_expires_at\n    filename\n    mime_type\n    size\n    md5_hash\n    payload\n    created_at\n    updated_at\n    public_url\n  }\n": types.FileFragmentFragmentDoc,
    "\n  fragment ProcessingFragment on Processing {\n    id\n    status\n    visibility\n    started_at\n    finished_at\n    keep_until\n    verified_at\n    attempts\n    message\n    configuration {\n      key\n      value\n    }\n    payload\n    created_at\n    updated_at\n\n    processor_id\n    processor {\n      ...ProcessorFragment\n    }\n\n    dataset_id\n    dataset {\n      ...DatasetFragment\n    }\n\n    result_file_id\n    result_file {\n      ...FileFragment\n    }\n\n    worker_id\n    user_id\n  }\n": types.ProcessingFragmentFragmentDoc,
    "\n  query UserProcessing($processingId: String!) {\n    userProcessing(processing_id: $processingId) {\n      ...ProcessingFragment\n    }\n  }\n": types.UserProcessingDocument,
    "\n  query UserProcesses(\n    $datasetId: String,\n    $processorId: String,\n\n    $started: Boolean,\n    $finished: Boolean,\n\n    $status: PROCESSING_STATUS,\n    $visibility: PROCESSING_VISIBILITY,\n\n    $sorting: [SortingFieldSchema!]\n\n    $skip: Int,\n    $take: Int,\n\n    $after: ConnectionCursor,\n    $first: Int,\n\n    $before: ConnectionCursor,\n    $last: Int,\n) {\n    userProcesses(\n      dataset_id: $datasetId,\n      processor_id: $processorId,\n\n      started: $started,\n      finished: $finished,\n\n      status: $status,\n      visibility: $visibility,\n\n      sorting: $sorting\n\n      skip: $skip,\n      take: $take,\n\n      first: $first,\n      after: $after,\n\n      before: $before,\n      last: $last,\n    ) {\n      edges {\n        node {\n          ...ProcessingFragment\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n": types.UserProcessesDocument,
    "\n  mutation UserRequestDatasetProcessing($data: RequestDatasetProcessingSchema!) {\n    userRequestDatasetProcessing(data: $data) {\n      ...ProcessingFragment\n    }\n  }\n": types.UserRequestDatasetProcessingDocument,
    "\n  mutation UserProcessingUpdateVisibility(\n    $processingId: String!\n    $visibility: PROCESSING_VISIBILITY!\n  ) {\n    userProcessingUpdateVisibility(\n      processing_id: $processingId,\n      visibility: $visibility\n    ) {\n      ...ProcessingFragment\n    }\n  }\n": types.UserProcessingUpdateVisibilityDocument,
    "\n  mutation UserProcessingExtendKeepUntil(\n    $processingId: String!,\n    $keepUntil: DateTimeISO!\n  ) {\n    userProcessingExtendKeepUntil(\n      processing_id: $processingId,\n      keep_until: $keepUntil\n      ) {\n      ...ProcessingFragment\n    }\n  }\n": types.UserProcessingExtendKeepUntilDocument,
    "\n  mutation UserProcessingDelete($processingId: String!) {\n    userProcessingDelete(processing_id: $processingId) {\n      ...ProcessingFragment\n    }\n  }\n": types.UserProcessingDeleteDocument,
    "\n  fragment ProcessorFragment on Processor {\n    id\n    name\n    version\n    image_tag\n    description\n    tags\n    allowed_mime_types\n    visibility\n    configuration {\n      parameters {\n        sequence\n        name\n        description\n        type\n        is_required\n        default_value\n      }\n      dataset_input_argument\n      dataset_input_value\n      dataset_output_argument\n      dataset_output_value\n      command\n    }\n    payload\n    created_at\n    updated_at\n  }\n": types.ProcessorFragmentFragmentDoc,
    "\n  query UserProcessor($processorId: String!) {\n    userProcessor(processor_id: $processorId) {\n      ...ProcessorFragment\n    }\n  }\n": types.UserProcessorDocument,
    "\n  query UserProcessors(\n    $sorting: [SortingFieldSchema!]\n\n    $skip: Int,\n    $take: Int,\n\n    $after: ConnectionCursor,\n    $first: Int,\n\n    $before: ConnectionCursor,\n    $last: Int,\n  ) {\n    userProcessors(\n      sorting: $sorting\n\n      skip: $skip,\n      take: $take,\n\n      first: $first,\n      after: $after,\n\n      before: $before,\n      last: $last,\n    ) {\n      edges {\n        node {\n          ...ProcessorFragment\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n": types.UserProcessorsDocument,
    "\n  fragment UserFragment on User {\n    id\n    email\n    name\n    phone_number\n    language\n    created_at\n    updated_at\n    is_admin\n  }\n": types.UserFragmentFragmentDoc,
    "\n  fragment UserAuthProviderConnFragment on UserAuthProviderConn {\n    id\n    auth_provider\n    code\n    payload\n    disconnected_at\n    created_at\n    updated_at\n    user_id\n  }\n": types.UserAuthProviderConnFragmentFragmentDoc,
    "\n  fragment UserSessionFragment on UserSession {\n    access_token\n    access_token_expires_at\n    refresh_token\n    refresh_token_expires_at\n    payload\n    user_auth_provider_conn_id\n  }\n": types.UserSessionFragmentFragmentDoc,
    "\n  fragment SessionFragment on Session {\n    user {\n      ...UserFragment\n    }\n    user_auth_provider_conn {\n      ...UserAuthProviderConnFragment\n    }\n    user_session {\n      ...UserSessionFragment\n    }\n  }\n": types.SessionFragmentFragmentDoc,
    "\n  query User {\n    user {\n      ...UserFragment\n    }\n  }\n": types.UserDocument,
    "\n  query Session {\n    session {\n      ...SessionFragment\n    }\n  }\n": types.SessionDocument,
    "\n  mutation UserUpdateData($data: UserUpdateDataSchema!) {\n    userUpdateData(data: $data) {\n      ...UserFragment\n    }\n  }\n": types.UserUpdateDataDocument,
    "\n  mutation UserSessionsClose {\n    userSessionsClose {\n      ...UserAuthProviderConnFragment\n    }\n  }\n": types.UserSessionsCloseDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment DatasetFragment on Dataset {\n    id\n    description\n    tags\n    visibility\n    created_at\n    updated_at\n\n    user_id\n    user {\n      ...UserFragment\n    }\n\n    file_id\n    file {\n      ...FileFragment\n    }\n  }\n"): (typeof documents)["\n  fragment DatasetFragment on Dataset {\n    id\n    description\n    tags\n    visibility\n    created_at\n    updated_at\n\n    user_id\n    user {\n      ...UserFragment\n    }\n\n    file_id\n    file {\n      ...FileFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query UserDataset($datasetId: String!) {\n    userDataset(dataset_id: $datasetId) {\n      ...DatasetFragment\n    }\n  }\n"): (typeof documents)["\n  query UserDataset($datasetId: String!) {\n    userDataset(dataset_id: $datasetId) {\n      ...DatasetFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query UserDatasets(\n    $sorting: [SortingFieldSchema!]\n\n    $skip: Int,\n    $take: Int,\n\n    $after: ConnectionCursor,\n    $first: Int,\n\n    $before: ConnectionCursor,\n    $last: Int,\n  ) {\n    userDatasets(\n      sorting: $sorting\n\n      skip: $skip,\n      take: $take,\n\n      first: $first,\n      after: $after,\n\n      before: $before,\n      last: $last,\n    ) {\n      edges {\n        node {\n          ...DatasetFragment\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query UserDatasets(\n    $sorting: [SortingFieldSchema!]\n\n    $skip: Int,\n    $take: Int,\n\n    $after: ConnectionCursor,\n    $first: Int,\n\n    $before: ConnectionCursor,\n    $last: Int,\n  ) {\n    userDatasets(\n      sorting: $sorting\n\n      skip: $skip,\n      take: $take,\n\n      first: $first,\n      after: $after,\n\n      before: $before,\n      last: $last,\n    ) {\n      edges {\n        node {\n          ...DatasetFragment\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UserDatasetCreate($data: UserDatasetCreateSchema!) {\n    userDatasetCreate(data: $data) {\n      ...DatasetFragment\n    }\n  }\n"): (typeof documents)["\n  mutation UserDatasetCreate($data: UserDatasetCreateSchema!) {\n    userDatasetCreate(data: $data) {\n      ...DatasetFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UserDatasetUpdate($datasetId: String!, $data: UserDatasetUpdateSchema!) {\n    userDatasetUpdate(dataset_id: $datasetId, data: $data) {\n      ...DatasetFragment\n    }\n  }\n"): (typeof documents)["\n  mutation UserDatasetUpdate($datasetId: String!, $data: UserDatasetUpdateSchema!) {\n    userDatasetUpdate(dataset_id: $datasetId, data: $data) {\n      ...DatasetFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UserDatasetRequestPublication($datasetId: String!) {\n    userDatasetRequestPublication(dataset_id: $datasetId) {\n      ...DatasetFragment\n    }\n  }\n"): (typeof documents)["\n  mutation UserDatasetRequestPublication($datasetId: String!) {\n    userDatasetRequestPublication(dataset_id: $datasetId) {\n      ...DatasetFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UserDatasetDelete($datasetId: String!) {\n    userDatasetDelete(dataset_id: $datasetId) {\n      ...DatasetFragment\n    }\n  }\n"): (typeof documents)["\n  mutation UserDatasetDelete($datasetId: String!) {\n    userDatasetDelete(dataset_id: $datasetId) {\n      ...DatasetFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment FileFragment on File {\n    id\n    storage_provider\n    provider_path\n    provider_status\n    provider_verified_at\n    type\n    upload_url\n    upload_url_expires_at\n    allow_public_access\n    public_url_expires_at\n    filename\n    mime_type\n    size\n    md5_hash\n    payload\n    created_at\n    updated_at\n    public_url\n  }\n"): (typeof documents)["\n  fragment FileFragment on File {\n    id\n    storage_provider\n    provider_path\n    provider_status\n    provider_verified_at\n    type\n    upload_url\n    upload_url_expires_at\n    allow_public_access\n    public_url_expires_at\n    filename\n    mime_type\n    size\n    md5_hash\n    payload\n    created_at\n    updated_at\n    public_url\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment ProcessingFragment on Processing {\n    id\n    status\n    visibility\n    started_at\n    finished_at\n    keep_until\n    verified_at\n    attempts\n    message\n    configuration {\n      key\n      value\n    }\n    payload\n    created_at\n    updated_at\n\n    processor_id\n    processor {\n      ...ProcessorFragment\n    }\n\n    dataset_id\n    dataset {\n      ...DatasetFragment\n    }\n\n    result_file_id\n    result_file {\n      ...FileFragment\n    }\n\n    worker_id\n    user_id\n  }\n"): (typeof documents)["\n  fragment ProcessingFragment on Processing {\n    id\n    status\n    visibility\n    started_at\n    finished_at\n    keep_until\n    verified_at\n    attempts\n    message\n    configuration {\n      key\n      value\n    }\n    payload\n    created_at\n    updated_at\n\n    processor_id\n    processor {\n      ...ProcessorFragment\n    }\n\n    dataset_id\n    dataset {\n      ...DatasetFragment\n    }\n\n    result_file_id\n    result_file {\n      ...FileFragment\n    }\n\n    worker_id\n    user_id\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query UserProcessing($processingId: String!) {\n    userProcessing(processing_id: $processingId) {\n      ...ProcessingFragment\n    }\n  }\n"): (typeof documents)["\n  query UserProcessing($processingId: String!) {\n    userProcessing(processing_id: $processingId) {\n      ...ProcessingFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query UserProcesses(\n    $datasetId: String,\n    $processorId: String,\n\n    $started: Boolean,\n    $finished: Boolean,\n\n    $status: PROCESSING_STATUS,\n    $visibility: PROCESSING_VISIBILITY,\n\n    $sorting: [SortingFieldSchema!]\n\n    $skip: Int,\n    $take: Int,\n\n    $after: ConnectionCursor,\n    $first: Int,\n\n    $before: ConnectionCursor,\n    $last: Int,\n) {\n    userProcesses(\n      dataset_id: $datasetId,\n      processor_id: $processorId,\n\n      started: $started,\n      finished: $finished,\n\n      status: $status,\n      visibility: $visibility,\n\n      sorting: $sorting\n\n      skip: $skip,\n      take: $take,\n\n      first: $first,\n      after: $after,\n\n      before: $before,\n      last: $last,\n    ) {\n      edges {\n        node {\n          ...ProcessingFragment\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query UserProcesses(\n    $datasetId: String,\n    $processorId: String,\n\n    $started: Boolean,\n    $finished: Boolean,\n\n    $status: PROCESSING_STATUS,\n    $visibility: PROCESSING_VISIBILITY,\n\n    $sorting: [SortingFieldSchema!]\n\n    $skip: Int,\n    $take: Int,\n\n    $after: ConnectionCursor,\n    $first: Int,\n\n    $before: ConnectionCursor,\n    $last: Int,\n) {\n    userProcesses(\n      dataset_id: $datasetId,\n      processor_id: $processorId,\n\n      started: $started,\n      finished: $finished,\n\n      status: $status,\n      visibility: $visibility,\n\n      sorting: $sorting\n\n      skip: $skip,\n      take: $take,\n\n      first: $first,\n      after: $after,\n\n      before: $before,\n      last: $last,\n    ) {\n      edges {\n        node {\n          ...ProcessingFragment\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UserRequestDatasetProcessing($data: RequestDatasetProcessingSchema!) {\n    userRequestDatasetProcessing(data: $data) {\n      ...ProcessingFragment\n    }\n  }\n"): (typeof documents)["\n  mutation UserRequestDatasetProcessing($data: RequestDatasetProcessingSchema!) {\n    userRequestDatasetProcessing(data: $data) {\n      ...ProcessingFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UserProcessingUpdateVisibility(\n    $processingId: String!\n    $visibility: PROCESSING_VISIBILITY!\n  ) {\n    userProcessingUpdateVisibility(\n      processing_id: $processingId,\n      visibility: $visibility\n    ) {\n      ...ProcessingFragment\n    }\n  }\n"): (typeof documents)["\n  mutation UserProcessingUpdateVisibility(\n    $processingId: String!\n    $visibility: PROCESSING_VISIBILITY!\n  ) {\n    userProcessingUpdateVisibility(\n      processing_id: $processingId,\n      visibility: $visibility\n    ) {\n      ...ProcessingFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UserProcessingExtendKeepUntil(\n    $processingId: String!,\n    $keepUntil: DateTimeISO!\n  ) {\n    userProcessingExtendKeepUntil(\n      processing_id: $processingId,\n      keep_until: $keepUntil\n      ) {\n      ...ProcessingFragment\n    }\n  }\n"): (typeof documents)["\n  mutation UserProcessingExtendKeepUntil(\n    $processingId: String!,\n    $keepUntil: DateTimeISO!\n  ) {\n    userProcessingExtendKeepUntil(\n      processing_id: $processingId,\n      keep_until: $keepUntil\n      ) {\n      ...ProcessingFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UserProcessingDelete($processingId: String!) {\n    userProcessingDelete(processing_id: $processingId) {\n      ...ProcessingFragment\n    }\n  }\n"): (typeof documents)["\n  mutation UserProcessingDelete($processingId: String!) {\n    userProcessingDelete(processing_id: $processingId) {\n      ...ProcessingFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment ProcessorFragment on Processor {\n    id\n    name\n    version\n    image_tag\n    description\n    tags\n    allowed_mime_types\n    visibility\n    configuration {\n      parameters {\n        sequence\n        name\n        description\n        type\n        is_required\n        default_value\n      }\n      dataset_input_argument\n      dataset_input_value\n      dataset_output_argument\n      dataset_output_value\n      command\n    }\n    payload\n    created_at\n    updated_at\n  }\n"): (typeof documents)["\n  fragment ProcessorFragment on Processor {\n    id\n    name\n    version\n    image_tag\n    description\n    tags\n    allowed_mime_types\n    visibility\n    configuration {\n      parameters {\n        sequence\n        name\n        description\n        type\n        is_required\n        default_value\n      }\n      dataset_input_argument\n      dataset_input_value\n      dataset_output_argument\n      dataset_output_value\n      command\n    }\n    payload\n    created_at\n    updated_at\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query UserProcessor($processorId: String!) {\n    userProcessor(processor_id: $processorId) {\n      ...ProcessorFragment\n    }\n  }\n"): (typeof documents)["\n  query UserProcessor($processorId: String!) {\n    userProcessor(processor_id: $processorId) {\n      ...ProcessorFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query UserProcessors(\n    $sorting: [SortingFieldSchema!]\n\n    $skip: Int,\n    $take: Int,\n\n    $after: ConnectionCursor,\n    $first: Int,\n\n    $before: ConnectionCursor,\n    $last: Int,\n  ) {\n    userProcessors(\n      sorting: $sorting\n\n      skip: $skip,\n      take: $take,\n\n      first: $first,\n      after: $after,\n\n      before: $before,\n      last: $last,\n    ) {\n      edges {\n        node {\n          ...ProcessorFragment\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query UserProcessors(\n    $sorting: [SortingFieldSchema!]\n\n    $skip: Int,\n    $take: Int,\n\n    $after: ConnectionCursor,\n    $first: Int,\n\n    $before: ConnectionCursor,\n    $last: Int,\n  ) {\n    userProcessors(\n      sorting: $sorting\n\n      skip: $skip,\n      take: $take,\n\n      first: $first,\n      after: $after,\n\n      before: $before,\n      last: $last,\n    ) {\n      edges {\n        node {\n          ...ProcessorFragment\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      totalCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment UserFragment on User {\n    id\n    email\n    name\n    phone_number\n    language\n    created_at\n    updated_at\n    is_admin\n  }\n"): (typeof documents)["\n  fragment UserFragment on User {\n    id\n    email\n    name\n    phone_number\n    language\n    created_at\n    updated_at\n    is_admin\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment UserAuthProviderConnFragment on UserAuthProviderConn {\n    id\n    auth_provider\n    code\n    payload\n    disconnected_at\n    created_at\n    updated_at\n    user_id\n  }\n"): (typeof documents)["\n  fragment UserAuthProviderConnFragment on UserAuthProviderConn {\n    id\n    auth_provider\n    code\n    payload\n    disconnected_at\n    created_at\n    updated_at\n    user_id\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment UserSessionFragment on UserSession {\n    access_token\n    access_token_expires_at\n    refresh_token\n    refresh_token_expires_at\n    payload\n    user_auth_provider_conn_id\n  }\n"): (typeof documents)["\n  fragment UserSessionFragment on UserSession {\n    access_token\n    access_token_expires_at\n    refresh_token\n    refresh_token_expires_at\n    payload\n    user_auth_provider_conn_id\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment SessionFragment on Session {\n    user {\n      ...UserFragment\n    }\n    user_auth_provider_conn {\n      ...UserAuthProviderConnFragment\n    }\n    user_session {\n      ...UserSessionFragment\n    }\n  }\n"): (typeof documents)["\n  fragment SessionFragment on Session {\n    user {\n      ...UserFragment\n    }\n    user_auth_provider_conn {\n      ...UserAuthProviderConnFragment\n    }\n    user_session {\n      ...UserSessionFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query User {\n    user {\n      ...UserFragment\n    }\n  }\n"): (typeof documents)["\n  query User {\n    user {\n      ...UserFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Session {\n    session {\n      ...SessionFragment\n    }\n  }\n"): (typeof documents)["\n  query Session {\n    session {\n      ...SessionFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UserUpdateData($data: UserUpdateDataSchema!) {\n    userUpdateData(data: $data) {\n      ...UserFragment\n    }\n  }\n"): (typeof documents)["\n  mutation UserUpdateData($data: UserUpdateDataSchema!) {\n    userUpdateData(data: $data) {\n      ...UserFragment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UserSessionsClose {\n    userSessionsClose {\n      ...UserAuthProviderConnFragment\n    }\n  }\n"): (typeof documents)["\n  mutation UserSessionsClose {\n    userSessionsClose {\n      ...UserAuthProviderConnFragment\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;