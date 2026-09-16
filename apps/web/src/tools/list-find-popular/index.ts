import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.listFindPopular.name', path: '/list-find-popular',
  description: 'tools.listFindPopular.description', category: 'data',
  tags: ["list","statistics"], keywords: ["list","popular","frequent","count"],
  component: () => import('./ListFindPopular.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
