// SDK import
import type { AutoDroidSdk } from '@package';

// Type import
import type { Res } from '@utils/response.type';

// GraphQL import
import type {
  UserProcessorQueryVariables,
  UserProcessorQuery,
  UserProcessorsQueryVariables,
  UserProcessorsQuery,
} from '@gql/graphql';

// Service import
import {
  USER_PROCESSOR_GET_ONE_QUERY,
  USER_PROCESSOR_GET_MANY_QUERY,
} from './queries';

export class Processor {
  constructor(private context: AutoDroidSdk) {}

  public async getOne(
    variables: UserProcessorQueryVariables,
  ): Promise<Res<UserProcessorQuery>> {
    const { data } = await this.context.apolloClient.query({
      query: USER_PROCESSOR_GET_ONE_QUERY,
      variables,
    });
    return data.userProcessor;
  }

  public async getMany(
    variables: UserProcessorsQueryVariables,
  ): Promise<Res<UserProcessorsQuery>> {
    const { data } = await this.context.apolloClient.query({
      query: USER_PROCESSOR_GET_MANY_QUERY,
      variables,
    });
    return data.userProcessors;
  }
}
