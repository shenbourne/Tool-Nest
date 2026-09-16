import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.imageWatermark.name', path: '/image-watermark',
  description: 'tools.imageWatermark.description', category: 'image',
  tags: ["media","file-upload"], keywords: ["image","watermark","text","overlay"],
  component: () => import('./ImageWatermark.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
