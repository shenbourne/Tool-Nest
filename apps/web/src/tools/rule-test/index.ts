import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.ruleTest.name',
  path: '/rule-test',
  description: 'tools.ruleTest.description',
  category: 'network',
  tags: ['network', 'check'],
  keywords: ['rule', 'dns', 'test', 'resolution', 'proxy'],
  component: () => import('./RuleTest.vue'),
  createdAt: '2026-09-18',
  runtimeLocation: 'browser',
});
