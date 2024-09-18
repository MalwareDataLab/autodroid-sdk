import dotenv from 'dotenv';
import { CodegenConfig } from '@graphql-codegen/cli';

dotenv.config();

const config: CodegenConfig = {
  schema:
    process.env.BACKEND_GRAPHQL_ENDPOINT || 'http://localhost:3333/graphql',
  documents: ['./src/**/*.{ts,tsx,js,jsx}'],
  generates: {
    './src/api/gql/schema.graphql': {
      plugins: ['schema-ast'],
    },
    './src/api/gql/schema.graphql.json': {
      plugins: ['introspection'],
      config: {
        minify: true,
      },
    },
    './src/api/gql/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
        fragmentMasking: false,
      },
      config: {
        namingConvention: 'keep',
        scalars: {
          BigInt: 'bigint',
        },
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
