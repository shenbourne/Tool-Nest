import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.textReplacer.name', path: '/text-replacer',
  description: 'tools.textReplacer.description', category: 'text',
  tags: ["text"], keywords: ["replace","find","regex","search"],
  component: () => import('./TextReplacer.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
