import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.pdfMerge.name', path: '/pdf-merge',
  description: 'tools.pdfMerge.description', category: 'pdf',
  tags: ["media","file-upload"], keywords: ["pdf","merge","combine","join"],
  component: () => import('./PdfMerge.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
