import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.pdfToEpub.name', path: '/pdf-to-epub',
  description: 'tools.pdfToEpub.description', category: 'pdf',
  tags: ["converter","file-upload"], keywords: ["pdf","epub","convert","ebook"],
  component: () => import('./PdfToEpub.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
