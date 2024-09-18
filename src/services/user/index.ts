import type { AutoDroidSdk } from '@package';
import type { Res } from '@utils/response.type';

import type {
  SessionQuery,
  UserQuery,
  UserSessionsCloseMutation,
  UserSessionsCloseMutationVariables,
  UserUpdateDataMutation,
  UserUpdateDataMutationVariables,
} from '@gql/graphql';

import {
  SESSION_QUERY,
  USER_QUERY,
  USER_SESSIONS_CLOSE_MUTATION,
  USER_UPDATE_DATA_MUTATION,
} from './queries';

export class User {
  constructor(private context: AutoDroidSdk) {}

  public async getCurrent(): Promise<Res<UserQuery>> {
    const { data } = await this.context.apolloClient.query({
      query: USER_QUERY,
    });
    return data.user;
  }

  public async getCurrentSession(): Promise<Res<SessionQuery>> {
    const { data } = await this.context.apolloClient.query({
      query: SESSION_QUERY,
    });
    return data.session;
  }

  public async update(
    variables: UserUpdateDataMutationVariables,
  ): Promise<Res<UserUpdateDataMutation>> {
    const { data } = await this.context.apolloClient.mutate({
      mutation: USER_UPDATE_DATA_MUTATION,
      variables,
    });
    return data!.userUpdateData;
  }

  public async closeSessions(
    variables: UserSessionsCloseMutationVariables,
  ): Promise<Res<UserSessionsCloseMutation>> {
    const { data } = await this.context.apolloClient.mutate({
      mutation: USER_SESSIONS_CLOSE_MUTATION,
      variables,
    });
    return data!.userSessionsClose;
  }
}
