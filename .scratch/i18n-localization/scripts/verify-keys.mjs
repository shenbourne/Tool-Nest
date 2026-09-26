import fs from 'node:fs';
import path from 'node:path';

const SRC = 'apps/web/src';
const LOCALES = path.join(SRC, 'locales');

const en = JSON.parse(fs.readFileSync(path.join(LOCALES, 'en.json'), 'utf8'));
const zh = JSON.parse(fs.readFileSync(path.join(LOCALES, 'zh.json'), 'utf8'));

function hasKey(obj, dotted) {
  return dotted.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj) !== undefined;
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'dist', '__tests__'].includes(e.name)) continue;
      walk(p, out);
    } else if (['.vue', '.ts'].includes(path.extname(e.name))) out.push(p);
  }
  return out;
}

// static keys only: t('a.b') / $t("a.b") / i18n.global.t('a.b')
const KEY_RE = /(?<![\w$.])\$?t\(\s*(['"])([A-Za-z0-9_.-]+)\1|i18n\.global\.t\(\s*(['"])([A-Za-z0-9_.-]+)\3/g;

const missing = new Map();
const used = new Set();
const skips = new Set(['src/locales/en.json', 'src/locales/zh.json']);

for (const f of walk(SRC)) {
  const rel = f.split(path.sep).join('/');
  if (skips.has(rel)) continue;
  const src = fs.readFileSync(f, 'utf8');
  const lines = src.split('\n');
  let m;
  KEY_RE.lastIndex = 0;
  while ((m = KEY_RE.exec(src))) {
    const key = m[2] ?? m[4];
    used.add(key);
    const line = src.slice(0, m.index).split('\n').length;
    if (!hasKey(en, key) || !hasKey(zh, key)) {
      const miss = [];
      if (!hasKey(en, key)) miss.push('en');
      if (!hasKey(zh, key)) miss.push('zh');
      if (!missing.has(key)) missing.set(key, []);
      missing.get(key).push(`${rel}:${line} (missing ${miss.join(',')})`);
    }
  }
}

console.log(`distinct t() keys used: ${used.size}`);
console.log(`MISSING keys: ${missing.size}`);
for (const [k, where] of [...missing.entries()].sort()) {
  console.log(`\n  ${k}`);
  where.slice(0, 6).forEach((w) => console.log(`     ${w}`));
  if (where.length > 6) console.log(`     ... +${where.length - 6} more`);
}

// locale key parity
const flat = (o, p = '') =>
  Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? flat(v, p + k + '.') : [p + k]));
const ek = new Set(flat(en));
const zk = new Set(flat(zh));
const missZh = [...ek].filter((k) => !zk.has(k));
const extraZh = [...zk].filter((k) => !ek.has(k));
console.log(`\nlocale keys: en ${ek.size} / zh ${zk.size}`);
if (missZh.length) console.log('parity MISSING in zh:', missZh);
if (extraZh.length) console.log('parity EXTRA in zh:', extraZh);
if (!missZh.length && !extraZh.length) console.log('parity OK');

process.exitCode = missing.size || missZh.length || extraZh.length ? 1 : 0;
