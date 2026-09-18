import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.screenshotShare.name', path: '/screenshot-share',
  description: 'tools.screenshotShare.description', category: 'platform',
  tags: ['productivity', 'clipboard'], keywords: ['screenshot', 'capture', 'share', 'image', 'clipboard'],
  component: () => import('./ScreenshotShare.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
