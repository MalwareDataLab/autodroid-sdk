import { DocumentNode } from 'graphql';

declare module '*.gql' {
  const Schema: DocumentNode;
  export = Schema;
}
