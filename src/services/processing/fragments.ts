import { gql } from '@api/gql';

export const PROCESSING_FRAGMENT = gql(`
  fragment ProcessingFragment on Processing {
    id
    status
    visibility
    started_at
    finished_at
    keep_until
    verified_at
    attempts
    message
    configuration {
      key
      value
    }
    created_at
    updated_at

    processor_id
    processor {
      ...ProcessorFragment
    }

    dataset_id
    dataset {
      ...DatasetFragment
    }

    result_file_id
    result_file {
      ...FileFragment
    }

    metrics_file_id
    metrics_file {
      ...FileFragment
    }

    worker_id
    user_id
  }
`);
