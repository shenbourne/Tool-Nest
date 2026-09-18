import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.infoMasking.name',
  path: '/info-masking',
  description: 'tools.infoMasking.description',
  category: 'platform',
  tags: ['developer', 'security'],
  keywords: ['mask', 'redact', 'sensitive', 'privacy', 'email', 'phone', 'ip', 'credit card'],
  component: () => import('./InfoMasking.vue'),
  createdAt: '2026-09-18',
});
