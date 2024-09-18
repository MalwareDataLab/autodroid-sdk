import type { AutoDroidSdk } from '@package';
import type { Res } from '@utils/response.type';

import type {
  UserDatasetQueryVariables,
  UserDatasetQuery,
  UserDatasetsQueryVariables,
  UserDatasetsQuery,
  UserDatasetCreateMutationVariables,
  UserDatasetCreateMutation,
  UserDatasetUpdateMutation,
  UserDatasetUpdateMutationVariables,
  UserDatasetDeleteMutation,
  UserDatasetDeleteMutationVariables,
  UserDatasetRequestPublicationMutationVariables,
  UserDatasetRequestPublicationMutation,
} from '@gql/graphql';

import {
  USER_DATASET_GET_ONE_QUERY,
  USER_DATASET_GET_MANY_QUERY,
  USER_DATASET_CREATE_MUTATION,
  USER_DATASET_UPDATE_MUTATION,
  USER_DATASET_DELETE_MUTATION,
  USER_DATASET_REQUEST_PUBLICATION_MUTATION,
} from './queries';

export class Dataset {
  constructor(private context: AutoDroidSdk) {}

  public async getOne(
    variables: UserDatasetQueryVariables,
  ): Promise<Res<UserDatasetQuery>> {
    const { data } = await this.context.apolloClient.query({
      query: USER_DATASET_GET_ONE_QUERY,
      variables,
    });
    return data.userDataset;
  }

  public async getMany(
    variables: UserDatasetsQueryVariables,
  ): Promise<Res<UserDatasetsQuery>> {
    const { data } = await this.context.apolloClient.query({
      query: USER_DATASET_GET_MANY_QUERY,
      variables,
    });
    return data.userDatasets;
  }

  public async create(
    variables: UserDatasetCreateMutationVariables,
  ): Promise<Res<UserDatasetCreateMutation>> {
    const { data } = await this.context.apolloClient.mutate({
      mutation: USER_DATASET_CREATE_MUTATION,
      variables,
    });
    return data!.userDatasetCreate;
  }

  public async update(
    variables: UserDatasetUpdateMutationVariables,
  ): Promise<Res<UserDatasetUpdateMutation>> {
    const { data } = await this.context.apolloClient.mutate({
      mutation: USER_DATASET_UPDATE_MUTATION,
      variables,
    });
    return data!.userDatasetUpdate;
  }

  public async requestPublication(
    variables: UserDatasetRequestPublicationMutationVariables,
  ): Promise<Res<UserDatasetRequestPublicationMutation>> {
    const { data } = await this.context.apolloClient.mutate({
      mutation: USER_DATASET_REQUEST_PUBLICATION_MUTATION,
      variables,
    });
    return data!.userDatasetRequestPublication;
  }

  public async delete(
    variables: UserDatasetDeleteMutationVariables,
  ): Promise<Res<UserDatasetDeleteMutation>> {
    const { data } = await this.context.apolloClient.mutate({
      mutation: USER_DATASET_DELETE_MUTATION,
      variables,
    });
    return data!.userDatasetDelete;
  }
}
