import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.csvToXml.name', path: '/csv-to-xml',
  description: 'tools.csvToXml.description', category: 'data',
  tags: ["csv","xml","converter"], keywords: ["csv","xml","convert"],
  component: () => import('./CsvToXml.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
