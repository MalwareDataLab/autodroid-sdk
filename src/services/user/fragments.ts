import { gql } from '@api/gql';

export const USER_FRAGMENT = gql(`
  fragment UserFragment on User {
    id
    email
    name
    phone_number
    language
    is_admin
    created_at
    updated_at
  }
`);

export const USER_AUTH_PROVIDER_CONN_FRAGMENT = gql(`
  fragment UserAuthProviderConnFragment on UserAuthProviderConn {
    id
    auth_provider
    code
    payload
    disconnected_at
    created_at
    updated_at
    user_id
  }
`);

export const USER_SESSION_FRAGMENT = gql(`
  fragment UserSessionFragment on UserSession {
    access_token
    access_token_expires_at
    refresh_token
    refresh_token_expires_at
    payload
    user_auth_provider_conn_id
  }
`);

export const SESSION_FRAGMENT = gql(`
  fragment SessionFragment on Session {
    user {
      ...UserFragment
    }
    user_auth_provider_conn {
      ...UserAuthProviderConnFragment
    }
    user_session {
      ...UserSessionFragment
    }
  }
`);
