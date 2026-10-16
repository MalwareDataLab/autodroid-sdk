// Util import
import { describePassthrough } from '../../../../test/support/passthrough';

// Service import
import { ADMIN_FILE_REMOVE_ALL_DANGLING_MUTATION } from '@services/admin/file/queries';

// Target import
import { AdminFile } from '@services/admin/file';

describePassthrough('AdminFile service', context => new AdminFile(context), [
  {
    method: 'removeAllDangling',
    kind: 'mutate',
    document: ADMIN_FILE_REMOVE_ALL_DANGLING_MUTATION,
    rootField: 'adminFileRemoveAllDangling',
    noVariables: true,
  },
]);
