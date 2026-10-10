import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.listDuplicate.name', path: '/list-duplicate',
  description: 'tools.listDuplicate.description', category: 'data',
  tags: ["list"], keywords: ["list","duplicate","repeat"],
  component: () => import('./ListDuplicate.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
