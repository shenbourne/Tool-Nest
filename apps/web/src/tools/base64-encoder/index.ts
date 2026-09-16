import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.base64Encoder.name',
  path: '/base64-encoder',
  description: 'tools.base64Encoder.description',
  category: 'converter',
  tags: ['encoder', 'converter'],
  keywords: ['base64', 'encode', 'decode', 'convert'],
  aliases: ['base64'],
  component: () => import('./Base64Encoder.vue'),
  createdAt: '2026-09-17',
  redirectFrom: ['/base64-string-converter', '/base64-converter'],
});
