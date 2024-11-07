import { gql } from '@api/gql';

export const WORKER_REGISTRATION_TOKEN_FRAGMENT = gql(`
  fragment WorkerRegistrationTokenFragment on WorkerRegistrationToken {
    archived_at
    created_at
    expires_at
    id
    is_unlimited_usage
    token
    updated_at
    user_id
  }
`);

export const WORKER_FRAGMENT = gql(`
  fragment WorkerFragment on Worker {
    agent_info
    archived_at
    created_at
    id
    internal_id
    payload
    refresh_token
    refresh_token_expires_at
    registration_token_id
    signature
    system_info
    updated_at
    user_id
    version
  }
`);
