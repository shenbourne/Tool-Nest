import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.imageRemoveBackground.name', path: '/image-remove-background',
  description: 'tools.imageRemoveBackground.description', category: 'image',
  tags: ['media', 'file-upload'], keywords: ['image', 'background', 'remove', 'transparent'],
  component: () => import('../image-editor/ImageEditor.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
