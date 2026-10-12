import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.caseConverter.name', path: '/case-converter',
  description: 'tools.caseConverter.description', category: 'text',
  tags: ['converter', 'parser'], keywords: ['case', 'camel', 'snake', 'kebab', 'pascal', 'convert', 'string'],
  component: () => import('./CaseConverter.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
