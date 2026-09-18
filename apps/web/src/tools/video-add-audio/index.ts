import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.videoAddAudio.name',
  path: '/video-add-audio',
  description: 'tools.videoAddAudio.description',
  category: 'video',
  tags: ['media', 'file-upload', 'lazy-load'],
  keywords: ['video', 'audio', 'add', 'replace', 'soundtrack'],
  component: () => import('./VideoAddAudio.vue'),
  createdAt: '2026-09-18',
});
