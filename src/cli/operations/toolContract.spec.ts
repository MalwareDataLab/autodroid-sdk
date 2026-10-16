import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Operation import
import { operations } from './catalog';

// Target import
import { buildToolContract } from './toolContract';

describe('Operations: tool contract', () => {
  it('should match the checked-in contract the API repository tests its remote tools against', () => {
    const checkedIn = JSON.parse(
      readFileSync(join(__dirname, 'toolContract.json'), 'utf8'),
    );

    expect(JSON.parse(JSON.stringify(buildToolContract()))).toEqual(checkedIn);
  });

  it('should list each tool once, with its access and effect', () => {
    const contract = buildToolContract();

    expect(new Set(contract.map(tool => tool.name)).size).toBe(contract.length);
    contract.forEach(tool => {
      expect(['user', 'admin']).toContain(tool.access);
      expect(['read', 'write', 'destructive']).toContain(tool.effect);
    });
  });

  it('should name the GraphQL root field each tool runs', () => {
    expect(buildToolContract().map(tool => [tool.name, tool.field])).toEqual(
      operations.map(operation => [operation.name, operation.field]),
    );
  });

  it("should promise each tool's description and declared output fields", () => {
    expect(
      buildToolContract().map(tool => [
        tool.name,
        tool.description,
        tool.output,
      ]),
    ).toEqual(
      operations.map(operation => [
        operation.name,
        operation.description,
        operation.output,
      ]),
    );
  });

  it("should promise a list's item fields, and no item fields for any other tool", () => {
    const contract = buildToolContract();

    expect(
      contract.filter(tool => 'itemOutput' in tool).map(tool => tool.name),
    ).toEqual(
      operations
        .filter(operation => operation.itemOutput)
        .map(operation => operation.name),
    );
    contract.forEach((tool, index) =>
      expect(tool.itemOutput).toEqual(operations[index].itemOutput),
    );
    expect(
      contract.find(tool => tool.name === 'list_datasets')?.itemOutput,
    ).toContain('user_id');
  });
});
