export const byteUnits = [
  { id: 'Bytes', factor: 1 },
  { id: 'KB', factor: 1024 },
  { id: 'MB', factor: 1024 ** 2 },
  { id: 'GB', factor: 1024 ** 3 },
  { id: 'TB', factor: 1024 ** 4 },
  { id: 'PB', factor: 1024 ** 5 },
  { id: 'Bits', factor: 1 / 8 },
] as const;

export type ByteUnit = typeof byteUnits[number]['id'];

export function convertByteUnit(value: number | null, from: ByteUnit, to: ByteUnit): number | null {
  if (value === null) return null;
  const source = byteUnits.find(unit => unit.id === from)!;
  const target = byteUnits.find(unit => unit.id === to)!;
  return value * (source.factor / target.factor);
}
