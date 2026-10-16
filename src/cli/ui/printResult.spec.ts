import { beforeEach, describe, expect, it, vi } from 'vitest';

// Target import
import { printResult } from './printResult';

describe('CLI: printResult', () => {
  let log: ReturnType<typeof vi.spyOn>;
  let table: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    table = vi.spyOn(console, 'table').mockImplementation(() => undefined);
  });

  it('should print raw JSON for any value when json is requested', () => {
    printResult([{ id: 'dataset-1' }], true);

    expect(log).toHaveBeenCalledWith(
      JSON.stringify([{ id: 'dataset-1' }], null, 2),
    );
    expect(table).not.toHaveBeenCalled();
  });

  it('should print a list as a table', () => {
    printResult([{ id: 'dataset-1' }], false);

    expect(table).toHaveBeenCalledWith([{ id: 'dataset-1' }]);
  });

  it('should say so when a list is empty', () => {
    printResult([], false);

    expect(log).toHaveBeenCalledWith('No results.');
    expect(table).not.toHaveBeenCalled();
  });

  it('should print a page of a list as a table of its items followed by how many of all matches it shows', () => {
    printResult(
      {
        items: [{ id: 'dataset-1' }, { id: 'dataset-2' }],
        total_count: 12,
        has_next_page: true,
      },
      false,
    );

    expect(table).toHaveBeenCalledWith([
      { id: 'dataset-1' },
      { id: 'dataset-2' },
    ]);
    expect(log.mock.calls).toEqual([['Showing 2 of 12.']]);
  });

  it('should say so when a page is empty and still tell how many match in all', () => {
    printResult({ items: [], total_count: 3, has_next_page: false }, false);

    expect(table).not.toHaveBeenCalled();
    expect(log.mock.calls).toEqual([['No results.'], ['Showing 0 of 3.']]);
  });

  it('should print a page as the raw object when json is requested', () => {
    const page = {
      items: [{ id: 'dataset-1' }],
      total_count: 1,
      has_next_page: false,
    };

    printResult(page, true);

    expect(log.mock.calls).toEqual([[JSON.stringify(page, null, 2)]]);
    expect(table).not.toHaveBeenCalled();
  });

  it('should print an object as one "key: value" line per field, serialising nested values', () => {
    printResult({ id: 'processing-1', dataset: { id: 'dataset-1' } }, false);

    expect(log).toHaveBeenNthCalledWith(1, 'id: processing-1');
    expect(log).toHaveBeenNthCalledWith(2, 'dataset: {"id":"dataset-1"}');
  });

  it.each([[null], ['text'], [3]])(
    'should print a non-object result (%s) as JSON instead of failing',
    value => {
      printResult(value, false);

      expect(log).toHaveBeenCalledWith(JSON.stringify(value, null, 2));
    },
  );
});
