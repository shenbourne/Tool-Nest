import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.numberConverter.name', path: '/number-converter',
  description: 'tools.numberConverter.description', category: 'math',
  tags: ['converter', 'number'], keywords: ['number', 'words', 'english', 'roman', 'arabic', 'binary', 'octal', 'hexadecimal', '数字', '英文', '罗马', '进制'],
  redirectFrom: ['/number-to-words', '/roman-numeral-converter'],
  component: () => import('./NumberConverter.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
