import { gql } from '@api/gql';

export const USER_PROCESSING_GET_ONE_QUERY = gql(`
  query UserProcessing($processingId: String!) {
    userProcessing(processing_id: $processingId) {
      ...ProcessingFragment
    }
  }
`);

export const USER_PROCESSING_GET_MANY_QUERY = gql(`
  query UserProcesses(
    $datasetId: String,
    $processorId: String,

    $started: Boolean,
    $finished: Boolean,

    $status: PROCESSING_STATUS,
    $visibility: PROCESSING_VISIBILITY,

    $sorting: [SortingFieldSchema!]

    $skip: Int,
    $take: Int,

    $after: ConnectionCursor,
    $first: Int,

    $before: ConnectionCursor,
    $last: Int,
) {
    userProcesses(
      dataset_id: $datasetId,
      processor_id: $processorId,

      started: $started,
      finished: $finished,

      status: $status,
      visibility: $visibility,

      sorting: $sorting

      skip: $skip,
      take: $take,

      first: $first,
      after: $after,

      before: $before,
      last: $last,
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
