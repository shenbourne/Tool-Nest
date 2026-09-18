import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.pdfToPng.name', path: '/pdf-to-png',
  description: 'tools.pdfToPng.description', category: 'pdf',
  tags: ["converter","file-upload"], keywords: ["pdf","png","convert","image","render"],
  component: () => import('./PdfToPng.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
