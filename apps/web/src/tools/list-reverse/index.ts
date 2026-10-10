import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.listReverse.name', path: '/list-reverse',
  description: 'tools.listReverse.description', category: 'data',
  tags: ["list"], keywords: ["list","reverse","flip"],
  component: () => import('./ListReverse.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
