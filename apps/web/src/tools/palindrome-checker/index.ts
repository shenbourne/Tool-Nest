import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.palindromeChecker.name', path: '/palindrome-checker',
  description: 'tools.palindromeChecker.description', category: 'text',
  redirectFrom: ['/create-palindrome'],
  tags: ["text","check","generator"], keywords: ["palindrome","check","verify","create","mirror","reverse"],
  component: () => import('./PalindromeChecker.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
