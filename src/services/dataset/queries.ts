import { gql } from '@api/gql';

export const USER_DATASET_GET_ONE_QUERY = gql(`
  query UserDataset($datasetId: String!) {
    userDataset(dataset_id: $datasetId) {
      ...DatasetFragment
    }
  }
`);

export const USER_DATASET_GET_MANY_QUERY = gql(`
  query UserDatasets(
    $sorting: [SortingFieldSchema!]

    $skip: Int,
    $take: Int,

    $after: ConnectionCursor,
    $first: Int,

    $before: ConnectionCursor,
    $last: Int,
  ) {
    userDatasets(
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
          ...DatasetFragment
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
