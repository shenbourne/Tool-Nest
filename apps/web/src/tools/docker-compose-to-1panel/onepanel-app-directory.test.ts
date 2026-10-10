import { describe, expect, it } from 'vitest';
import {
  buildAppZip,
  buildRootDataYml,
  buildVersionDataYml,
  defaultReadme,
  generateAppDirectory,
  sanitizeAppKey,
  sanitizeVersion,
  type AppMetadata,
} from './onepanel-app-directory';

const META: AppMetadata = {
  key: 'My App!',
  name: 'My App',
  descEn: 'English description',
  descZh: '中文描述',
  tags: ['Tool', 'DevTool'],
  type: 'tool',
  version: '1.0.0',
  architectures: ['amd64', 'arm64'],
};

const COMPOSE = `services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"
`;

describe('sanitizeAppKey / sanitizeVersion', () => {
  it('normalizes the app key to a Linux folder name', () => {
    expect(sanitizeAppKey('My App!')).toBe('my-app');
    expect(sanitizeAppKey('  ')).toBe('my-app');
    expect(sanitizeAppKey('already-fine_2')).toBe('already-fine-2');
  });

  it('falls back to a default version when empty or unsafe', () => {
    expect(sanitizeVersion('  ')).toBe('1.0.0');
    expect(sanitizeVersion('v2.0/beta')).toBe('v2.0-beta');
  });
});

describe('generateAppDirectory', () => {
  it('emits the official appstore layout under versions/', () => {
    const result = generateAppDirectory(COMPOSE, META);
    expect(result.success).toBe(true);
    expect(result.files.map(f => f.path)).toEqual([
      'data.yml',
      'README.md',
      'versions/1.0.0/docker-compose.yml',
      'versions/1.0.0/data.yml',
    ]);
  });

  it('root data.yml carries Chinese labels and English tag values', () => {
    const root = generateAppDirectory(COMPOSE, META).files.find(f => f.path === 'data.yml');
    expect(root?.content).toContain('key: my-app');
    expect(root?.content).toContain('- 实用工具');
    expect(root?.content).toContain('- 开发工具');
    expect(root?.content).toContain('tags:');
    expect(root?.content).toContain('- Tool');
    expect(root?.content).toContain('type: tool');
  });

  it('version data.yml lists one formField per parametrized port', () => {
    const result = generateAppDirectory(COMPOSE, META);
    const versionData = result.files.find(f => f.path === 'versions/1.0.0/data.yml');
    expect(versionData?.content).toContain('envKey: PANEL_APP_PORT_HTTP');
    expect(versionData?.content).toContain("default: '8080'");
    expect(versionData?.content).toContain('rule: paramPort');
  });

  it('propagates compose conversion errors', () => {
    const result = generateAppDirectory('services: [unclosed', META);
    expect(result.success).toBe(false);
    expect(result.files).toEqual([]);
    expect(result.error).toBeTruthy();
  });
});

describe('buildVersionDataYml', () => {
  it('emits an empty formFields list when there are no ports', () => {
    const output = buildVersionDataYml([]);
    expect(output).toContain('formFields: []');
  });
});

describe('buildRootDataYml / defaultReadme fallbacks', () => {
  it('falls back to the name when descriptions are empty', () => {
    const meta: AppMetadata = { ...META, descEn: '', descZh: '' };
    const root = buildRootDataYml(meta);
    expect(root).toContain('title: My App');
    expect(root).toContain('shortDescZh: My App');
    expect(root).toContain('shortDescEn: My App');
    expect(defaultReadme(meta)).toBe('# My App\n\n');
  });
});

describe('buildAppZip', () => {
  it('packs every file under the app key root, including the logo', async () => {
    const { default: JSZip } = await import('jszip');
    const files = generateAppDirectory(COMPOSE, META).files;
    const zipBlob = await buildAppZip('my-app', files, {
      fileName: 'logo.png',
      blob: new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }),
    });

    const zip = await JSZip.loadAsync(await zipBlob.arrayBuffer());
    const names = Object.keys(zip.files).sort();
    expect(names).toEqual([
      'my-app/',
      'my-app/README.md',
      'my-app/data.yml',
      'my-app/logo.png',
      'my-app/versions/',
      'my-app/versions/1.0.0/',
      'my-app/versions/1.0.0/data.yml',
      'my-app/versions/1.0.0/docker-compose.yml',
    ]);

    const compose = await zip.files['my-app/versions/1.0.0/docker-compose.yml'].async('string');
    expect(compose).toContain('${PANEL_APP_PORT_HTTP}:80');
    const logo = await zip.files['my-app/logo.png'].async('uint8array');
    expect(Array.from(logo)).toEqual([1, 2, 3]);
  });

  it('omits the logo entry when none was uploaded', async () => {
    const { default: JSZip } = await import('jszip');
    const files = generateAppDirectory(COMPOSE, META).files;
    const zipBlob = await buildAppZip('my-app', files, null);
    const zip = await JSZip.loadAsync(await zipBlob.arrayBuffer());
    expect(Object.keys(zip.files).some(name => name.includes('logo.png'))).toBe(false);
  });
});
