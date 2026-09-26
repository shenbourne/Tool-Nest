import fs from 'node:fs';
import path from 'node:path';

const SRC = 'apps/web/src';
const scan = fs.readFileSync('.scratch/i18n-localization/baseline-scan.txt', 'utf8');

const files = [...scan.matchAll(/^### (.+?) {2}\((\d+)\)$/gm)].map((m) => ({
  f: m[1].split(path.sep).join('/'),
  n: Number(m[2]),
}));

const byCat = {};
for (const { f, n } of files) {
  let cat = '__app__';
  const mm = f.match(/tools\/([^/]+)\//);
  if (mm) {
    const s = fs.readFileSync(path.join(SRC, 'tools', mm[1], 'index.ts'), 'utf8');
    const c = s.match(/category:\s*'([^']+)'/);
    cat = c ? c[1] : 'UNKNOWN';
  }
  (byCat[cat] ||= []).push({ f, n, dir: mm ? mm[1] : null });
}

const entries = Object.entries(byCat).sort(
  (a, b) => b[1].reduce((s, x) => s + x.n, 0) - a[1].reduce((s, x) => s + x.n, 0)
);

for (const [c, arr] of entries) {
  console.log(
    c.padEnd(16),
    'files=' + String(arr.length).padStart(3),
    'hits=' + String(arr.reduce((s, x) => s + x.n, 0)).padStart(4)
  );
}
console.log('TOTAL files', files.length, 'hits', files.reduce((s, x) => s + x.n, 0));

fs.writeFileSync(
  '.scratch/i18n-localization/worklist.json',
  JSON.stringify({ byCategory: byCat }, null, 2)
);
