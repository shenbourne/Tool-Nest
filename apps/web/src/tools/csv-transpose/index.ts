import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.csvTranspose.name', path: '/csv-transpose',
  description: 'tools.csvTranspose.description', category: 'data',
  tags: ["csv","converter"], keywords: ["csv","transpose","flip"],
  component: () => import('./CsvTranspose.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
