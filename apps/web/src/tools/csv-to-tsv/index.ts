import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.csvToTsv.name', path: '/csv-to-tsv',
  description: 'tools.csvToTsv.description', category: 'data',
  tags: ["csv","tsv","converter"], keywords: ["csv","tsv","tab","convert"],
  component: () => import('./CsvToTsv.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
