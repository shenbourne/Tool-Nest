import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.regexTester.name',
  path: '/regex-tester',
  description: 'tools.regexTester.description',
  category: 'developer',
  tags: ['developer', 'debug'],
  keywords: ['regex', 'regular expression', 'pattern', 'match', 'test', 'debug'],
  component: () => import('./RegexTester.vue'),
  createdAt: '2026-09-18',
});
