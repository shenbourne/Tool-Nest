import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.convertToWebp.name', path: '/convert-to-webp',
  description: 'tools.convertToWebp.description', category: 'image',
  tags: ["media","file-upload"], keywords: ["image","convert","webp"],
  component: () => import('./ConvertToWebp.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
