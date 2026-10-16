import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.base64Encoder.name',
  path: '/base64-encoder',
  description: 'tools.base64Encoder.description',
  category: 'encoding',
  tags: ['encoder', 'converter', 'file-upload'],
  keywords: ['base64', 'encode', 'decode', 'convert', 'file', 'upload', 'download'],
  component: () => import('./Base64Tool.vue'),
  createdAt: '2026-09-17',
  redirectFrom: ['/base64-string-converter', '/base64-converter', '/base64-file-converter'],
});
