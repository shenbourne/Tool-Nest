import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.stringObfuscator.name', path: '/string-obfuscator',
  description: 'tools.stringObfuscator.description', category: 'crypto',
  tags: ['security'], keywords: ['obfuscate', 'mask', 'redact', 'hide', 'string', 'sensitive'],
  component: () => import('./StringObfuscator.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
