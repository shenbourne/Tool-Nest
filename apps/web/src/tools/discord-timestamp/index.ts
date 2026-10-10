import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.discordTimestamp.name', path: '/discord-timestamp',
  description: 'tools.discordTimestamp.description', category: 'measurement',
  tags: ["time","discord"], keywords: ["discord","timestamp","unix","format"],
  component: () => import('./DiscordTimestamp.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
