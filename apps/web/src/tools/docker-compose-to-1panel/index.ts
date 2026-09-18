import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.dockerComposeTo1panel.name',
  path: '/docker-compose-to-1panel',
  description: 'tools.dockerComposeTo1panel.description',
  category: 'developer',
  tags: ['developer', 'parser'],
  keywords: ['docker', 'compose', '1panel', 'yaml', 'convert', 'container'],
  component: () => import('./DockerComposeTo1panel.vue'),
  createdAt: '2026-09-18',
});
