import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.imageChangeOpacity.name', path: '/image-change-opacity',
  description: 'tools.imageChangeOpacity.description', category: 'image',
  tags: ["media","file-upload"], keywords: ["image","opacity","transparent","alpha"],
  component: () => import('../image-editor/ImageEditor.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
