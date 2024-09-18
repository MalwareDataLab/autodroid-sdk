import { gql } from '@api/gql';

export const DATASET_FRAGMENT = gql(`
  fragment DatasetFragment on Dataset {
    id
    description
    tags
    visibility
    created_at
    updated_at

    user_id
    user {
      ...UserFragment
    }

    file_id
    file {
      ...FileFragment
    }
  }
`);
