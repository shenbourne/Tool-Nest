import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.convertToJpg.name', path: '/convert-to-jpg',
  description: 'tools.convertToJpg.description', category: 'image',
  tags: ["media","file-upload"], keywords: ["image","convert","jpg","jpeg"],
  component: () => import('./ConvertToJpg.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
