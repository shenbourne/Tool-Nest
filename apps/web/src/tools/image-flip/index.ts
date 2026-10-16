import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.imageFlip.name', path: '/image-flip',
  description: 'tools.imageFlip.description', category: 'image',
  tags: ["media","file-upload"], keywords: ["image","flip","mirror","horizontal","vertical"],
  component: () => import('../image-editor/ImageEditor.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
