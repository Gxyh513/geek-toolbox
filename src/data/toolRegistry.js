import {
  Hash,
  Lock,
  Type,
  FileCode,
  Terminal,
  Globe,
  Shuffle,
  Clock,
  Palette,
  Wifi,
  Code,
  Braces,
  KeyRound,
  FileText,
  ScanSearch,
  ArrowLeftRight,
  Image,
  Shapes,
  Smartphone,
  ScanLine,
  DollarSign,
  Eye,
  PenTool,
} from 'lucide-react';

/**
 * 工具分类定义
 */
export const CATEGORIES = [
  { id: 'encode', label: '编码转换', icon: Code },
  { id: 'crypto', label: '加密哈希', icon: Lock },
  { id: 'text', label: '文本处理', icon: Type },
  { id: 'time', label: '时间日期', icon: Clock },
  { id: 'dev', label: '开发辅助', icon: Terminal },
  { id: 'network', label: '网络相关', icon: Globe },
];

/**
 * 工具注册表
 * 每个工具包含：
 *   id        - 唯一标识，用于路由 `/tool/:id`
 *   category  - 所属分类 id
 *   name      - 显示名称
 *   aliases   - 搜索别名
 *   icon      - lucide 图标组件
 *   desc      - 简短描述
 *   component - 工具页面组件（懒加载路径）
 */
export const TOOLS = [
  // ── 编码转换类 ──
  {
    id: 'base64',
    category: 'encode',
    name: 'Base64 编解码',
    aliases: ['base64', 'base64编码', 'base64解码', 'base64encode', 'base64decode'],
    icon: FileCode,
    desc: 'Base64 编码与解码，支持 UTF-8',
  },
  {
    id: 'url-encode',
    category: 'encode',
    name: 'URL 编解码',
    aliases: ['url编码', 'url解码', 'urlencode', 'urldecode', 'percent编码'],
    icon: Globe,
    desc: 'URL 参数编码与解码',
  },
  {
    id: 'json-formatter',
    category: 'encode',
    name: 'JSON 格式化',
    aliases: ['json', 'json格式化', 'json压缩', 'json校验', 'json验证', 'json美化'],
    icon: Braces,
    desc: 'JSON 格式化、压缩与语法校验',
  },
  {
    id: 'jwt-parser',
    category: 'encode',
    name: 'JWT 解析',
    aliases: ['jwt', 'token解析', 'jwt解析', 'jwt解码'],
    icon: KeyRound,
    desc: '解析 JWT Token 的 Header、Payload',
  },
  {
    id: 'unicode',
    category: 'encode',
    name: 'Unicode 转换',
    aliases: ['unicode', '\\u编码', 'unicode转中文', '中文转unicode', 'escape'],
    icon: ArrowLeftRight,
    desc: '中文与 \\uXXXX 互转',
  },

  // ── 加密哈希类 ──
  {
    id: 'hash',
    category: 'crypto',
    name: '哈希计算',
    aliases: ['md5', 'sha1', 'sha256', 'sha512', '哈希', 'hash', '摘要'],
    icon: Hash,
    desc: 'MD5 / SHA1 / SHA256 / SHA512 计算',
  },
  {
    id: 'hmac',
    category: 'crypto',
    name: 'HMAC 生成',
    aliases: ['hmac', 'hmac-md5', 'hmac-sha1', 'hmac-sha256', '消息认证码'],
    icon: Lock,
    desc: 'HMAC-MD5 / HMAC-SHA1 / HMAC-SHA256',
  },
  {
    id: 'uuid-generator',
    category: 'crypto',
    name: 'UUID 生成器',
    aliases: ['uuid', 'guid', 'uuid生成', 'uuid v4', '随机id'],
    icon: Shuffle,
    desc: '批量生成 UUID v4，支持大小写',
  },
  {
    id: 'password-generator',
    category: 'crypto',
    name: '随机密码',
    aliases: ['密码', '随机密码', '密码生成', 'password', '密码生成器'],
    icon: Eye,
    desc: '可配置的强密码生成器',
  },

  // ── 文本处理类 ──
  {
    id: 'regex-tester',
    category: 'text',
    name: '正则测试器',
    aliases: ['正则', 'regex', '正则表达式', '正则测试', 'regexp', 're'],
    icon: ScanSearch,
    desc: '正则表达式实时匹配测试，含常用速查表',
  },
  {
    id: 'text-diff',
    category: 'text',
    name: '文本 Diff',
    aliases: ['diff', '对比', '文本对比', '差异', '比较'],
    icon: FileText,
    desc: '两段文本的差异对比',
  },
  {
    id: 'case-converter',
    category: 'text',
    name: '大小写转换',
    aliases: ['大小写', '驼峰', 'camelCase', 'snake_case', 'kebab-case', 'PascalCase'],
    icon: PenTool,
    desc: '驼峰/蛇形/中划线/大小写互转',
  },
  {
    id: 'markdown-preview',
    category: 'text',
    name: 'Markdown 预览',
    aliases: ['markdown', 'md', 'markdown预览', 'md预览', 'markdown渲染'],
    icon: FileCode,
    desc: 'Markdown 实时渲染预览',
  },

  // ── 时间日期类 ──
  {
    id: 'timestamp',
    category: 'time',
    name: '时间戳转换',
    aliases: ['时间戳', 'timestamp', 'unix时间', '日期转时间戳', '时间戳转日期'],
    icon: Clock,
    desc: 'Unix 时间戳与日期互相转换',
  },
  {
    id: 'cron-parser',
    category: 'time',
    name: 'Cron 解析',
    aliases: ['cron', '定时任务', 'cron表达式', 'crontab', '计划任务'],
    icon: ScanLine,
    desc: 'Cron 表达式解析与可读化',
  },
  {
    id: 'timezone',
    category: 'time',
    name: '时区换算',
    aliases: ['时区', 'timezone', '时区转换', '世界时间', 'UTC'],
    icon: Globe,
    desc: '多时区时间换算',
  },

  // ── 开发辅助类 ──
  {
    id: 'color-picker',
    category: 'dev',
    name: '颜色转换',
    aliases: ['颜色', 'color', 'hex', 'rgb', 'hsl', '颜色选择', '颜色转换'],
    icon: Palette,
    desc: 'HEX / RGB / HSL 颜色格式互转与选色',
  },
  {
    id: 'gradient-generator',
    category: 'dev',
    name: '渐变生成器',
    aliases: ['渐变', 'gradient', 'css渐变', '线性渐变', '径向渐变', '背景渐变'],
    icon: Shapes,
    desc: 'CSS 线性/径向渐变可视化生成',
  },
  {
    id: 'regex-visualizer',
    category: 'dev',
    name: '正则可视化',
    aliases: ['正则可视化', 'regex可视化', '正则图', 'regexp可视化'],
    icon: ScanSearch,
    desc: '正则表达式结构可视化展示',
  },
  {
    id: 'qrcode',
    category: 'dev',
    name: '二维码',
    aliases: ['二维码', 'qrcode', 'qr码', 'qr生成', 'qr解码', '扫码'],
    icon: Image,
    desc: '二维码生成与解码',
  },

  // ── 网络相关类 ──
  {
    id: 'ip-lookup',
    category: 'network',
    name: 'IP 查询',
    aliases: ['ip', 'ip查询', '我的ip', '本机ip', 'ip地址'],
    icon: Wifi,
    desc: '展示本机 IP 地址信息',
  },
  {
    id: 'ua-parser',
    category: 'network',
    name: 'UA 解析',
    aliases: ['ua', 'user-agent', 'useragent', '浏览器标识', '设备信息'],
    icon: Smartphone,
    desc: '解析 User-Agent 浏览器/设备信息',
  },
  {
    id: 'dns-lookup',
    category: 'network',
    name: 'DNS 查询',
    aliases: ['dns', '域名解析', 'nslookup', 'dig', '域名查询'],
    icon: Globe,
    desc: 'DNS 记录查询演示（纯前端模拟）',
  },
];

/**
 * 根据分类 ID 获取该分类下的工具列表
 */
export function getToolsByCategory(categoryId) {
  return TOOLS.filter((t) => t.category === categoryId);
}

/**
 * 根据工具 ID 获取工具定义
 */
export function getToolById(id) {
  return TOOLS.find((t) => t.id === id);
}

/**
 * 模糊搜索工具
 */
export function searchTools(query) {
  const q = query.toLowerCase().trim();
  if (!q) return TOOLS;
  return TOOLS.filter(
    (t) =>
      t.id.includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.aliases.some((a) => a.includes(q))
  );
}

/**
 * 快速获取最近使用的工具 ID 列表（从 localStorage）
 */
export function getRecentTools(max = 6) {
  try {
    const raw = localStorage.getItem('geek-toolbox-recent');
    if (!raw) return [];
    const ids = JSON.parse(raw);
    return ids.slice(0, max).map((id) => getToolById(id)).filter(Boolean);
  } catch {
    return [];
  }
}

export function recordToolUsage(toolId) {
  try {
    const raw = localStorage.getItem('geek-toolbox-recent');
    let ids = raw ? JSON.parse(raw) : [];
    ids = [toolId, ...ids.filter((id) => id !== toolId)].slice(0, 20);
    localStorage.setItem('geek-toolbox-recent', JSON.stringify(ids));
  } catch {}
}

/**
 * 所有工具的扁平 IDs（用于路由等）
 */
export const ALL_TOOL_IDS = TOOLS.map((t) => t.id);
