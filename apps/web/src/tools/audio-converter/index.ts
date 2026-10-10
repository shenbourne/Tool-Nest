import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.audioConverter.name',
  path: '/audio-converter',
  description: 'tools.audioConverter.description',
  category: 'audio',
  tags: ['media', 'converter', 'file-upload', 'lazy-load'],
  keywords: ['audio', 'convert', 'mp3', 'wav', 'ogg', 'flac'],
  component: () => import('./AudioConverter.vue'),
  createdAt: '2026-09-18',
});
