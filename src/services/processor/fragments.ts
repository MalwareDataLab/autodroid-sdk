import { gql } from '@api/gql';

export const PROCESSOR_FRAGMENT = gql(`
  fragment ProcessorFragment on Processor {
    id
    name
    version
    image_tag
    description
    tags
    allowed_mime_types
    visibility
    configuration {
      parameters {
        sequence
        name
        description
        type
        is_required
        default_value
      }
      dataset_input_argument
      dataset_input_value
      dataset_output_argument
      dataset_output_value
      command
    }
    payload
    created_at
    updated_at
  }
`);
