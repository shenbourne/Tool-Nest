import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.imageCompress.name', path: '/image-compress',
  description: 'tools.imageCompress.description', category: 'image',
  tags: ['media', 'file-upload', 'compressor'], keywords: ["image","compress","optimize","reduce"],
  component: () => import('./ImageCompress.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
