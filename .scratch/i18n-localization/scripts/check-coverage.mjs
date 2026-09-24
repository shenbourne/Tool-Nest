import fs from 'node:fs';

const md = fs
  .readdirSync('.scratch/i18n-localization/issues')
  .map((f) => fs.readFileSync('.scratch/i18n-localization/issues/' + f, 'utf8'))
  .join('\n');
const listed = new Set(
  [...md.matchAll(/^\| `(.+?)` \| (\d+) \|$/gm)].map((m) => m[1])
);

const scan = fs.readFileSync('.scratch/i18n-localization/scan-current.txt', 'utf8');
const files = [...scan.matchAll(/^### (.+?) {2}\((\d+)\)$/gm)].map((m) => ({
  f: m[1].split('\\').join('/').replace('apps/web/src/', ''),
  n: Number(m[2]),
}));

const notCovered = files.filter((x) => !listed.has(x.f));
console.log(`files with residual hits: ${files.length}`);
console.log(`not covered by any batch: ${notCovered.length}`);
notCovered.forEach((x) => console.log(`  ${x.f}  ${x.n}`));

console.log('\ncovered batches still holding hits:');
const byBatch = new Map();
for (const f of fs.readdirSync('.scratch/i18n-localization/issues')) {
  const body = fs.readFileSync('.scratch/i18n-localization/issues/' + f, 'utf8');
  const names = [...body.matchAll(/^\| `(.+?)` \| (\d+) \|$/gm)].map((m) => m[1]);
  const hit = names.filter((n) => files.some((x) => x.f === n));
  if (hit.length) byBatch.set(f, hit);
}
for (const [b, hits] of byBatch) console.log(`  ${b}: ${hits.length}`);
