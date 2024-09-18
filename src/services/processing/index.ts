import type { AutoDroidSdk } from '@package';
import type { Res } from '@utils/response.type';

import type {
  UserProcessingQueryVariables,
  UserProcessingQuery,
  UserProcessesQueryVariables,
  UserProcessesQuery,
  UserProcessingDeleteMutation,
  UserProcessingDeleteMutationVariables,
  UserRequestDatasetProcessingMutationVariables,
  UserRequestDatasetProcessingMutation,
  UserProcessingUpdateVisibilityMutation,
  UserProcessingUpdateVisibilityMutationVariables,
  UserProcessingExtendKeepUntilMutation,
  UserProcessingExtendKeepUntilMutationVariables,
} from '@gql/graphql';

import {
  USER_PROCESSING_GET_ONE_QUERY,
  USER_PROCESSING_GET_MANY_QUERY,
  USER_PROCESSING_DELETE_MUTATION,
  USER_PROCESSING_REQUEST_DATASET_PROCESSING_MUTATION,
  USER_PROCESSING_UPDATE_VISIBILITY_MUTATION,
  USER_PROCESSING_EXTEND_KEEP_UNTIL_MUTATION,
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

  public async requestDatasetProcessing(
    variables: UserRequestDatasetProcessingMutationVariables,
  ): Promise<Res<UserRequestDatasetProcessingMutation>> {
    const { data } = await this.context.apolloClient.mutate({
      mutation: USER_PROCESSING_REQUEST_DATASET_PROCESSING_MUTATION,
      variables,
    });
    return data!.userRequestDatasetProcessing;
  }

  public async updateVisibility(
    variables: UserProcessingUpdateVisibilityMutationVariables,
  ): Promise<Res<UserProcessingUpdateVisibilityMutation>> {
    const { data } = await this.context.apolloClient.mutate({
      mutation: USER_PROCESSING_UPDATE_VISIBILITY_MUTATION,
      variables,
    });
    return data!.userProcessingUpdateVisibility;
  }

  public async extendKeepUntil(
    variables: UserProcessingExtendKeepUntilMutationVariables,
  ): Promise<Res<UserProcessingExtendKeepUntilMutation>> {
    const { data } = await this.context.apolloClient.mutate({
      mutation: USER_PROCESSING_EXTEND_KEEP_UNTIL_MUTATION,
      variables,
    });
    return data!.userProcessingExtendKeepUntil;
  }

  public async delete(
    variables: UserProcessingDeleteMutationVariables,
  ): Promise<Res<UserProcessingDeleteMutation>> {
    const { data } = await this.context.apolloClient.mutate({
      mutation: USER_PROCESSING_DELETE_MUTATION,
      variables,
    });
    return data!.userProcessingDelete;
  }
}