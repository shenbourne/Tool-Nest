import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.helloWorld.name',
  path: '/hello-world',
  description: 'tools.helloWorld.description',
  category: 'developer',
  tags: ['productivity'],
  keywords: ['hello', 'world', 'test', 'demo'],
  component: () => import('./HelloWorld.vue'),
  createdAt: '2026-09-17',
});
