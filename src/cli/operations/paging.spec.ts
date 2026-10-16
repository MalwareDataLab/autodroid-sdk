import { describe, expect, it } from 'vitest';
import { z } from 'zod';

// GraphQL import
import { SORT_ORDER } from '@gql/graphql';

// Target import
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  pageInput,
  pageOf,
  pageOfAll,
  projectListPage,
  toPage,
} from './paging';

describe('Operations: paging', () => {
  it('should default to the first page of the default size', () => {
    expect(toPage({})).toEqual({ skip: 0, take: DEFAULT_PAGE_SIZE });
  });

  it('should honour a requested page size', () => {
    expect(toPage({ take: 25 })).toEqual({ skip: 0, take: 25 });
  });

  it('should honour a requested offset, so records beyond the first page can be reached', () => {
    expect(toPage({ take: 25, skip: 50 })).toEqual({ skip: 50, take: 25 });
  });

  it('should pass a requested sorting through', () => {
    const sorting = [{ field: 'created_at' as const, order: SORT_ORDER.ASC }];

    expect(toPage({ sorting })).toEqual({
      skip: 0,
      take: DEFAULT_PAGE_SIZE,
      sorting,
    });
  });

  it('should turn a connection into one page: its nodes, the total count and whether more follow', () => {
    expect(
      pageOf({
        edges: [{ node: 'a' }, { node: 'b' }],
        totalCount: 5,
        pageInfo: { hasNextPage: true },
      }),
    ).toEqual({ items: ['a', 'b'], total_count: 5, has_next_page: true });
  });

  it('should put every item of a complete list on one page, with nothing after it', () => {
    expect(pageOfAll(['a', 'b'])).toEqual({
      items: ['a', 'b'],
      total_count: 2,
      has_next_page: false,
    });
  });

  it('should make an empty page of an empty list', () => {
    expect(pageOfAll([])).toEqual({
      items: [],
      total_count: 0,
      has_next_page: false,
    });
  });

  it('should project each item of a page and keep its counts', () => {
    expect(
      projectListPage(
        { items: ['a', 'b'], total_count: 2, has_next_page: false },
        item => item.toUpperCase(),
      ),
    ).toEqual({ items: ['A', 'B'], total_count: 2, has_next_page: false });
  });

  describe('page size input', () => {
    const schema = z.object(pageInput);

    it('should accept no value, a value within range, and exactly the cap', () => {
      expect(() => schema.parse({})).not.toThrow();
      expect(() => schema.parse({ take: 1 })).not.toThrow();
      expect(() => schema.parse({ take: MAX_PAGE_SIZE })).not.toThrow();
    });

    it('should accept an offset of zero or more and reject a negative or fractional one', () => {
      expect(() => schema.parse({ skip: 0 })).not.toThrow();
      expect(() => schema.parse({ skip: 200 })).not.toThrow();
      expect(() => schema.parse({ skip: -1 })).toThrow();
      expect(() => schema.parse({ skip: 1.5 })).toThrow();
    });

    it('should accept an offset up to the largest GraphQL Int and reject one past it', () => {
      expect(() => schema.parse({ skip: 2147483647 })).not.toThrow();
      expect(() => schema.parse({ skip: 2147483648 })).toThrow();
    });

    it.each([0, -1, MAX_PAGE_SIZE + 1, 1.5])(
      'should reject %s',
      invalidTake => {
        expect(() => schema.parse({ take: invalidTake })).toThrow();
      },
    );
  });

  describe('sorting input', () => {
    const schema = z.object(pageInput);

    it('should accept each sortable field in either order, up to the cap', () => {
      expect(() =>
        schema.parse({
          sorting: [
            { field: 'created_at', order: 'ASC' },
            { field: 'updated_at', order: 'DESC' },
            { field: 'id', order: 'ASC' },
          ],
        }),
      ).not.toThrow();
    });

    it.each([
      ['no entry', []],
      ['a field that cannot be sorted by', [{ field: 'name', order: 'ASC' }]],
      ['a lowercase order', [{ field: 'id', order: 'asc' }]],
      ['an entry without order', [{ field: 'id' }]],
      [
        'more entries than the cap',
        [
          { field: 'created_at', order: 'ASC' },
          { field: 'updated_at', order: 'ASC' },
          { field: 'id', order: 'ASC' },
          { field: 'id', order: 'DESC' },
        ],
      ],
    ])('should reject %s', (_case, sorting) => {
      expect(() => schema.parse({ sorting })).toThrow();
    });
  });
});
