import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planRelease } from './release-plan.mjs';
const base = { version: '0.1.0', previousVersion: '0.1.0', sha: 'a'.repeat(40), tagSha: 'a'.repeat(40), manual: false };
test('ordinary same-version commit skips publication', () => assert.equal(planRelease(base).publish, false));
test('initial version without a tag publishes', () => assert.equal(planRelease({ ...base, tagSha: null }).publish, true));
test('version change publishes immutable version and latest', () => {
  const p = planRelease({ ...base, version: '1.2.3', tagSha: null });
  assert.equal(p.publish, true); assert.equal(p.tag, 'v1.2.3');
  assert.deepEqual(p.images, ['shenbourne/tool-nest:1.2.3', 'shenbourne/tool-nest:latest']);
});
test('prerelease never changes latest', () => assert.deepEqual(planRelease({ ...base, version: '1.3.0-beta.1', tagSha: null }).images, ['shenbourne/tool-nest:1.3.0-beta.1']));
test('manual exact release rebuild allowed', () => assert.equal(planRelease({ ...base, manual: true }).publish, true));
test('manual rebuild of selected main commit preserves original version tag', () => assert.equal(planRelease({ ...base, manual: true, tagSha: 'b'.repeat(40) }).publish, true));
test('automatic changed-version cannot reuse a historical tag', () => assert.throws(() => planRelease({ ...base, previousVersion: '0.0.9', tagSha: 'b'.repeat(40) }), /already belongs/));
test('automatic same version skips even if existing tag belongs to prior release', () => assert.equal(planRelease({ ...base, tagSha: 'b'.repeat(40) }).publish, false));
test('invalid versions and unsafe Docker tags fail', () => {
  for (const version of [null, '', 'v1.2.3', '01.2.3', '1.2', '1.2.3-01', '1.2.3+build.1', '1.2.3\nINJECT=1', '1.2.3-' + 'x'.repeat(125)]) {
    assert.throws(() => planRelease({ ...base, version }), /version/);
  }
});
