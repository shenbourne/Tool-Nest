import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.imageCrop.name', path: '/image-crop',
  description: 'tools.imageCrop.description', category: 'image',
  tags: ['media', 'file-upload', 'lazy-load'], keywords: ['image', 'crop', 'resize', 'cut'],
  component: () => import('./ImageCrop.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
