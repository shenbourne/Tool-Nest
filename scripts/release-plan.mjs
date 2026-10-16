import { appendFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function planRelease({ version, previousVersion, sha, tagSha, manual = false }) {
  // Docker tags cannot contain SemVer build metadata (+); reject instead of silently renaming.
  const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?$/;
  if (typeof version !== 'string' || version.length > 128 || !semver.test(version)) {
    throw new Error('package.json version must be Docker-compatible SemVer without build metadata');
  }
  const publish = manual || version !== previousVersion || !tagSha;
  if (publish && !manual && tagSha && tagSha !== sha) {
    throw new Error(`v${version} already belongs to another commit; rebuild that commit or bump version`);
  }
  const stable = !version.includes('-');
  return { version, tag: `v${version}`, stable, publish,
    images: [`shenbourne/tool-nest:${version}`, ...(stable ? ['shenbourne/tool-nest:latest'] : [])] };
}

function git(...args) { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
function optionalGit(...args) { try { return git(...args); } catch { return null; } }

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
  const sha = git('rev-parse', 'HEAD');
  // Manual refs may be a SHA/tag, but must resolve to a commit in main's history.
  git('merge-base', '--is-ancestor', sha, 'origin/main');
  const before = process.env.BEFORE_SHA;
  const previous = before && !/^0+$/.test(before) ? before : `${sha}^`;
  const previousPackage = optionalGit('show', `${previous}:package.json`);
  const plan = planRelease({ version, sha,
    previousVersion: previousPackage ? JSON.parse(previousPackage).version : null,
    tagSha: optionalGit('rev-parse', '--verify', `refs/tags/v${version}^{commit}`),
    manual: process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' });
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `version=${plan.version}\ntag=${plan.tag}\npublish=${plan.publish}\nstable=${plan.stable}\n`);
  }
  console.log(JSON.stringify(plan));
}
