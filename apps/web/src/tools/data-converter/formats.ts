export const formats = ['json', 'yaml', 'toml', 'xml', 'csv', 'tsv'] as const;
export type DataFormat = typeof formats[number];
export const legacyPaths = ['/json-to-yaml','/yaml-to-json','/json-to-toml','/toml-to-json','/yaml-to-toml','/toml-to-yaml','/json-to-xml','/xml-to-json','/json-to-csv','/csv-to-json','/csv-to-yaml','/csv-to-xml','/csv-to-tsv','/tsv-to-json'];
export function legacyConversionQuery(path: string) {
  const [from, to] = path.slice(1).split('-to-');
  return { from, to };
}
export function isFormat(value: unknown): value is DataFormat {
  return typeof value === 'string' && formats.includes(value as DataFormat);
}

