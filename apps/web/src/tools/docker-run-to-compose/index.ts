import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.dockerRunToCompose.name',
  path: '/docker-run-to-compose',
  description: 'tools.dockerRunToCompose.description',
  category: 'developer',
  tags: ['developer', 'parser', 'converter'],
  keywords: ['docker', 'compose', 'run', 'convert', 'yaml', 'container'],
  component: () => import('./DockerRunToCompose.vue'),
  createdAt: '2026-09-18',
});
