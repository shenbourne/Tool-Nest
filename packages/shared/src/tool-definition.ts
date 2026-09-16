import type { ToolDefinition, ToolCategory, ToolTag } from './tool-types';

interface DefineToolOptions {
  name: string;
  path: string;
  description: string;
  category: ToolCategory;
  tags: ToolTag[];
  keywords: string[];
  component: () => Promise<any>;
  icon?: string;
  aliases?: string[];
  createdAt?: string;  // ISO date string
  redirectFrom?: string[];
  isExternal?: boolean;
  externalDeps?: string[];
  runtimeLocation?: 'browser' | 'backend' | 'hybrid';
}

export function defineTool(options: DefineToolOptions): ToolDefinition {
  const createdAt = options.createdAt ? new Date(options.createdAt) : undefined;
  const isNew = createdAt
    ? (Date.now() - createdAt.getTime()) < 14 * 24 * 60 * 60 * 1000  // 2 weeks
    : false;

  return {
    name: options.name,
    path: options.path.startsWith('/') ? options.path : `/${options.path}`,
    description: options.description,
    category: options.category,
    tags: options.tags,
    keywords: options.keywords,
    aliases: options.aliases,
    component: options.component,
    icon: options.icon,
    createdAt,
    redirectFrom: options.redirectFrom,
    isNew,
    isExternal: options.isExternal ?? false,
    externalDeps: options.externalDeps,
    runtimeLocation: options.runtimeLocation ?? 'browser',
  };
}
