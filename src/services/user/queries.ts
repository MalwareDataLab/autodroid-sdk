// GraphQL import
import { gql } from '@gql';

export const USER_QUERY = gql(`
  query User {
    user {
      ...UserFragment
    }
  }
`);

export const SESSION_QUERY = gql(`
  query Session {
    session {
      ...SessionFragment
    }
  }
`);

export const USER_UPDATE_DATA_MUTATION = gql(`
  mutation UserUpdateData($data: UserUpdateDataSchema!) {
    userUpdateData(data: $data) {
      ...UserFragment
    }
  }
`);

export const USER_SESSIONS_CLOSE_MUTATION = gql(`
  mutation UserSessionsClose {
    userSessionsClose {
      ...UserAuthProviderConnFragment
    }
  }
`);

export const USER_UPDATE_LEARNING_DATA_MUTATION = gql(`
  mutation UserUpdateLearningData($data: JSON!) {
    userUpdateLearningData(data: $data) {
      ...UserFragment
    }
  }
`);

export const USER_MCP_AUTHORIZATION_GRANTS_QUERY = gql(`
  query UserMcpAuthorizationGrants {
    userMcpAuthorizationGrants {
      ...McpAuthorizationGrantFragment
    }
  }
`);

export const USER_MCP_AUTHORIZATION_GRANT_REVOKE_MUTATION = gql(`
  mutation UserMcpAuthorizationGrantRevoke($mcpAuthorizationGrantId: String!) {
    userMcpAuthorizationGrantRevoke(mcp_authorization_grant_id: $mcpAuthorizationGrantId) {
      ...McpAuthorizationGrantFragment
    }
  }
`);
