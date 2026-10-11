import yaml from 'js-yaml';
import { TAG_OPTIONS, defaultReadme, sanitizeVersion, sanitizeAppKey, type AppMetadata, type GeneratedAppDirectory } from './onepanel-app-directory';

export interface PackageAsset { path: string; content: Uint8Array }
export interface ImportedAppPackage {
  meta: AppMetadata;
  rootData: Record<string, unknown>;
  assets: PackageAsset[];
  versions: string[];
}

const decoder = new TextDecoder();
function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function text(value: unknown, fallback = ''): string { return typeof value === 'string' ? value : fallback; }
function strings(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []; }
export function packageText(app: ImportedAppPackage, path: string): string {
  const asset = app.assets.find(file => file.path === path);
  if (!asset) throw new Error(`Missing ${path}`);
  return decoder.decode(asset.content);
}

export async function importAppPackage(bytes: Uint8Array): Promise<ImportedAppPackage> {
  if (bytes.length > 50 * 1024 * 1024) throw new Error('Package exceeds 50 MB');
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(bytes);
  const entries = Object.values(zip.files).filter(file => !file.dir && !file.name.startsWith('__MACOSX/'));
  if (entries.length > 2000) throw new Error('Too many files');
  for (const entry of entries) {
    const original = entry.unsafeOriginalName ?? entry.name;
    if (original !== entry.name || /\\|^\/|^[a-z]:/i.test(original) || original.split('/').some(part => ['..', '.', ''].includes(part))) {
      throw new Error('Unsafe package path');
    }
  }
  const roots = entries.filter(file => /(^|\/)data\.yml$/.test(file.name) &&
    entries.some(other => other.name.startsWith(file.name.slice(0, -8)) &&
      /^(?:versions\/)?[^/]+\/docker-compose\.yml$/.test(other.name.slice(file.name.length - 8))));
  if (roots.length !== 1) throw new Error('Select a ZIP containing one application');
  const prefix = roots[0].name.slice(0, -8);
  const rootData = record(yaml.load(await roots[0].async('string')));
  const properties = record(rootData.additionalProperties);
  if (!Object.keys(properties).length) throw new Error('Missing application metadata');
  const assets: PackageAsset[] = [];
  let total = 0;
  for (const entry of entries) {
    if (!entry.name.startsWith(prefix)) throw new Error('ZIP contains multiple application roots');
    const content = await entry.async('uint8array');
    total += content.length;
    if (total > 100 * 1024 * 1024) throw new Error('Expanded package exceeds 100 MB');
    assets.push({ path: entry.name.slice(prefix.length), content });
  }
  const versions = assets.filter(file => /^(?:versions\/)?[^/]+\/docker-compose\.yml$/.test(file.path))
    .map(file => file.path.slice(0, -19)).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  if (!versions.length || versions.some(version => !assets.some(file => file.path === `${version}/data.yml`))) {
    throw new Error('Missing version configuration');
  }
  for (const version of versions) {
    const compose = assets.find(file => file.path === `${version}/docker-compose.yml`)!;
    const configuration = assets.find(file => file.path === `${version}/data.yml`)!;
    if (!Object.keys(record(record(yaml.load(decoder.decode(compose.content))).services)).length ||
      !Object.keys(record(record(yaml.load(decoder.decode(configuration.content))).additionalProperties)).length) {
      throw new Error('Invalid version configuration');
    }
  }
  const descriptions = record(properties.description);
  const rootDescriptions = record(rootData.description);
  const sourceVersion = versions[0].split('/').at(-1)!;
  let version = /^\d+\.\d+\.\d+$/.test(sourceVersion)
    ? sourceVersion.replace(/\d+$/, number => String(Number(number) + 1)) : `${sourceVersion}-new`;
  while (versions.some(item => item.split('/').at(-1) === version)) version += '-new';
  const meta: AppMetadata = {
    key: text(properties.key, prefix.split('/').filter(Boolean).at(-1) ?? 'my-app'),
    name: text(properties.name, text(rootData.name)),
    descZh: text(properties.shortDescZh, text(descriptions.zh, text(rootDescriptions.zh, text(rootData.description)))),
    descEn: text(properties.shortDescEn, text(descriptions.en, text(rootDescriptions.en))),
    tags: strings(properties.tags).length ? strings(properties.tags) : strings(rootData.tags).map(tag => TAG_OPTIONS.find(item => item.zh === tag)?.value ?? tag),
    type: text(properties.type, 'tool'), architectures: strings(properties.architectures), version,
  };
  return { meta, rootData, assets, versions };
}

export function newVersionPath(source: string, version: string): string {
  return `${source.startsWith('versions/') ? 'versions/' : ''}${version}`;
}

export function generatePackageVersion(app: ImportedAppPackage, source: string, meta: AppMetadata, compose: string): GeneratedAppDirectory {
  try {
    const version = meta.version.trim();
    if (!version || version === '.' || version === '..' || sanitizeVersion(version) !== version ||
      app.versions.some(item => item.split('/').at(-1) === version) ||
      app.assets.some(file => file.path.startsWith(`${newVersionPath(source, version)}/`)) || !app.versions.includes(source)) {
      throw new Error('Use a valid new version that does not exist in the package');
    }
    const parsed = record(yaml.load(compose));
    if (!Object.keys(record(parsed.services)).length) throw new Error('Compose must contain services');
    const root = record(yaml.load(packageText(app, 'data.yml')));
    const properties = record(root.additionalProperties);
    Object.assign(root, { name: meta.name, title: meta.descZh || meta.name, tags: meta.tags.map(tag => TAG_OPTIONS.find(item => item.value === tag)?.zh ?? tag) });
    root.description = typeof root.description === 'string' ? meta.descZh : { ...record(root.description), zh: meta.descZh, en: meta.descEn };
    Object.assign(properties, { key: sanitizeAppKey(meta.key), name: meta.name, tags: meta.tags, shortDescZh: meta.descZh, shortDescEn: meta.descEn, type: meta.type, architectures: meta.architectures });
    if (properties.description) properties.description = { ...record(properties.description), zh: meta.descZh, en: meta.descEn };
    root.additionalProperties = properties;
    const destination = newVersionPath(source, version);
    return { success: true, portParams: [], files: [
      { path: 'data.yml', content: yaml.dump(root, { noRefs: true, lineWidth: 120 }) },
      { path: 'README.md', content: app.assets.some(file => file.path === 'README.md') ? packageText(app, 'README.md') : defaultReadme(meta) },
      { path: `${destination}/docker-compose.yml`, content: compose },
      { path: `${destination}/data.yml`, content: packageText(app, `${source}/data.yml`) },
    ] };
  } catch (error) {
    return { success: false, files: [], portParams: [], error: error instanceof Error ? error.message : 'Invalid application package' };
  }
}

export function packageAssets(app: ImportedAppPackage, source: string, version: string): PackageAsset[] {
  const destination = newVersionPath(source, version.trim());
  return [...app.assets, ...app.assets.filter(file => file.path.startsWith(`${source}/`))
    .map(file => ({ ...file, path: `${destination}/${file.path.slice(source.length + 1)}` }))];
}
