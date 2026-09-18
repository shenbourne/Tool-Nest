import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.randomPortGenerator.name',
  path: '/random-port-generator',
  description: 'tools.randomPortGenerator.description',
  category: 'developer',
  tags: ['random', 'developer'],
  keywords: ['port', 'random', 'generator', 'network', 'number'],
  component: () => import('./RandomPortGenerator.vue'),
  createdAt: '2026-09-18',
});
