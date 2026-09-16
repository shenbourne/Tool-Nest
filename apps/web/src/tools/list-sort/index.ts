import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.listSort.name', path: '/list-sort',
  description: 'tools.listSort.description', category: 'data',
  tags: ["list"], keywords: ["list","sort","order","alphabetical"],
  component: () => import('./ListSort.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
