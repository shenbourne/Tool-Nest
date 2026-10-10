import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.textCensor.name', path: '/text-censor',
  description: 'tools.textCensor.description', category: 'text',
  tags: ["text","filter"], keywords: ["censor","filter","profanity","mask"],
  component: () => import('./TextCensor.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
