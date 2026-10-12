import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.palindromeChecker.name', path: '/palindrome-checker',
  description: 'tools.palindromeChecker.description', category: 'text',
  redirectFrom: ['/create-palindrome'],
  aliases: ['创建回文', 'Create Palindrome', 'Palindrome Generator'],
  tags: ["text","check","generator"], keywords: ["palindrome","check","verify","create","mirror","reverse"],
  component: () => import('./PalindromeChecker.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
