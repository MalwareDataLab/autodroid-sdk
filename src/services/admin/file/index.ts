// SDK import
import type { AutoDroidSdk } from '@package';

// Type import
import { Res } from '@utils/response.type';

// GraphQL import
import {
  AdminFileRemoveAllDanglingMutation,
  AdminFileRemoveAllDanglingMutationVariables,
} from '@gql/graphql';

// Service import
import { ADMIN_FILE_REMOVE_ALL_DANGLING_MUTATION } from './queries';

export class AdminFile {
  constructor(private context: AutoDroidSdk) {}

  public async removeAllDangling(
    variables: AdminFileRemoveAllDanglingMutationVariables,
  ): Promise<Res<AdminFileRemoveAllDanglingMutation>> {
    const { data } = await this.context.apolloClient.mutate({
      mutation: ADMIN_FILE_REMOVE_ALL_DANGLING_MUTATION,
      variables,
    });
    return data!.adminFileRemoveAllDangling;
  }
}
