import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.extractSubstring.name', path: '/extract-substring',
  description: 'tools.extractSubstring.description', category: 'text',
  tags: ["text"], keywords: ["substring","extract","slice","range"],
  component: () => import('./ExtractSubstring.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
