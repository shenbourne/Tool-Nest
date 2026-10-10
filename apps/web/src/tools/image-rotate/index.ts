import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.imageRotate.name', path: '/image-rotate',
  description: 'tools.imageRotate.description', category: 'image',
  tags: ["media","file-upload"], keywords: ["image","rotate","angle","degrees"],
  component: () => import('./ImageRotate.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
