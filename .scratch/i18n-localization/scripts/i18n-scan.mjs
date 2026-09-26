import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || 'apps/web/src';
const exts = ['.vue', '.ts'];

// Literals intentionally left untranslated (spec §非目标). Matched against the
// JSON.stringify() form of the extracted value.
const ALLOWLIST_PATH = '.scratch/i18n-localization/scan-allowlist.json';
const allowlist = fs.existsSync(ALLOWLIST_PATH)
  ? new Set(JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf8')).exact ?? [])
  : new Set();
let allowedHits = 0;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '__tests__') continue;
      walk(p, out);
    } else if (exts.includes(path.extname(e.name))) out.push(p);
  }
  return out;
}

// English-looking literal: has 2+ latin words or a sentence-ish phrase
const hasLatin = /[A-Za-z]{2,}/;
const cjk = /[\u4e00-\u9fff]/;

function isCandidate(s) {
  const v = s.trim();
  if (!v) return false;
  if (cjk.test(v)) return false;
  if (!/[A-Za-z]{2,}/.test(v)) return false;
  // skip obvious non-prose
  if (/^[a-z0-9-_.@/{}[\]():;,+*#%$!=<>&|~`^"'\\ ]+$/.test(v) && !v.includes(' ')) return false;
  if (/^(https?:|\/|\.\/|\.\.\/)/.test(v)) return false;
  if (/^[A-Z0-9_]+$/.test(v)) return false;
  return true;
}

const results = [];
for (const f of walk(root)) {
  const src = fs.readFileSync(f, 'utf8');
  const lines = src.split('\n');
  const hits = [];

  const templateMatch = src.match(/<template>([\s\S]*)<\/template>\s*$/);
  const template = templateMatch ? templateMatch[1] : '';
  const templateStartLine = templateMatch
    ? src.slice(0, src.indexOf(templateMatch[0])).split('\n').length
    : 0;

  // 1. Text nodes: >text<
  const textRe = />([^<>{}]+)</g;
  let m;
  while ((m = textRe.exec(template))) {
    if (isCandidate(m[1])) {
      const line = templateStartLine + template.slice(0, m.index).split('\n').length - 1;
      hits.push({ line, kind: 'text', value: m[1].trim() });
    }
  }

  // 2. String attributes
  const attrRe = /\s(placeholder|title|label|description|message|text|hint|tooltip|aria-label|alt|loading-text|help)="([^"]*)"/g;
  while ((m = attrRe.exec(template))) {
    if (isCandidate(m[2])) {
      const line = templateStartLine + template.slice(0, m.index).split('\n').length - 1;
      hits.push({ line, kind: 'attr:' + m[1], value: m[2].trim() });
    }
  }

  // 3. Script-side user-facing strings assigned to refs / returned
  const scriptMatch = src.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    const script = scriptMatch[1];
    const scriptStart = src.slice(0, src.indexOf(scriptMatch[0])).split('\n').length;
    const sRe = /(error|message|msg|label|title|desc|hint|text|note|warning|info)\w*\s*(?:\.value\s*)?=\s*(['"`])((?:(?!\2).){4,})\2/gi;
    while ((m = sRe.exec(script))) {
      if (isCandidate(m[3])) {
        const line = scriptStart + script.slice(0, m.index).split('\n').length - 1;
        hits.push({ line, kind: 'script:' + m[1], value: m[3].trim() });
      }
    }
  }

  const kept = hits.filter((h) => {
    if (allowlist.has(h.value)) {
      allowedHits++;
      return false;
    }
    return true;
  });

  if (kept.length) results.push({ file: f, hits: kept });
}

let total = 0;
for (const r of results) {
  console.log(`\n### ${r.file}  (${r.hits.length})`);
  for (const h of r.hits) {
    total++;
    console.log(`  ${r.file}:${h.line}  [${h.kind}]  ${JSON.stringify(h.value)}`);
  }
}
console.log(`\nFILES: ${results.length}  HITS: ${total}  (allowlisted: ${allowedHits})`);
