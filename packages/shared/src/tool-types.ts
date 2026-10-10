// 工具分类
export type ToolCategory =
  | 'crypto'
  | 'converter'
  | 'web'
  | 'developer'
  | 'network'
  | 'text'
  | 'data'
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'math'
  | 'measurement'
  | 'generator'
  | 'network-test'
  | 'platform';

// 工具标签
export type ToolTag =
  | 'browser'        // 纯浏览器运行
  | 'backend'        // 需要后端
  | 'file-upload'    // 需要文件上传
  | 'lazy-load'      // 大型依赖需按需加载
  | 'worker'         // 使用 Web Worker
  | 'clipboard'      // 剪贴板操作
  | 'media'          // 媒体处理
  | 'converter'      // 格式转换
  | 'generator'      // 内容生成
  | 'validator'      // 数据校验
  | 'calculator'     // 计算工具
  | 'parser'         // 解析工具
  | 'encoder'        // 编解码
  | 'security'       // 安全相关
  | 'productivity'   // 生产力
  | 'text'           // 文本处理
  | 'csv'            // CSV 处理
  | 'list'           // 列表操作
  | 'json'           // JSON 处理
  | 'xml'            // XML 处理
  | 'math'           // 数学计算
  | 'time'           // 时间工具
  | 'number'         // 数字工具
  | 'statistics'     // 统计工具
  | 'random'         // 随机生成
  | 'filter'         // 过滤工具
  | 'check'          // 检查验证
  | 'extract'        // 提取工具
  | 'debug'          // 调试工具
  | 'discord'        // Discord 工具
  | 'tsv'            // TSV 处理
  | 'yaml'           // YAML 处理
  | 'toml'           // TOML 处理
  | 'developer'      // 开发者工具
  | 'network';       // 网络工具

// 工具定义接口
export interface ToolDefinition {
  name: string;               // 显示名称（i18n key）
  path: string;               // URL 路径（如 /hash-text）
  description: string;        // 描述（i18n key）
  category: ToolCategory;     // 主分类
  tags: ToolTag[];            // 功能标签
  keywords: string[];         // 搜索关键词
  aliases?: string[];         // 别名（用于搜索和重定向）
  component: () => Promise<any>;  // 懒加载组件
  icon?: string;              // 图标名称
  createdAt?: Date;           // 创建时间（用于判断是否新工具）
  redirectFrom?: string[];    // 历史 URL 重定向
  isNew?: boolean;            // 是否新工具（自动计算）
  isExternal?: boolean;       // 是否依赖外部服务
  externalDeps?: string[];    // 外部依赖说明
  runtimeLocation: 'browser' | 'backend' | 'hybrid';  // 运行位置
}

// 工具分类（带翻译）
export interface ToolCategoryDefinition {
  name: ToolCategory;
  label: string;              // i18n key
  icon: string;
  description: string;        // i18n key
  order: number;
}

// 用户偏好
export interface UserPreferences {
  version: number;
  language: string;
  theme: 'light' | 'dark' | 'system';
  favorites: string[];        // 工具 path 列表
  recentTools: { path: string; timestamp: number }[];
  settings: Record<string, unknown>;
}

// API 响应
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// 分享报告
export interface ShareReport {
  id: string;
  content: string;
  createdAt: number;
  expiresAt: number;
  title?: string;
}
