import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.audioChangeSpeed.name',
  path: '/audio-change-speed',
  description: 'tools.audioChangeSpeed.description',
  category: 'audio',
  tags: ['media', 'converter', 'file-upload', 'lazy-load'],
  keywords: ['audio', 'speed', 'tempo', 'slow', 'fast'],
  component: () => import('./AudioChangeSpeed.vue'),
  createdAt: '2026-09-18',
});
