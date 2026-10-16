// Operation import
import type { IListPage } from '../operations/paging';

const isListPage = (value: object): value is IListPage<unknown> =>
  Array.isArray((value as Partial<IListPage<unknown>>).items) &&
  typeof (value as Partial<IListPage<unknown>>).total_count === 'number';

const printTable = (rows: unknown[]): void => {
  if (!rows.length) {
    console.log('No results.');
    return;
  }
  console.table(rows);
};

const printResult = (value: unknown, json: boolean): void => {
  if (json || value === null || typeof value !== 'object') {
    console.log(JSON.stringify(value, null, 2));
    return;
  }

  if (Array.isArray(value)) {
    printTable(value);
    return;
  }

  if (isListPage(value)) {
    printTable(value.items);
    console.log(`Showing ${value.items.length} of ${value.total_count}.`);
    return;
  }

  Object.entries(value).forEach(([key, entry]) => {
    const display =
      entry && typeof entry === 'object' ? JSON.stringify(entry) : entry;
    console.log(`${key}: ${display}`);
  });
};

export { printResult };
