import { writeFileSync } from 'node:fs';
import path from 'node:path';

// Operation import
import { buildToolContract } from '../src/cli/operations/toolContract';

const CONTRACT_PATH = path.join(
  process.cwd(),
  'src/cli/operations/toolContract.json',
);

writeFileSync(
  CONTRACT_PATH,
  `${JSON.stringify(buildToolContract(), null, 2)}\n`,
);
