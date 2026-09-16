import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.csvToJson.name', path: '/csv-to-json',
  description: 'tools.csvToJson.description', category: 'data',
  tags: ["csv","json","converter"], keywords: ["csv","json","convert"],
  component: () => import('./CsvToJson.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
