import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.basicAuthGenerator.name',
  path: '/basic-auth-generator',
  description: 'tools.basicAuthGenerator.description',
  category: 'web',
  tags: ['encoder', 'security', 'generator'],
  keywords: ['basic', 'auth', 'authorization', 'header', 'base64', 'authentication', 'username', 'password'],
  component: () => import('./BasicAuthGenerator.vue'),
  createdAt: '2026-09-18',
});
