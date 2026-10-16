import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.imageResize.name', path: '/image-resize',
  description: 'tools.imageResize.description', category: 'image',
  tags: ["media","file-upload"], keywords: ["image","resize","scale","dimensions"],
  component: () => import('../image-editor/ImageEditor.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
