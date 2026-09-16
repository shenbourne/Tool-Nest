import { defineTool } from '@toolnest/shared';

export interface StrengthResult {
  score: number;       // 0-4
  label: string;
  color: string;
  crackTime: string;
  suggestions: string[];
}

export function analyzePassword(password: string): StrengthResult {
  if (!password) return { score: 0, label: 'None', color: '#999', crackTime: 'Instant', suggestions: [] };

  let score = 0;
  const suggestions: string[] = [];

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (password.length < 8) suggestions.push('Use at least 8 characters');

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const variety = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (variety >= 3) score++;
  if (variety < 3) suggestions.push('Add more character types (uppercase, numbers, symbols)');

  // Penalties
  if (/^[a-zA-Z]+$/.test(password)) suggestions.push('Add numbers and symbols');
  if (/^[0-9]+$/.test(password)) { score = Math.max(0, score - 2); suggestions.push('Avoid using only numbers'); }
  if (/(.)\1{2,}/.test(password)) suggestions.push('Avoid repeated characters');
  if (/^(1234|password|qwerty|abc)/i.test(password)) { score = Math.max(0, score - 2); suggestions.push('Avoid common patterns'); }

  // Estimate crack time (simplified)
  const poolSize = (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasNumber ? 10 : 0) + (hasSpecial ? 33 : 0);
  const entropy = password.length * Math.log2(poolSize || 1);
  const guessesPerSecond = 1e10; // 10 billion guesses/sec
  const seconds = Math.pow(2, entropy) / guessesPerSecond;

  let crackTime: string;
  if (seconds < 1) crackTime = 'Instant';
  else if (seconds < 60) crackTime = `${Math.round(seconds)} seconds`;
  else if (seconds < 3600) crackTime = `${Math.round(seconds / 60)} minutes`;
  else if (seconds < 86400) crackTime = `${Math.round(seconds / 3600)} hours`;
  else if (seconds < 31536000) crackTime = `${Math.round(seconds / 86400)} days`;
  else if (seconds < 31536000 * 1000) crackTime = `${Math.round(seconds / 31536000)} years`;
  else crackTime = 'Centuries';

  score = Math.max(0, Math.min(4, score));

  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['#d03050', '#d03050', '#f0a020', '#18a058', '#18a058'];

  return { score, label: labels[score], color: colors[score], crackTime, suggestions };
}

export const tool = defineTool({
  name: 'tools.passwordStrength.name',
  path: '/password-strength-analyser',
  description: 'tools.passwordStrength.description',
  category: 'crypto',
  tags: ['security', 'validator'],
  keywords: ['password', 'strength', 'security', 'crack', 'entropy'],
  component: () => import('./PasswordStrength.vue'),
  createdAt: '2026-09-17',
  runtimeLocation: 'browser',
});
