import type { AutoDroidSdk } from '@package';
import type { Res } from '@utils/response.type';

import type {
  UserDatasetQueryVariables,
  UserDatasetQuery,
  UserDatasetsQueryVariables,
  UserDatasetsQuery,
} from '@gql/graphql';

import {
  USER_DATASET_GET_ONE_QUERY,
  USER_DATASET_GET_MANY_QUERY,
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
}
