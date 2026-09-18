import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.wifiQrCodeGenerator.name',
  path: '/wifi-qr-code-generator',
  description: 'tools.wifiQrCodeGenerator.description',
  category: 'generator',
  tags: ['generator'],
  keywords: ['wifi', 'qr', 'code', 'generator', 'network'],
  component: () => import('./WifiQrCodeGenerator.vue'),
  createdAt: '2026-09-18',
});
