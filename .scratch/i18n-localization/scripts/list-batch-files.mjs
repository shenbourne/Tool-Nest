import fs from 'node:fs';

// prints the file paths listed in an issue file's scope table
const issue = process.argv[2];
const md = fs.readFileSync(`.scratch/i18n-localization/issues/${issue}.md`, 'utf8');
const files = [...md.matchAll(/^\| `(.+?)` \| (\d+) \|$/gm)].map((m) => `apps/web/src/${m[1]}`);
files.forEach((f) => console.log(f));
