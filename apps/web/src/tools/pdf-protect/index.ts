import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.pdfProtect.name', path: '/pdf-protect',
  description: 'tools.pdfProtect.description', category: 'pdf',
  tags: ["media","file-upload"], keywords: ["pdf","protect","password","encrypt"],
  component: () => import('./PdfProtect.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
