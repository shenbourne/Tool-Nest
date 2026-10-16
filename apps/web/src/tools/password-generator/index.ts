import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.passwordGenerator.name', path: '/password-generator',
  description: 'tools.passwordGenerator.description', category: 'crypto',
  redirectFrom: ['/token-generator'],
  tags: ['generator', 'security'], keywords: ["password","token","generator","random","secure"],
  component: () => import('./PasswordGenerator.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
