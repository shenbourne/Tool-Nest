import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.listFindUnique.name', path: '/list-find-unique',
  description: 'tools.listFindUnique.description', category: 'data',
  tags: ["list"], keywords: ["list","unique","distinct","dedup"],
  component: () => import('./ListFindUnique.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
