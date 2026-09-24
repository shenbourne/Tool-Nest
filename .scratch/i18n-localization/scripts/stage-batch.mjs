import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const LOCALES = 'apps/web/src/locales';
const FRAG_DIR = '.scratch/i18n-localization/fragments';

// args: fragment prefixes accumulated up to and including the batch being committed
const prefixes = process.argv.slice(2);
if (!prefixes.length) {
  console.error('usage: node stage-batch.mjs <NN-slug> [...cumulative prefixes]');
  process.exit(1);
}

function deepMerge(target, src) {
  for (const [k, v] of Object.entries(src)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      target[k] ??= {};
      deepMerge(target[k], v);
    } else {
      target[k] = v;
    }
  }
}

const base = (file) =>
  JSON.parse(execFileSync('git', ['show', `HEAD:${file}`], { encoding: 'utf8' }));

const en = base(`${LOCALES}/en.json`);
const zh = base(`${LOCALES}/zh.json`);

for (const p of prefixes) {
  const f = path.join(FRAG_DIR, `${p}.json`);
  if (!fs.existsSync(f)) throw new Error(`no fragment for ${p}`);
  const frag = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (frag.en) deepMerge(en, frag.en);
  if (frag.zh) deepMerge(zh, frag.zh);
  console.log(`applied ${p}`);
}

fs.writeFileSync(`${LOCALES}/en.json`, JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(`${LOCALES}/zh.json`, JSON.stringify(zh, null, 2) + '\n');

const flat = (o, p = '') =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flat(v, p + k + '.') : [p + k]
  );
const ek = new Set(flat(en));
const zk = new Set(flat(zh));
const miss = [...ek].filter((k) => !zk.has(k));
const extra = [...zk].filter((k) => !ek.has(k));
console.log(`en ${ek.size} / zh ${zk.size}${miss.length || extra.length ? ` MISSING=${miss} EXTRA=${extra}` : ' parity OK'}`);
