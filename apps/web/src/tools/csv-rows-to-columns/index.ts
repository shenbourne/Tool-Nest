import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.csvRowsToColumns.name', path: '/csv-rows-to-columns',
  description: 'tools.csvRowsToColumns.description', category: 'data',
  tags: ["csv","converter"], keywords: ["csv","transpose","rows","columns"],
  component: () => import('./CsvRowsToColumns.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
