import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.listRotate.name', path: '/list-rotate',
  description: 'tools.listRotate.description', category: 'data',
  tags: ["list"], keywords: ["list","rotate","shift"],
  component: () => import('./ListRotate.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
