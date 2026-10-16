import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import yaml from 'js-yaml';
import { reactive } from 'vue';
import { importAppPackage, generatePackageVersion, packageAssets } from './app-package';
import { buildAppZip } from './onepanel-app-directory';

async function fixture(prefix = 'apps/demo/', versionPrefix = '') {
  const zip = new JSZip();
  zip.file(`${prefix}data.yml`, yaml.dump({ name: 'Demo', additionalProperties: { key: 'demo', name: 'Demo', tags: ['Tool'], type: 'tool', architectures: ['arm64'], website: 'https://example.com', limit: 3, description: { zh: '说明', en: 'Instructions', ja: '保持' } } }));
  zip.file(`${prefix}README.md`, '# original');
  zip.file(`${prefix}logo.png`, new Uint8Array([1, 2, 3]));
  zip.file(`${prefix}${versionPrefix}1.0.0/docker-compose.yml`, 'services:\n  web:\n    image: demo:1\n    labels:\n      com.1panel.appName: demo\n');
  zip.file(`${prefix}${versionPrefix}1.0.0/data.yml`, 'additionalProperties:\n  formFields:\n    - envKey: CUSTOM_TOKEN\n      type: password\n');
  zip.file(`${prefix}${versionPrefix}1.0.0/scripts/init.sh`, '#!/bin/sh\necho init');
  zip.file(`${prefix}${versionPrefix}1.0.0/data/icon.bin`, new Uint8Array([0, 255, 128]));
  return zip;
}

describe('existing 1Panel package', () => {
  it.each([['apps/demo/', ''], ['', 'versions/']])('imports %s %s and preserves metadata/assets while creating a version', async (root, versionPrefix) => {
    const zip = await fixture(root, versionPrefix);
    const app = await importAppPackage(await zip.generateAsync({ type: 'uint8array' }));
    expect(app.meta).toMatchObject({ key: 'demo', name: 'Demo', descZh: '说明', descEn: 'Instructions', architectures: ['arm64'], version: '1.0.1' });
    const meta = { ...app.meta, name: 'Edited', version: '2.0.0' };
    const result = generatePackageVersion(reactive(app), app.versions[0], meta, 'services:\n  web:\n    image: demo:2\n');
    expect(result.success).toBe(true);
    const data = yaml.load(result.files.find(file => file.path === 'data.yml')!.content) as { additionalProperties: Record<string, unknown> };
    expect(data.additionalProperties).toMatchObject({ name: 'Edited', website: 'https://example.com', limit: 3, description: { ja: '保持' } });
    expect(result.files.find(file => file.path.endsWith('2.0.0/data.yml'))?.content).toContain('CUSTOM_TOKEN');
    const output = await buildAppZip('demo', result.files, null, packageAssets(app, app.versions[0], meta.version));
    const exported = await JSZip.loadAsync(await output.arrayBuffer());
    expect(await exported.file(`demo/${versionPrefix}1.0.0/docker-compose.yml`)!.async('string')).toContain('demo:1');
    expect(await exported.file(`demo/${versionPrefix}2.0.0/docker-compose.yml`)!.async('string')).toContain('demo:2');
    expect(await exported.file(`demo/${versionPrefix}2.0.0/scripts/init.sh`)!.async('string')).toContain('echo init');
    expect(Array.from(await exported.file(`demo/${versionPrefix}2.0.0/data/icon.bin`)!.async('uint8array'))).toEqual([0, 255, 128]);
    expect(await exported.file('demo/README.md')!.async('string')).toBe('# original');
    expect(Array.from(await exported.file('demo/logo.png')!.async('uint8array'))).toEqual([1, 2, 3]);
  });
  it('rejects version collisions and traversal names', async () => {
    const app = await importAppPackage(await (await fixture()).generateAsync({ type: 'uint8array' }));
    for (const version of ['1.0.0', '..', '../escape', '']) {
      expect(generatePackageVersion(app, app.versions[0], { ...app.meta, version }, 'services: {}').success).toBe(false);
    }
  });
  it('requires a single valid application and complete version', async () => {
    await expect(importAppPackage(new Uint8Array([1, 2]))).rejects.toThrow();
    const zip = await fixture();
    zip.file('other/data.yml', 'name: Other');
    await expect(importAppPackage(await zip.generateAsync({ type: 'uint8array' }))).rejects.toThrow();
    zip.remove('other');
    zip.remove('apps/demo/1.0.0/data.yml');
    await expect(importAppPackage(await zip.generateAsync({ type: 'uint8array' }))).rejects.toThrow();
    zip.file('apps/demo/1.0.0/data.yml', 'broken: [');
    await expect(importAppPackage(await zip.generateAsync({ type: 'uint8array' }))).rejects.toThrow();
  });
  it('rejects traversal and supports choosing another source version', async () => {
    const zip = await fixture();
    zip.file('apps/demo/0.9.0/docker-compose.yml', 'services:\n  web:\n    image: demo:old\n');
    zip.file('apps/demo/0.9.0/data.yml', 'additionalProperties:\n  formFields: []');
    const app = await importAppPackage(await zip.generateAsync({ type: 'uint8array' }));
    expect(app.versions).toEqual(['1.0.0', '0.9.0']);
    const result = generatePackageVersion(app, '0.9.0', app.meta, 'services:\n  web:\n    image: demo:new\n');
    expect(result.files.find(file => file.path === '1.0.1/data.yml')?.content).toContain('formFields: []');
    zip.file('apps/demo/../escape.txt', 'unsafe');
    await expect(importAppPackage(await zip.generateAsync({ type: 'uint8array' }))).rejects.toThrow('Unsafe');
  });
});


describe('expanded package budget', () => {
  it('rejects compressed oversized root metadata before parsing YAML', async () => {
    const zip = await fixture();
    zip.file('apps/demo/data.yml', 'additionalProperties:\n  name: ' + 'x'.repeat(2 * 1024 * 1024));
    const bytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
    expect(bytes.length).toBeLessThan(50000);
    const outcome = await importAppPackage(bytes).then(() => 'accepted', error => String(error.message));
    expect(outcome).toContain('metadata exceeds');
  });
});
