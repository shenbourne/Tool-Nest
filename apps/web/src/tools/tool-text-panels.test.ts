import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Every text-based tool (input textarea -> transform -> output textarea)
// renders the shared ToolTextPanel so all of them show the same two-column
// layout with import/paste (input side) and copy/export (output side), like
// the file tools do through ToolFilePanel. A tool re-growing its own card +
// button row layout is the drift this pins down.
const toolsDir = fileURLToPath(new URL('.', import.meta.url));

// Full in-scope list (see .workflow/phases/11-text-tool-actions/CONTEXT.md).
const EXPECTED: string[] = [
  // csv/tsv
  'csv-change-separator/CsvChangeSeparator.vue',
  'csv-find-incomplete/CsvFindIncomplete.vue',
  'csv-insert-columns/CsvInsertColumns.vue',
  'csv-rows-to-columns/CsvRowsToColumns.vue',
  'csv-swap-columns/CsvSwapColumns.vue',
  'csv-to-json/CsvToJson.vue',
  'csv-to-tsv/CsvToTsv.vue',
  'csv-to-xml/CsvToXml.vue',
  'csv-to-yaml/CsvToYaml.vue',
  'tsv-to-json/TsvToJson.vue',
  // json
  'json-escape/JsonEscape.vue',
  'json-minify/JsonMinify.vue',
  'json-prettify/JsonPrettify.vue',
  'json-sort/JsonSort.vue',
  'json-to-csv/JsonToCsv.vue',
  'json-to-toml/JsonToToml.vue',
  'json-to-xml/JsonToXml.vue',
  'json-to-yaml/JsonToYaml.vue',
  'json-validate/JsonValidate.vue',
  // xml/yaml/toml/sql
  'xml-formatter/XmlFormatter.vue',
  'xml-to-json/XmlToJson.vue',
  'xml-validator/XmlValidator.vue',
  'yaml-to-json/YamlToJson.vue',
  'yaml-to-toml/YamlToToml.vue',
  'yaml-viewer/YamlViewer.vue',
  'toml-to-json/TomlToJson.vue',
  'toml-to-yaml/TomlToYaml.vue',
  'sql-prettify/SqlPrettify.vue',
  // data/dev converters
  'base64-encoder/Base64Encoder.vue',
  // Phase 26: mixed text/file rows use action overrides and the standard FileCard.
  'base64-file-converter/Base64FileConverter.vue',
  'docker-run-to-compose/DockerRunToCompose.vue',
  'email-extractor/EmailExtractor.vue',
  'email-normalizer/EmailNormalizer.vue',
  'hash-text/HashText.vue',
  'hmac-generator/HmacGenerator.vue',
  'html-entities/HtmlEntities.vue',
  'jwt-parser/JwtParser.vue',
  // list
  'list-converter/ListConverter.vue',
  'list-find-popular/ListFindPopular.vue',
  'list-group/ListGroup.vue',
  'list-reverse/ListReverse.vue',
  'list-rotate/ListRotate.vue',
  'list-shuffle/ListShuffle.vue',
  'list-truncate/ListTruncate.vue',
  'list-unwrap/ListUnwrap.vue',
  // text
  'text-censor/TextCensor.vue',
  'text-replacer/TextReplacer.vue',
  'text-reverse/TextReverse.vue',
  'text-rotate/TextRotate.vue',
  'text-split/TextSplit.vue',
  'text-to-binary/TextToBinary.vue',
  'text-to-nato-alphabet/TextToNatoAlphabet.vue',
  'text-to-unicode/TextToUnicode.vue',
  'text-truncate/TextTruncate.vue',
  'remove-duplicate-lines/RemoveDuplicateLines.vue',
  'morse-code/MorseCode.vue',
  'rot13/Rot13.vue',
  'extract-substring/ExtractSubstring.vue',
  'hidden-char-detector/HiddenCharDetector.vue',
  'info-masking/InfoMasking.vue',
  'markdown-to-html/MarkdownToHtml.vue',
  // math/time/encryption
  'check-leap-years/CheckLeapYears.vue',
  'create-palindrome/CreatePalindrome.vue',
  'days-to-hours/DaysToHours.vue',
  'hours-to-days/HoursToDays.vue',
  'number-generator/NumberGenerator.vue',
  'number-sum/NumberSum.vue',
  'palindrome-checker/PalindromeChecker.vue',
  'seconds-to-time/SecondsToTime.vue',
  'time-to-decimal/TimeToDecimal.vue',
  'time-to-seconds/TimeToSeconds.vue',
  'encryption/EncryptionTool.vue',
];

// Two-textarea tools deliberately NOT converted, with the reason kept in
// phase 11 CONTEXT.md: file-based (has ToolFileUpload already), form
// generators, or no input->output text pair.
const EXCLUDED: string[] = [
  // Phase 24: clock picker and structured result rows replace the text/file pair.
  'truncate-clock-time/TruncateClockTime.vue',
  // phase 16: generates a whole 1Panel app directory (metadata form + file
  // tree + editable file cards + zip export), not an input->output text pair
  'docker-compose-to-1panel/DockerComposeTo1panel.vue',
  // two-input comparators: both textareas are inputs and the result is a
  // structured diff card, so the input/output action split does not apply;
  // they render ToolTextPairPanel instead (phase 17)
  'json-diff/JsonDiff.vue',
  'text-diff/TextDiff.vue',
];

// Tools converted so far. Grows batch by batch; the last batch of the phase
// sets this to EXPECTED so the first test covers the whole scope.
const MIGRATED: string[] = EXPECTED;

// Phase 20 additions: tools migrated to ToolTextPanel with hideInput or
// hideOutput (single-column mode). They have a textarea but only one column,
// so they are not in the two-textarea EXPECTED list above.
const PHASE20_MIGRATED: string[] = [
  'bip39-generator/Bip39Generator.vue',
  'meta-tag-generator/MetaTagGenerator.vue',
  'rsa-key-pair-generator/RsaKeyPair.vue',
];

function componentPaths(): string[] {
  const paths: string[] = [];
  for (const entry of readdirSync(toolsDir)) {
    const full = join(toolsDir, entry);
    if (!statSync(full).isDirectory()) continue;
    for (const file of readdirSync(full)) {
      if (file.endsWith('.vue')) paths.push(`${entry}/${file}`);
    }
  }
  return paths.sort();
}

const source = (name: string) => readFileSync(join(toolsDir, name), 'utf8');

describe('tool text panels', () => {
  it('renders ToolTextPanel in every migrated tool', () => {
    const offenders = MIGRATED.filter((name) => !source(name).includes('<ToolTextPanel'));
    expect(offenders).toEqual([]);
  });

  it('keeps excluded tools off ToolTextPanel', () => {
    const offenders = EXCLUDED.filter((name) => source(name).includes('<ToolTextPanel'));
    expect(offenders).toEqual([]);
  });

  it('renders ToolTextPanel in every phase-20 migrated tool', () => {
    const offenders = PHASE20_MIGRATED.filter((name) => !source(name).includes('<ToolTextPanel'));
    expect(offenders).toEqual([]);
  });

  it('renders ToolTextPairPanel in the two-input diff comparators', () => {
    const comparators = [
      'json-diff/JsonDiff.vue',
      'text-diff/TextDiff.vue',
    ];
    const offenders = comparators.filter((name) => !source(name).includes('<ToolTextPairPanel'));
    expect(offenders).toEqual([]);
  });

  it('accounts for every two-textarea tool', () => {
    const accounted = new Set([...EXPECTED, ...EXCLUDED, ...PHASE20_MIGRATED]);
    const decided = componentPaths().filter((name) => {
      const count = (source(name).match(/type="textarea"/g) ?? []).length;
      return count >= 2;
    });
    const missing = decided.filter((name) => !accounted.has(name));
    const ghost = [...accounted].filter((name) => !componentPaths().includes(name));
    expect({ missing, ghost }).toEqual({ missing: [], ghost: [] });
  });
});
