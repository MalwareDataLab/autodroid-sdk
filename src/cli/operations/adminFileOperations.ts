// Operation import
import { defineOperation } from './defineOperation';

const adminFileOperations = [
  defineOperation({
    name: 'admin_remove_dangling_files',
    field: 'adminFileRemoveAllDangling',
    command: ['admin', 'file', 'remove-dangling'],
    description:
      'Permanently remove every stored file that no dataset or processing run uses. Requires admin access.',
    access: 'admin',
    effect: 'destructive',
    input: {},
    run: async sdk => ({
      removed: await sdk.admin.file.removeAllDangling({}),
    }),
    output: ['removed'],
  }),
];

export { adminFileOperations };
