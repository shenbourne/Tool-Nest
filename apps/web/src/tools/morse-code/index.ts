import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.morseCode.name', path: '/morse-code',
  description: 'tools.morseCode.description', category: 'converter',
  tags: ["converter","text"], keywords: ["morse","code","dot","dash"],
  component: () => import('./MorseCode.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
