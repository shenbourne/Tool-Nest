import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.ulidGenerator.name',
  path: '/ulid-generator',
  description: 'tools.ulidGenerator.description',
  category: 'encoding',
  tags: ['generator'],
  keywords: ['ulid', 'unique', 'identifier', 'sortable', 'id'],
  component: () => import('./UlidGenerator.vue'),
  createdAt: '2026-09-17',
  runtimeLocation: 'browser',
});
