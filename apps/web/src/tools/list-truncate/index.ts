import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.listTruncate.name', path: '/list-truncate',
  description: 'tools.listTruncate.description', category: 'data',
  tags: ["list"], keywords: ["list","truncate","limit","cut"],
  component: () => import('./ListTruncate.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
