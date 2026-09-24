import fs from 'node:fs';

const now = fs.readFileSync('.scratch/i18n-localization/scan-current.txt', 'utf8').split('\n');
const cur = new Map();
let cfile = null;
for (const l of now) {
  const m = l.match(/^### (.+?) {2}\((\d+)\)$/);
  if (m) {
    cfile = m[1].split('\\').join('/');
    cur.set(cfile, []);
  } else if (cfile && /^\s+\S+:(\d+) {2}\[/.test(l)) {
    cur.get(cfile).push(l.trim());
  }
}

const batches = process.argv.slice(2);
for (const b of batches) {
  const f = `.scratch/i18n-localization/issues/${b}.md`;
  if (!fs.existsSync(f)) continue;
  const md = fs.readFileSync(f, 'utf8');
  const files = [...md.matchAll(/^\| `(.+?)` \| (\d+) \|$/gm)].map((m) => ({
    rel: m[1],
    was: Number(m[2]),
    abs: 'apps/web/src/' + m[1],
  }));
  const left = files.filter((x) => cur.has(x.abs));
  const totalLeft = left.reduce((s, x) => s + cur.get(x.abs).length, 0);
  console.log(`\n${b}: ${files.length} files, ${left.length} with residual hits (${totalLeft})`);
  for (const x of left) {
    console.log(`  ${x.rel}  was ${x.was} -> ${cur.get(x.abs).length}`);
    cur.get(x.abs).forEach((l) => console.log(`      ${l}`));
  }
}
