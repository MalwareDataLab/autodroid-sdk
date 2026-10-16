// GraphQL import
import { gql } from '@gql';

export const USER_FRAGMENT = gql(`
  fragment UserFragment on User {
    id
    seq
    email
    name
    phone_number
    learning_data
    language
    created_at
    updated_at
    is_admin
    notifications_enabled
  }
`);

export const USER_AUTH_PROVIDER_CONN_FRAGMENT = gql(`
  fragment UserAuthProviderConnFragment on UserAuthProviderConn {
    id
    seq
    auth_provider
    code
    disconnected_at
    created_at
    updated_at
    user_id
  }
`);

export const MCP_AUTHORIZATION_GRANT_FRAGMENT = gql(`
  fragment McpAuthorizationGrantFragment on McpAuthorizationGrant {
    id
    client_id
    client_name
    client_verified_host
    resource
    scopes
    created_at
    last_used_at
    expires_at
  }
`);

export const USER_SESSION_FRAGMENT = gql(`
  fragment UserSessionFragment on UserSession {
    access_token
    access_token_expires_at
    refresh_token
    refresh_token_expires_at
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
