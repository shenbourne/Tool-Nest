import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.base64FileConverter.name',
  path: '/base64-file-converter',
  description: 'tools.base64FileConverter.description',
  category: 'converter',
  tags: ['converter', 'file-upload'],
  keywords: ['base64', 'file', 'convert', 'encode', 'decode', 'upload', 'download'],
  component: () => import('./Base64FileConverter.vue'),
  createdAt: '2026-09-18',
});
