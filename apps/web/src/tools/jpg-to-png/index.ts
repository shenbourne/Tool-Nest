import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.jpgToPng.name', path: '/jpg-to-png',
  description: 'tools.jpgToPng.description', category: 'image',
  tags: ['media', 'file-upload'], keywords: ['jpg', 'png', 'convert', 'image', 'format'],
  component: () => import('./JpgToPng.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
