import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.pdfSignatureChecker.name', path: '/pdf-signature-checker',
  description: 'tools.pdfSignatureChecker.description', category: 'pdf',
  tags: ["validator","file-upload"], keywords: ["pdf","signature","check","verify","certificate"],
  component: () => import('./PdfSignatureChecker.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
