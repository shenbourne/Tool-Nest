import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.pdfRotate.name', path: '/pdf-rotate',
  description: 'tools.pdfRotate.description', category: 'pdf',
  tags: ["media","file-upload"], keywords: ["pdf","rotate","pages"],
  component: () => import('./PdfRotate.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
