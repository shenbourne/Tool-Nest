import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.textTruncate.name', path: '/text-truncate',
  description: 'tools.textTruncate.description', category: 'text',
  redirectFrom: ['/extract-substring'],
  aliases: ['提取子串', 'Extract Substring', 'Substring Extractor'],
  tags: ["text"], keywords: ["truncate","cut","shorten","limit","substring","extract","slice","range"],
  component: () => import('./TextTruncate.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
