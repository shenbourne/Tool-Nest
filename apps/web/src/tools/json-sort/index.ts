import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.jsonSort.name', path: '/json-sort',
  description: 'tools.jsonSort.description', category: 'data',
  tags: ["json","developer"], keywords: ["json","sort","keys","order"],
  component: () => import('./JsonSort.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
