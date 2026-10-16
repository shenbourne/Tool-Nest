import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.imageChangeColors.name', path: '/image-change-colors',
  description: 'tools.imageChangeColors.description', category: 'image',
  tags: ['media', 'file-upload'], keywords: ['image', 'color', 'hue', 'saturation', 'brightness', 'filter'],
  component: () => import('../image-editor/ImageEditor.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
