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
