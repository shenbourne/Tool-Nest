import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.cameraRecorder.name',
  path: '/camera-recorder',
  description: 'tools.cameraRecorder.description',
  category: 'video',
  tags: ['media', 'lazy-load'],
  keywords: ['camera', 'webcam', 'record', 'video', 'media', 'capture'],
  component: () => import('./CameraRecorder.vue'),
  createdAt: '2026-09-18',
});
