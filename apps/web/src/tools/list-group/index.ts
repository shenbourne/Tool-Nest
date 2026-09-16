import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.listGroup.name', path: '/list-group',
  description: 'tools.listGroup.description', category: 'data',
  tags: ["list"], keywords: ["list","group","chunk","batch"],
  component: () => import('./ListGroup.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
