import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.csvFindIncomplete.name', path: '/csv-find-incomplete',
  description: 'tools.csvFindIncomplete.description', category: 'data',
  tags: ["csv","validator"], keywords: ["csv","validate","incomplete","check"],
  component: () => import('./CsvFindIncomplete.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
