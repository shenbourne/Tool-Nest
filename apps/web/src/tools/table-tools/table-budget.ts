export const MAX_TABLE_CELLS = 20_000;
export function assertTableSize(rowCount: number, width: number): void {
  if (!Number.isSafeInteger(rowCount) || !Number.isSafeInteger(width) || rowCount < 0 || width < 0
    || rowCount > MAX_TABLE_CELLS || width > MAX_TABLE_CELLS || rowCount * width > MAX_TABLE_CELLS) {
    throw new Error('tableTooLarge');
  }
}
export function assertTableRows(rows: string[][]): void {
  assertTableSize(rows.length, rows.reduce((max, row) => Math.max(max, row.length), 0));
}
