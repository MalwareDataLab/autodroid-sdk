import type { AutoDroidSdk } from '@package';
import type { Res } from '@utils/response.type';

import type {
  UserProcessingQueryVariables,
  UserProcessingQuery,
  UserProcessesQueryVariables,
  UserProcessesQuery,
} from '@gql/graphql';

import {
  USER_PROCESSING_GET_ONE_QUERY,
  USER_PROCESSING_GET_MANY_QUERY,
} from './queries';

export class Processing {
  constructor(private context: AutoDroidSdk) {}

  public async getOne(
    variables: UserProcessingQueryVariables,
  ): Promise<Res<UserProcessingQuery>> {
    const { data } = await this.context.apolloClient.query({
      query: USER_PROCESSING_GET_ONE_QUERY,
      variables,
    });
    return data.userProcessing;
  }

  public async getMany(
    variables: UserProcessesQueryVariables,
  ): Promise<Res<UserProcessesQuery>> {
    const { data } = await this.context.apolloClient.query({
      query: USER_PROCESSING_GET_MANY_QUERY,
      variables,
    });
    return data.userProcesses;
  }
}
