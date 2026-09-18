import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.imageToTextOcr.name',
  path: '/image-to-text-ocr',
  description: 'tools.imageToTextOcr.description',
  category: 'image',
  tags: ['media', 'file-upload'],
  keywords: ['ocr', 'image', 'text', 'extract', 'recognize'],
  component: () => import('./ImageToTextOcr.vue'),
  createdAt: '2026-09-18',
});
