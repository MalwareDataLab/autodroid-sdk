import { ApolloClient } from '@apollo/client';

import { IAutoDroidSdkParams, createApolloClient } from '@api/apolloClient';

import { User } from '@services/user';
import { Dataset } from '@services/dataset';
import { Processor } from '@services/processor';
import { Processing } from '@services/processing';

class AutoDroidSdk {
  public readonly apolloClient: ApolloClient<unknown>;

  public readonly user: User;
  public readonly dataset: Dataset;
  public readonly processor: Processor;
  public readonly processing: Processing;

  constructor(params: IAutoDroidSdkParams) {
    this.apolloClient = createApolloClient(params);

    this.user = new User(this);
    this.dataset = new Dataset(this);
    this.processor = new Processor(this);
    this.processing = new Processing(this);
  }
}

export * from '@gql';
export * from '@gql/graphql';

export { AutoDroidSdkResponseType } from '@utils/response.type';
export { AutoDroidSdk };
