import { GRAPHQL_MAX_INT } from 'graphql';
import { z } from 'zod';

// GraphQL import
import { SORT_ORDER } from '@gql/graphql';

const DEFAULT_PAGE_SIZE = 10;

const MAX_PAGE_SIZE = 100;

const SORTING_FIELDS = ['created_at', 'updated_at', 'id'] as const;
const MAX_SORTING_FIELDS = 3;

const pageInput = {
  take: z
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_SIZE)
    .optional()
    .describe(`How many items to return (default ${DEFAULT_PAGE_SIZE}).`),
  skip: z
    .number()
    .int()
    .nonnegative()
    .max(GRAPHQL_MAX_INT)
    .optional()
    .describe('How many items to skip, to read past the first page.'),
  sorting: z
    .array(
      z.strictObject({
        field: z.enum(SORTING_FIELDS).describe('The field to sort by.'),
        order: z.enum(SORT_ORDER).describe('The sort direction.'),
      }),
    )
    .min(1)
    .max(MAX_SORTING_FIELDS)
    .optional()
    .describe(
      'How to sort, the first entry first; newest first when omitted. E.g. [{"field":"created_at","order":"ASC"}].',
    ),
};

type IPageInput = z.infer<z.ZodObject<typeof pageInput>>;

const toPage = (input: IPageInput) => ({
  skip: input.skip ?? 0,
  take: input.take ?? DEFAULT_PAGE_SIZE,
  sorting: input.sorting,
});

interface IListPage<Item> {
  items: Item[];
  total_count: number;
  has_next_page: boolean;
}

const LIST_PAGE_OUTPUT = ['items', 'total_count', 'has_next_page'];

const LIST_PAGE_DESCRIPTION =
  'Returns one page: items, total_count (how many match in all) and has_next_page.';

const pageOf = <Node>(connection: {
  edges: { node: Node }[];
  totalCount: number;
  pageInfo: { hasNextPage: boolean };
}): IListPage<Node> => ({
  items: connection.edges.map(edge => edge.node),
  total_count: connection.totalCount,
  has_next_page: connection.pageInfo.hasNextPage,
});

const pageOfAll = <Item>(items: Item[]): IListPage<Item> => ({
  items,
  total_count: items.length,
  has_next_page: false,
});

const projectListPage = <Item, Projected>(
  page: IListPage<Item>,
  projectItem: (item: Item) => Projected,
): IListPage<Projected> => ({
  ...page,
  items: page.items.map(item => projectItem(item)),
});

export type { IListPage };
export {
  DEFAULT_PAGE_SIZE,
  LIST_PAGE_DESCRIPTION,
  LIST_PAGE_OUTPUT,
  MAX_PAGE_SIZE,
  pageInput,
  pageOf,
  pageOfAll,
  projectListPage,
  toPage,
};
