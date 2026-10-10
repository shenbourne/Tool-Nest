import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.csvSwapColumns.name', path: '/csv-swap-columns',
  description: 'tools.csvSwapColumns.description', category: 'data',
  tags: ["csv"], keywords: ["csv","swap","columns","reorder"],
  component: () => import('./CsvSwapColumns.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
