import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.romanNumeralConverter.name',
  path: '/roman-numeral-converter',
  description: 'tools.romanNumeralConverter.description',
  category: 'converter',
  tags: ['converter', 'text'],
  keywords: ['roman', 'arabic', 'numeral', 'X', 'I', 'V', 'L', 'C', 'D', 'M'],
  component: () => import('./RomanNumeralConverter.vue'),
  createdAt: '2026-09-18',
});
