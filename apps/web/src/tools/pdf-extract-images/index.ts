import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.pdfExtractImages.name', path: '/pdf-extract-images',
  description: 'tools.pdfExtractImages.description', category: 'pdf',
  tags: ["extract","file-upload"], keywords: ["pdf","extract","images","pictures","photos"],
  component: () => import('./PdfExtractImages.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
