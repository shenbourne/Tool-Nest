import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.pdfSplit.name', path: '/pdf-split',
  description: 'tools.pdfSplit.description', category: 'pdf',
  tags: ["media","file-upload"], keywords: ["pdf","split","extract","pages"],
  component: () => import('./PdfSplit.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
