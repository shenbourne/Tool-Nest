import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.convertToPdf.name', path: '/convert-to-pdf',
  description: 'tools.convertToPdf.description', category: 'pdf',
  tags: ["media","file-upload"], keywords: ["pdf","convert","image","to pdf"],
  component: () => import('./ConvertToPdf.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
