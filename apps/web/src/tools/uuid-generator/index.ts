import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.uuidGenerator.name',
  path: '/uuid-generator',
  description: 'tools.uuidGenerator.description',
  category: 'encoding',
  tags: ['generator', 'security'],
  keywords: ['uuid', 'guid', 'unique', 'identifier', 'v4'],
  component: () => import('./UuidGenerator.vue'),
  createdAt: '2026-09-17',
  runtimeLocation: 'browser',
});
