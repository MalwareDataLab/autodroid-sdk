import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildSchema, printSchema } from 'graphql';

const SDK_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SDK_SCHEMA_PATH = path.join(SDK_ROOT, 'src/api/gql/schema.graphql');
const BACKEND_SCHEMA_PATH =
  process.env.BACKEND_SCHEMA_PATH ||
  path.join(
    SDK_ROOT,
    '../autodroid-api-gateway/packages/api/src/shared/infrastructure/graphql/generated/schema.gql',
  );

const BACKEND_ONLY_DIRECTIVES = ['auth', 'constraint'];

const isIdentifierChar = char => /[A-Za-z0-9_]/.test(char ?? '');

const stripDirectiveUsages = sdl => {
  let result = '';
  let i = 0;
  let inString = false;

  while (i < sdl.length) {
    const char = sdl[i];
    if (char === '"' && sdl[i - 1] !== '\\') inString = !inString;

    const directiveName = inString
      ? undefined
      : BACKEND_ONLY_DIRECTIVES.find(
          name =>
            sdl.startsWith(`@${name}`, i) &&
            !isIdentifierChar(sdl[i + 1 + name.length]),
        );

    if (!directiveName) {
      result += char;
      i += 1;
      continue;
    }

    i += 1 + directiveName.length;
    if (sdl[i] !== '(') continue;

    let depth = 0;
    while (i < sdl.length) {
      const argChar = sdl[i];
      if (argChar === '"' && sdl[i - 1] !== '\\') inString = !inString;
      if (!inString && argChar === '(') depth += 1;
      if (!inString && argChar === ')') {
        depth -= 1;
        i += 1;
        if (depth === 0) break;
        continue;
      }
      i += 1;
    }
  }
  return result;
};

const normalize = filePath =>
  printSchema(
    buildSchema(stripDirectiveUsages(readFileSync(filePath, 'utf8'))),
  );

if (!existsSync(BACKEND_SCHEMA_PATH)) {
  const message = `Backend schema not found at ${BACKEND_SCHEMA_PATH} (sibling autodroid-api-gateway checkout not present).`;
  if (process.env.CI) {
    console.error(
      `${message}\nThis check cannot run in CI without it — add a checkout step for autodroid-api-gateway alongside this repo, or remove "lint:schema" from CI if that's not intended.`,
    );
    process.exit(1);
  }
  console.log(`Skipping schema freshness check — ${message}`);
  process.exit(0);
}

const backendSdl = normalize(BACKEND_SCHEMA_PATH);

const sdkSdl = normalize(SDK_SCHEMA_PATH);

if (sdkSdl !== backendSdl) {
  console.error(
    "SDK's checked-in schema.graphql has drifted from the backend's live schema.\n" +
      `Run \`BACKEND_GRAPHQL_ENDPOINT=<live-endpoint> yarn codegen\` to refresh it, then commit the result.\n` +
      `SDK schema:     ${SDK_SCHEMA_PATH}\n` +
      `Backend schema: ${BACKEND_SCHEMA_PATH}`,
  );
  process.exit(1);
}

console.log('SDK schema matches the backend schema.');

const SDK_CONTRACT_PATH = path.join(
  SDK_ROOT,
  'src/cli/operations/toolContract.json',
);
const BACKEND_CONTRACT_PATH = path.join(
  path.dirname(path.dirname(BACKEND_SCHEMA_PATH)),
  '../../../../test/fixtures/mcpToolContract.json',
);

const RELEASE_ORDER =
  'Release order: 1) regenerate the SDK contract (`npm run contract`); ' +
  "2) copy it over the backend's test/fixtures/mcpToolContract.json and merge " +
  'that backend change; 3) then merge and release the SDK.';

if (!existsSync(BACKEND_CONTRACT_PATH)) {
  const message = `MCP tool contract check skipped: not found at ${BACKEND_CONTRACT_PATH}.\n${RELEASE_ORDER}`;
  if (process.env.CI) {
    console.error(message);
    process.exit(1);
  }
  console.log(message);
  process.exit(0);
}

if (
  readFileSync(SDK_CONTRACT_PATH, 'utf8') !==
  readFileSync(BACKEND_CONTRACT_PATH, 'utf8')
) {
  console.error(
    "The backend's copy of the MCP tool contract differs from the SDK's.\n" +
      `Copy ${SDK_CONTRACT_PATH} over ${BACKEND_CONTRACT_PATH}.\n` +
      RELEASE_ORDER,
  );
  process.exit(1);
}

console.log("MCP tool contract matches the backend's copy.");
