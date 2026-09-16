import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.csvChangeSeparator.name', path: '/csv-change-separator',
  description: 'tools.csvChangeSeparator.description', category: 'data',
  tags: ["csv","converter"], keywords: ["csv","separator","delimiter","change"],
  component: () => import('./CsvChangeSeparator.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
