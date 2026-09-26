import fs from 'node:fs';
import path from 'node:path';

const LOCALES = 'apps/web/src/locales';
const FRAG_DIR = '.scratch/i18n-localization/fragments';

const en = JSON.parse(fs.readFileSync(path.join(LOCALES, 'en.json'), 'utf8'));
const zh = JSON.parse(fs.readFileSync(path.join(LOCALES, 'zh.json'), 'utf8'));

function deepMerge(target, src, trail = '') {
  for (const [k, v] of Object.entries(src)) {
    const p = trail ? `${trail}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      target[k] ??= {};
      deepMerge(target[k], v, p);
    } else {
      if (Object.hasOwn(target, k) && target[k] !== v) {
        collisions.push(`${p}: ${JSON.stringify(target[k])} -> ${JSON.stringify(v)}`);
      }
      target[k] = v;
    }
  }
}

const collisions = [];

const files = fs
  .readdirSync(FRAG_DIR)
  .filter((f) => f.endsWith('.json'))
  .sort();

if (!files.length) {
  console.log('no fragments found');
  process.exit(0);
}

for (const f of files) {
  const frag = JSON.parse(fs.readFileSync(path.join(FRAG_DIR, f), 'utf8'));
  console.log(`merging ${f}`);
  collisions.length = 0;
  if (frag.en) deepMerge(en, frag.en);
  if (frag.zh) deepMerge(zh, frag.zh);
  if (collisions.length) {
    console.error(`  COLLISION in ${f}:`);
    collisions.forEach((c) => console.error(`    ${c}`));
  }
}

const sortKeys = (o) =>
  Object.fromEntries(
    Object.keys(o)
      .sort()
      .map((k) => [k, o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) ? sortKeys(o[k]) : o[k]])
  );

// keep existing top-level ordering, sort only tool sub-keys for stability
fs.writeFileSync(path.join(LOCALES, 'en.json'), JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(path.join(LOCALES, 'zh.json'), JSON.stringify(zh, null, 2) + '\n');

// parity check
const flat = (o, p = '') =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flat(v, p + k + '.') : [p + k]
  );
const ek = new Set(flat(en));
const zk = new Set(flat(zh));
const missZh = [...ek].filter((k) => !zk.has(k));
const extraZh = [...zk].filter((k) => !ek.has(k));
console.log(`\nen keys ${ek.size} / zh keys ${zk.size}`);
if (missZh.length) console.log('MISSING in zh:', missZh);
if (extraZh.length) console.log('EXTRA in zh:', extraZh);
if (!missZh.length && !extraZh.length) console.log('parity OK');
