import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.imageCreateTransparent.name', path: '/image-create-transparent',
  description: 'tools.imageCreateTransparent.description', category: 'image',
  tags: ['media', 'file-upload'], keywords: ['image', 'transparent', 'background', 'remove'],
  component: () => import('../image-editor/ImageEditor.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
