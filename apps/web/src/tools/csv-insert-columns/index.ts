import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.csvInsertColumns.name', path: '/csv-insert-columns',
  description: 'tools.csvInsertColumns.description', category: 'data',
  tags: ["csv"], keywords: ["csv","insert","column","add"],
  component: () => import('./CsvInsertColumns.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
