import fs from 'node:fs';

function patch(file, ops, { expect = 1 } = {}) {
  let src = fs.readFileSync(file, 'utf8');
  for (const [from, to, n = expect] of ops) {
    const count = src.split(from).length - 1;
    if (count !== n) throw new Error(`${file}: expected ${n} occurrence(s) of ${JSON.stringify(from)}, found ${count}`);
    src = src.split(from).join(to);
  }
  if (!src.includes("from '@/i18n'")) {
    const lines = src.split('\n');
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith('} from ')) lastImport = i;
      else if (lines[i].trim() !== '' && !lines[i].startsWith('//') && lastImport !== -1) break;
    }
    lines.splice(lastImport + 1, 0, "import { i18n } from '@/i18n';");
    src = lines.join('\n');
  }
  fs.writeFileSync(file, src);
  console.log('patched', file);
}

const T = (key, params) => (params ? `i18n.global.t('${key}', ${params})` : `i18n.global.t('${key}')`);

// xml-formatter: 'Invalid XML' fallback occurs twice
patch('apps/web/src/tools/xml-formatter/xml-formatter.service.ts', [
  ["parseError.textContent || 'Invalid XML'", `parseError.textContent || ${T('tools.xmlFormatter.errorInvalidXml')}`, 2],
  ["e.message : 'Failed to parse XML'", `e.message : ${T('tools.xmlFormatter.errorParseFailed')}`, 2],
]);

// info-masking: module-level const → expose i18n keys, translate in the component
patch('apps/web/src/tools/info-masking/info-masking.service.ts', [
  ["  key: MaskPattern;\n  label: string;", "  key: MaskPattern;\n  labelKey: string;"],
  ["label: 'Email',", "labelKey: 'tools.infoMasking.patternEmail',"],
  ["label: 'Phone',", "labelKey: 'tools.infoMasking.patternPhone',"],
  ["label: 'IPv4 Address',", "labelKey: 'tools.infoMasking.patternIp',"],
  ["label: 'Credit Card',", "labelKey: 'tools.infoMasking.patternCreditCard',"],
], { expect: 1 });

// eta-calculator
patch('apps/web/src/tools/eta-calculator/eta-calculator.service.ts', [
  ["  if (!isFinite(ms) || ms < 0) return 'N/A';", `  if (!isFinite(ms) || ms < 0) return ${T('common.notAvailable')};`],
  ["  if (days > 0) parts.push(`${days}d`);", `  if (days > 0) parts.push(${T('tools.etaCalculator.durationDays', '{ n: days }')});`],
  ["  if (hours > 0) parts.push(`${hours}h`);", `  if (hours > 0) parts.push(${T('tools.etaCalculator.durationHours', '{ n: hours }')});`],
  ["  if (minutes > 0) parts.push(`${minutes}m`);", `  if (minutes > 0) parts.push(${T('tools.etaCalculator.durationMinutes', '{ n: minutes }')});`],
  ["  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);", `  if (seconds > 0 || parts.length === 0) parts.push(${T('tools.etaCalculator.durationSeconds', '{ n: seconds }')});`],
  ["  if (date.getTime() === 0) return 'N/A';\n  return date.toLocaleString();", `  if (date.getTime() === 0) return ${T('common.notAvailable')};\n  return date.toLocaleString(i18n.global.locale.value === 'zh' ? 'zh-CN' : 'en-US');`],
]);

// password-strength-analyser/index.ts
patch('apps/web/src/tools/password-strength-analyser/index.ts', [
  ["label: 'None', color: 'var(--color-text-3)', crackTime: 'Instant', suggestions: []", `label: ${T('tools.passwordStrength.labelNone')}, color: 'var(--color-text-3)', crackTime: ${T('tools.passwordStrength.crackInstant')}, suggestions: []`],
  ["suggestions.push('Use at least 8 characters')", `suggestions.push(${T('tools.passwordStrength.suggestLength')})`],
  ["suggestions.push('Add more character types (uppercase, numbers, symbols)')", `suggestions.push(${T('tools.passwordStrength.suggestVariety')})`],
  ["suggestions.push('Add numbers and symbols')", `suggestions.push(${T('tools.passwordStrength.suggestAddNumbersSymbols')})`],
  ["suggestions.push('Avoid using only numbers')", `suggestions.push(${T('tools.passwordStrength.suggestAvoidOnlyNumbers')})`],
  ["suggestions.push('Avoid repeated characters')", `suggestions.push(${T('tools.passwordStrength.suggestAvoidRepeats')})`],
  ["suggestions.push('Avoid common patterns')", `suggestions.push(${T('tools.passwordStrength.suggestAvoidCommon')})`],
  ["if (seconds < 1) crackTime = 'Instant';", `if (seconds < 1) crackTime = ${T('tools.passwordStrength.crackInstant')};`],
  ["else if (seconds < 60) crackTime = `${Math.round(seconds)} seconds`;", `else if (seconds < 60) crackTime = ${T('tools.passwordStrength.crackSeconds', '{ n: Math.round(seconds) }')};`],
  ["else if (seconds < 3600) crackTime = `${Math.round(seconds / 60)} minutes`;", `else if (seconds < 3600) crackTime = ${T('tools.passwordStrength.crackMinutes', '{ n: Math.round(seconds / 60) }')};`],
  ["else if (seconds < 86400) crackTime = `${Math.round(seconds / 3600)} hours`;", `else if (seconds < 86400) crackTime = ${T('tools.passwordStrength.crackHours', '{ n: Math.round(seconds / 3600) }')};`],
  ["else if (seconds < 31536000) crackTime = `${Math.round(seconds / 86400)} days`;", `else if (seconds < 31536000) crackTime = ${T('tools.passwordStrength.crackDays', '{ n: Math.round(seconds / 86400) }')};`],
  ["else if (seconds < 31536000 * 1000) crackTime = `${Math.round(seconds / 31536000)} years`;", `else if (seconds < 31536000 * 1000) crackTime = ${T('tools.passwordStrength.crackYears', '{ n: Math.round(seconds / 31536000) }')};`],
  ["else crackTime = 'Centuries';", `else crackTime = ${T('tools.passwordStrength.crackCenturies')};`],
  ["  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];", `  const labels = [\n    ${T('tools.passwordStrength.labelVeryWeak')},\n    ${T('tools.passwordStrength.labelWeak')},\n    ${T('tools.passwordStrength.labelFair')},\n    ${T('tools.passwordStrength.labelStrong')},\n    ${T('tools.passwordStrength.labelVeryStrong')},\n  ];`],
]);

console.log('\nremaining service files patched');
