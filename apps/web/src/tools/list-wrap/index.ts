import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.listWrap.name', path: '/list-wrap',
  description: 'tools.listWrap.description', category: 'data',
  tags: ["list"], keywords: ["list","wrap","prefix","suffix"],
  component: () => import('./ListWrap.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
