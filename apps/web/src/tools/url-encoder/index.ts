import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.urlEncoder.name', path: '/url-encoder',
  description: 'tools.urlEncoder.description', category: 'web',
  tags: ['encoder', 'converter'], keywords: ['url', 'encode', 'decode', 'percent', 'uri'],
  component: () => import('./UrlEncoder.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
