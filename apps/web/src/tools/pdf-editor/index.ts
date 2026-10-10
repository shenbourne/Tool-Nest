import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.pdfEditor.name', path: '/pdf-editor',
  description: 'tools.pdfEditor.description', category: 'pdf',
  tags: ["media","file-upload"], keywords: ["pdf","edit","add text","annotate","watermark"],
  component: () => import('./PdfEditor.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
