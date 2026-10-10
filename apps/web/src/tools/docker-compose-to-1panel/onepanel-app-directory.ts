import yaml from 'js-yaml';
import { convertDockerComposeTo1panel, type PortParam } from './docker-compose-to-1panel.service';

export interface AppMetadata {
  key: string;
  name: string;
  descEn: string;
  descZh: string;
  tags: string[];
  type: string;
  version: string;
  architectures: string[];
}

export interface DirectoryFile {
  path: string;
  content: string;
}

export interface GeneratedAppDirectory {
  success: boolean;
  files: DirectoryFile[];
  portParams: PortParam[];
  error?: string;
}

// 1Panel appstore tag values with their Chinese labels (root data.yml shows
// the Chinese labels, additionalProperties carries the English values).
export const TAG_OPTIONS: { value: string; zh: string }[] = [
  { value: 'Website', zh: '建站' },
  { value: 'Database', zh: '数据库' },
  { value: 'Server', zh: 'Web 服务器' },
  { value: 'Runtime', zh: '运行环境' },
  { value: 'Tool', zh: '实用工具' },
  { value: 'Storage', zh: '云存储' },
  { value: 'AI', zh: 'AI' },
  { value: 'BI', zh: 'BI' },
  { value: 'CRM', zh: 'CRM' },
  { value: 'Security', zh: '安全' },
  { value: 'DevTool', zh: '开发工具' },
  { value: 'DevOps', zh: 'DevOps' },
  { value: 'Middleware', zh: '中间件' },
  { value: 'Media', zh: '多媒体' },
  { value: 'Email', zh: '邮件服务' },
  { value: 'Game', zh: '休闲游戏' },
  { value: 'Local', zh: '本地' },
];

export const TYPE_OPTIONS = ['website', 'runtime', 'tool'] as const;

export const ARCHITECTURE_OPTIONS = [
  'amd64',
  'arm64',
  'arm/v7',
  'arm/v6',
  'arm/v5',
  'loong64',
  'mips64',
  'mips64le',
  'ppc64le',
  'riscv64',
  's390x',
  '386',
] as const;

export function sanitizeAppKey(key: string): string {
  const cleaned = key.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
  return cleaned || 'my-app';
}

export function sanitizeVersion(version: string): string {
  const cleaned = version.trim().replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || '1.0.0';
}

function zhTagLabel(value: string): string {
  return TAG_OPTIONS.find(tag => tag.value === value)?.zh ?? value;
}

export function buildRootDataYml(meta: AppMetadata): string {
  const title = meta.descZh.trim() || meta.name.trim() || meta.key;
  const shortDescZh = meta.descZh.trim() || meta.name.trim();
  const shortDescEn = meta.descEn.trim() || meta.name.trim();
  const name = meta.name.trim() || meta.key;

  return yaml.dump(
    {
      name,
      tags: meta.tags.map(zhTagLabel),
      title,
      description: {
        en: meta.descEn.trim(),
        zh: meta.descZh.trim(),
      },
      additionalProperties: {
        key: sanitizeAppKey(meta.key),
        name,
        tags: meta.tags,
        shortDescZh,
        shortDescEn,
        type: meta.type,
        crossVersionUpdate: true,
        limit: 0,
        architectures: meta.architectures,
      },
    },
    { indent: 2, lineWidth: 120, noRefs: true, sortKeys: false },
  );
}

export function buildVersionDataYml(portParams: PortParam[]): string {
  const formFields = portParams.map(param => ({
    default: param.default,
    edit: true,
    envKey: param.envKey,
    labelEn: param.labelEn,
    labelZh: param.labelZh,
    required: true,
    rule: 'paramPort',
    type: 'number',
  }));

  return yaml.dump(
    { additionalProperties: { formFields } },
    { indent: 2, lineWidth: 120, noRefs: true, sortKeys: false },
  );
}

export function defaultReadme(meta: AppMetadata): string {
  const name = meta.name.trim() || meta.key;
  const sections = [`# ${name}`, ''];
  if (meta.descZh.trim()) sections.push(meta.descZh.trim(), '');
  if (meta.descEn.trim()) sections.push('## English', '', meta.descEn.trim(), '');
  return `${sections.join('\n')}\n`;
}

export function generateAppDirectory(input: string, meta: AppMetadata): GeneratedAppDirectory {
  const converted = convertDockerComposeTo1panel(input);
  if (!converted.success) {
    return { success: false, files: [], portParams: [], error: converted.error };
  }

  const version = sanitizeVersion(meta.version);
  const portParams = converted.portParams ?? [];

  return {
    success: true,
    portParams,
    files: [
      { path: 'data.yml', content: buildRootDataYml(meta) },
      { path: 'README.md', content: defaultReadme(meta) },
      { path: `versions/${version}/docker-compose.yml`, content: converted.output },
      { path: `versions/${version}/data.yml`, content: buildVersionDataYml(portParams) },
    ],
  };
}

export interface AppLogo {
  fileName: string;
  blob: Blob;
}

export async function buildAppZip(appKey: string, files: DirectoryFile[], logo: AppLogo | null): Promise<Blob> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const root = zip.folder(appKey);
  if (!root) throw new Error('failed to create zip root folder');

  for (const file of files) {
    root.file(file.path, file.content);
  }
  if (logo) {
    root.file(logo.fileName, logo.blob);
  }

  return zip.generateAsync({ type: 'blob' });
}
