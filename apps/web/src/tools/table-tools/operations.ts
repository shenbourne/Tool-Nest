export const tableOperations = ['separator', 'transpose', 'insert', 'swap', 'check'] as const;
export type TableOperation = typeof tableOperations[number];
export const legacyTableTabs: Record<string, TableOperation> = {
  '/csv-change-separator':'separator', '/csv-rows-to-columns':'transpose', '/csv-transpose':'transpose',
  '/csv-insert-columns':'insert', '/csv-swap-columns':'swap', '/csv-find-incomplete':'check',
};
export function isTableOperation(value: unknown): value is TableOperation {
  return typeof value === 'string' && tableOperations.includes(value as TableOperation);
}
