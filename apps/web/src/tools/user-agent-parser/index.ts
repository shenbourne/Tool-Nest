import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.userAgentParser.name',
  path: '/user-agent-parser',
  description: 'tools.userAgentParser.description',
  category: 'web',
  tags: ['developer', 'parser'],
  keywords: ['user-agent', 'parser', 'browser', 'os', 'device'],
  component: () => import('./UserAgentParser.vue'),
  createdAt: '2026-09-18',
});
