import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.otpGenerator.name',
  path: '/otp-generator',
  description: 'tools.otpGenerator.description',
  category: 'generator',
  tags: ['generator', 'security'],
  keywords: ['otp', 'totp', 'mfa', 'two-factor', 'authenticator'],
  component: () => import('./OtpGenerator.vue'),
  createdAt: '2026-09-18',
});
