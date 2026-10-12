import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.qrCodeGenerator.name',
  path: '/qr-code-generator',
  description: 'tools.qrCodeGenerator.description',
  category: 'encoding',
  tags: ['generator'],
  keywords: ['qr', 'code', 'generator', 'barcode'],
  component: () => import('./QrCodeGenerator.vue'),
  createdAt: '2026-09-18',
});
