import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.imageFormatConverter.name', path: '/image-format-converter',
  description: 'tools.imageFormatConverter.description', category: 'image',
  tags: ['media', 'file-upload', 'converter'],
  keywords: ['image', 'convert', 'png', 'jpg', 'jpeg', 'webp', '图片', '格式', '转换'],
  redirectFrom: ['/jpg-to-png', '/convert-to-jpg', '/convert-to-webp'],
  component: () => import('./ImageFormatConverter.vue'), createdAt: '2026-10-12', runtimeLocation: 'browser',
});
