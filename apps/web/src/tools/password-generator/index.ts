import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.passwordGenerator.name', path: '/password-generator',
  description: 'tools.passwordGenerator.description', category: 'generator',
  tags: ["generator","security"], keywords: ["password","generator","random","secure"],
  component: () => import('./PasswordGenerator.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
