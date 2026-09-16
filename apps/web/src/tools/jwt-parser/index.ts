import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.jwtParser.name', path: '/jwt-parser',
  description: 'tools.jwtParser.description', category: 'web',
  tags: ['parser', 'security'], keywords: ['jwt', 'json', 'web', 'token', 'decode', 'parse'],
  component: () => import('./JwtParser.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
