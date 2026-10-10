import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.listShuffle.name', path: '/list-shuffle',
  description: 'tools.listShuffle.description', category: 'data',
  tags: ["list","random"], keywords: ["list","shuffle","random"],
  component: () => import('./ListShuffle.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
