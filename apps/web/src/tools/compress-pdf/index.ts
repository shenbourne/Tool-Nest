import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.compressPdf.name', path: '/compress-pdf',
  description: 'tools.compressPdf.description', category: 'pdf',
  tags: ['media', 'file-upload', 'compressor'], keywords: ["pdf","compress","reduce","size"],
  component: () => import('./CompressPdf.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
