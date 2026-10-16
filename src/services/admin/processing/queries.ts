// GraphQL import
import { gql } from '@gql';

export const ADMIN_PROCESSING_GET_ONE_QUERY = gql(`
  query AdminProcessing($processingId: String!) {
    adminProcessing(processing_id: $processingId) {
      ...ProcessingFragment
    }
  }
`);

export const ADMIN_PROCESSING_GET_MANY_QUERY = gql(`
  query AdminProcesses(
    $userId: String,
    $workerId: String,
    $resultFileId: String,
    $metricsFileId: String,

    $datasetId: String,
    $processorId: String,

    $started: Boolean,
    $finished: Boolean,

    $status: PROCESSING_STATUS,
    $visibility: PROCESSING_VISIBILITY,

    $createdAtStartDate: DateTimeISO,
    $createdAtEndDate: DateTimeISO,
    $keepUntilStartDate: DateTimeISO,
    $keepUntilEndDate: DateTimeISO,
    $includeArchived: Boolean,

    $skip: Int,
    $take: Int,

    $after: ConnectionCursor,
    $first: Int,

    $before: ConnectionCursor,
    $last: Int,

    $sorting: [SortingFieldSchema!]
) {
    adminProcesses(
      user_id: $userId,
      worker_id: $workerId,
      result_file_id: $resultFileId,
      metrics_file_id: $metricsFileId,

      dataset_id: $datasetId,
      processor_id: $processorId,

      started: $started,
      finished: $finished,

      status: $status,
      visibility: $visibility,

      created_at_start_date: $createdAtStartDate,
      created_at_end_date: $createdAtEndDate,
      keep_until_start_date: $keepUntilStartDate,
      keep_until_end_date: $keepUntilEndDate,
      include_archived: $includeArchived,

      skip: $skip,
      take: $take,

      first: $first,
      after: $after,

      before: $before,
      last: $last,

      sorting: $sorting
    ) {
      edges {
        node {
          ...ProcessingFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`);

export const ADMIN_PROCESSING_DELETE_MUTATION = gql(`
  mutation AdminProcessingDelete($processingId: String!) {
    adminProcessingDelete(processing_id: $processingId) {
      ...ProcessingFragment
    }
  }
`);

export const ADMIN_PROCESSING_UPDATE_MUTATION = gql(`
  mutation AdminProcessingUpdate($processingId: String!, $data: AdminProcessingUpdateSchema!) {
    adminProcessingUpdate(processing_id: $processingId, data: $data) {
      ...ProcessingFragment
    }
  }
`);

export const ADMIN_PROCESSING_CLEAN_EXPIRED_MUTATION = gql(`
  mutation AdminProcessingCleanExpired {
    adminProcessingCleanExpired
  }
`);

export const ADMIN_PROCESSING_TIME_ESTIMATION_QUERY = gql(`
  query AdminProcessingTimeEstimation($datasetId: String, $processorId: String) {
    adminProcessingTimeEstimation(
      dataset_id: $datasetId
      processor_id: $processorId
    ) {
      dataset_id
      processor_id
      estimated_waiting_time
      estimated_execution_time
      estimated_total_time
    }
  }
`);

export const ADMIN_PROCESSING_FAIL_DANGLING_MUTATION = gql(`
  mutation AdminProcessingFailDangling($createdAtEndDate: DateTimeISO, $status: PROCESSING_STATUS) {
    adminProcessingFailDangling(
      created_at_end_date: $createdAtEndDate
      status: $status
    )
  }
`);
