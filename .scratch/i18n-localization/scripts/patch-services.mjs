import fs from 'node:fs';

const I18N_IMPORT = "import { i18n } from '@/i18n';\n";

function patch(file, ops, { addImport = true } = {}) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;
  for (const [from, to] of ops) {
    const count = src.split(from).length - 1;
    if (count !== 1) throw new Error(`${file}: expected 1 occurrence of ${JSON.stringify(from)}, found ${count}`);
    src = src.split(from).join(to);
  }
  if (addImport && !src.includes("from '@/i18n'")) {
    const lines = src.split('\n');
    let idx = 0;
    while (idx < lines.length && (lines[idx].startsWith('import ') || lines[idx].startsWith('//') || lines[idx].trim() === '')) idx++;
    // insert after the last leading import line
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith('} from ') || lines[i].startsWith('  ')) lastImport = i;
      else if (lines[i].trim() !== '' && !lines[i].startsWith('//')) break;
    }
    lines.splice(lastImport + 1, 0, I18N_IMPORT.trimEnd());
    src = lines.join('\n');
  }
  if (src === before) throw new Error(`${file}: no change`);
  fs.writeFileSync(file, src);
  console.log('patched', file);
}

const T = (key, params) => (params ? `i18n.global.t('${key}', ${params})` : `i18n.global.t('${key}')`);

// 1. date-time-converter
patch('apps/web/src/tools/date-time-converter/date-time-converter.service.ts', [
  ["import utc from 'dayjs/plugin/utc';", "import utc from 'dayjs/plugin/utc';\nimport 'dayjs/locale/zh-cn';\nimport { i18n } from '@/i18n';"],
  ["  if (!input.trim()) {\n    return { results: [], error: null };\n  }",
   "  if (!input.trim()) {\n    return { results: [], error: null };\n  }\n\n  dayjs.locale(i18n.global.locale.value === 'zh' ? 'zh-cn' : 'en');"],
  ["error: 'Invalid Unix timestamp (seconds)'", `error: ${T('tools.dateTimeConverter.errorInvalidUnixSeconds')}`],
  ["error: 'Invalid Unix timestamp (ms)'", `error: ${T('tools.dateTimeConverter.errorInvalidUnixMs')}`],
  ["error: 'Invalid ISO 8601 date'", `error: ${T('tools.dateTimeConverter.errorInvalidIso')}`],
  ["error: 'Invalid RFC 3339 date'", `error: ${T('tools.dateTimeConverter.errorInvalidRfc')}`],
  ["error: 'Invalid UTC string'", `error: ${T('tools.dateTimeConverter.errorInvalidUtc')}`],
  ["error: 'Custom format string required'", `error: ${T('tools.dateTimeConverter.errorCustomFormatRequired')}`],
  ["error: `Input does not match format \"${customFormat}\"`", `error: ${T('tools.dateTimeConverter.errorFormatMismatch', '{ format: customFormat }')}`],
  ["error: 'Invalid date input'", `error: ${T('tools.dateTimeConverter.errorInvalidDate')}`],
  ["{ label: 'Unix Timestamp (s)', value: String(date.unix()) }", `{ label: ${T('tools.dateTimeConverter.labelUnixSeconds')}, value: String(date.unix()) }`],
  ["{ label: 'Unix Timestamp (ms)', value: String(date.valueOf()) }", `{ label: ${T('tools.dateTimeConverter.labelUnixMilliseconds')}, value: String(date.valueOf()) }`],
  ["{ label: 'UTC String', value: date.toDate().toUTCString() }", `{ label: ${T('tools.dateTimeConverter.labelUtcString')}, value: date.toDate().toUTCString() }`],
  ["{ label: 'Local Date Time', value: date.format('YYYY-MM-DD HH:mm:ss') }", `{ label: ${T('tools.dateTimeConverter.labelLocalDateTime')}, value: date.format('YYYY-MM-DD HH:mm:ss') }`],
  ["{ label: 'Relative', value: date.fromNow() }", `{ label: ${T('tools.dateTimeConverter.labelRelative')}, value: date.fromNow() }`],
], { addImport: false });

// 2. docker-compose-to-1panel
patch('apps/web/src/tools/docker-compose-to-1panel/docker-compose-to-1panel.service.ts', [
  ["error: 'Invalid YAML: not an object'", `error: ${T('tools.dockerComposeTo1panel.errorInvalidYaml')}`],
  ["const message = e instanceof Error ? e.message : 'Unknown error';", `const message = e instanceof Error ? e.message : ${T('tools.dockerComposeTo1panel.errorUnknown')};`],
  ["error: `YAML parse error: ${message}`", `error: ${T('tools.dockerComposeTo1panel.errorYamlParse', '{ message }')}`],
]);

// 3. docker-run-to-compose
patch('apps/web/src/tools/docker-run-to-compose/docker-run-to-compose.service.ts', [
  ["warnings.push('--log-opt is not directly translatable to docker-compose service level');", `warnings.push(${T('tools.dockerRunToCompose.warnLogOpt')});`],
  ["warnings.push(`Flag ${token} is not supported in this converter`);", `warnings.push(${T('tools.dockerRunToCompose.warnUnsupportedFlag', '{ flag: token }')});`],
  ["error: 'No image specified in docker run command'", `error: ${T('tools.dockerRunToCompose.errorNoImage')}`],
  ["const message = e instanceof Error ? e.message : 'Failed to parse docker run command';", `const message = e instanceof Error ? e.message : ${T('tools.dockerRunToCompose.errorParseFailed')};`],
]);

// 4. email-normalizer
patch('apps/web/src/tools/email-normalizer/email-normalizer.service.ts', [
  ["error: 'Invalid email format: missing @'", `error: ${T('tools.emailNormalizer.errorMissingAt')}`],
]);

// 5. json-minify (fallback only; library messages left as-is)
patch('apps/web/src/tools/json-minify/json-minify.service.ts', [
  ["e.message : 'Invalid JSON'", `e.message : ${T('common.invalidJson')}`],
]);

// 6. json-to-csv
patch('apps/web/src/tools/json-to-csv/json-to-csv.service.ts', [
  ["error: 'Input must be a JSON array of objects'", `error: ${T('tools.jsonToCsv.errorNotArray')}`],
  ["error: 'Each item in the array must be a JSON object'", `error: ${T('tools.jsonToCsv.errorItemNotObject')}`],
]);

// 7. json-viewer
patch('apps/web/src/tools/json-viewer/json-viewer.service.ts', [
  ["e.message : 'Invalid JSON'", `e.message : ${T('common.invalidJson')}`],
]);

// 8. regex-tester
patch('apps/web/src/tools/regex-tester/regex-tester.service.ts', [
  ["e.message : 'Invalid regex pattern'", `e.message : ${T('tools.regexTester.errorInvalidPattern')}`],
]);

// 9. xml-formatter
patch('apps/web/src/tools/xml-formatter/xml-formatter.service.ts', [
  ["parseError.textContent || 'Invalid XML'", `parseError.textContent || ${T('tools.xmlFormatter.errorInvalidXml')}`],
  ["e.message : 'Failed to parse XML'", `e.message : ${T('tools.xmlFormatter.errorParseFailed')}`],
]);

// 10. info-masking — module-level const, so expose a key and translate in the component
patch('apps/web/src/tools/info-masking/info-masking.service.ts', [
  ["  key: MaskPattern;\n  label: string;", "  key: MaskPattern;\n  labelKey: string;"],
  ["label: 'Email',", "labelKey: 'tools.infoMasking.patternEmail',"],
  ["label: 'Phone',", "labelKey: 'tools.infoMasking.patternPhone',"],
  ["label: 'IPv4 Address',", "labelKey: 'tools.infoMasking.patternIp',"],
  ["label: 'Credit Card',", "labelKey: 'tools.infoMasking.patternCreditCard',"],
]);

// 11. eta-calculator
patch('apps/web/src/tools/eta-calculator/eta-calculator.service.ts', [
  ["  if (!isFinite(ms) || ms < 0) return 'N/A';", `  if (!isFinite(ms) || ms < 0) return ${T('common.notAvailable')};`],
  ["  if (days > 0) parts.push(`${days}d`);", `  if (days > 0) parts.push(${T('tools.etaCalculator.durationDays', '{ n: days }')});`],
  ["  if (hours > 0) parts.push(`${hours}h`);", `  if (hours > 0) parts.push(${T('tools.etaCalculator.durationHours', '{ n: hours }')});`],
  ["  if (minutes > 0) parts.push(`${minutes}m`);", `  if (minutes > 0) parts.push(${T('tools.etaCalculator.durationMinutes', '{ n: minutes }')});`],
  ["  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);", `  if (seconds > 0 || parts.length === 0) parts.push(${T('tools.etaCalculator.durationSeconds', '{ n: seconds }')});`],
  ["  if (date.getTime() === 0) return 'N/A';\n  return date.toLocaleString();", `  if (date.getTime() === 0) return ${T('common.notAvailable')};\n  return date.toLocaleString(i18n.global.locale.value === 'zh' ? 'zh-CN' : 'en-US');`],
]);

// 12. password-strength-analyser
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

console.log('\nall service files patched');
