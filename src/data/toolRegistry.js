import {
  Lock,
  Type,
  Terminal,
  Shuffle,
  Eye,
  ScanSearch,
  FileText,
  FileCode,
  Image,
  Zap,
  FolderTree,
  Code2,
  ArrowLeftRight,
  Clock,
} from 'lucide-react';

/**
 * 规范化工具分类定义
 */
export const CATEGORIES = [
  { id: 'elanguage', label: '易语言开发', icon: Code2 },
  { id: 'crypto', label: '安全与密码', icon: Lock },
  { id: 'text', label: '文本与处理', icon: Type },
  { id: 'dev', label: '实用开发辅助', icon: Terminal },
];

/**
 * 规范化工具注册表
 */
export const TOOLS = [
  // ── 易语言开发类 ──
  {
    id: 'curl-to-e',
    category: 'elanguage',
    name: 'cURL / 抓包转易语言',
    aliases: ['curl', 'curl转易语言', 'fiddler', 'reqable', '抓包', '易语言代码', '精易模块', 'zjson'],
    icon: Zap,
    desc: 'cURL、Fiddler、Reqable 抓包智能转易语言代码 & 参数明细拆解',
  },
  {
    id: 'json-tree',
    category: 'elanguage',
    name: 'JSON 树形解析 & ZJSON',
    aliases: ['json树', 'jsonpath', 'zjson', 'json树形解析', '易语言json', 'zjson取值'],
    icon: FolderTree,
    desc: 'JSON 树形节点解析、JSONPath 提取与 ZJSON 易语言代码生成',
  },
  {
    id: 'encode-e',
    category: 'elanguage',
    name: '多进制与编码转换',
    aliases: ['编码', 'url编码', 'base64', 'unicode', 'hex', '16进制', '易语言编码'],
    icon: ArrowLeftRight,
    desc: 'URL / Base64 / Unicode / Hex 16进制转换及易语言代码提示',
  },
  {
    id: 'crypto-e',
    category: 'elanguage',
    name: '加解密与哈希套件',
    aliases: ['md5', 'sha1', 'sha256', 'hmac', 'aes', 'des', '3des', 'rc4', 'rabbit', '哈希', '加密'],
    icon: Lock,
    desc: 'MD5 16/32位、SHA全集、HMAC全集、AES/DES/3DES/RC4对称加解密',
  },
  {
    id: 'timestamp-e',
    category: 'elanguage',
    name: 'Unix 时间戳转换',
    aliases: ['时间戳', 'timestamp', '10位时间戳', '13位时间戳', '北京时间', 'unix时间'],
    icon: Clock,
    desc: '10位/13位 Unix 时间戳与北京时间实时双向转换',
  },

  // ── 安全与密码类 ──
  {
    id: 'uuid-generator',
    category: 'crypto',
    name: 'UUID / GUID 生成器',
    aliases: ['uuid', 'guid', 'uuid生成', 'uuid v4', '随机id'],
    icon: Shuffle,
    desc: '批量生成标准 UUID v4 / GUID，支持大小写与格式转换',
  },
  {
    id: 'password-generator',
    category: 'crypto',
    name: '强随机密码生成器',
    aliases: ['密码', '随机密码', '密码生成', 'password', '密码生成器'],
    icon: Eye,
    desc: '可配置字符类型、长度与熵值强度的随机安全密码',
  },

  // ── 文本与处理类 ──
  {
    id: 'regex-tester',
    category: 'text',
    name: '正则表达式测试器',
    aliases: ['正则', 'regex', '正则表达式', '正则测试', 'regexp', 're'],
    icon: ScanSearch,
    desc: '正则实时匹配高亮、捕获组拆解、文本替换与常用模板速查',
  },
  {
    id: 'text-diff',
    category: 'text',
    name: '文本差异对比 (Diff)',
    aliases: ['diff', '对比', '文本对比', '差异', '比较'],
    icon: FileText,
    desc: '两段文本逐行/逐字差异对比与高亮分析',
  },
  {
    id: 'markdown-preview',
    category: 'text',
    name: 'Markdown 实时渲染',
    aliases: ['markdown', 'md', 'markdown预览', 'md预览', 'markdown渲染'],
    icon: FileCode,
    desc: 'Markdown 文本实时渲染预览与 HTML 输出',
  },

  // ── 实用开发辅助类 ──
  {
    id: 'qrcode',
    category: 'dev',
    name: '二维码生成与解码',
    aliases: ['二维码', 'qrcode', 'qr码', 'qr生成', 'qr解码', '扫码'],
    icon: Image,
    desc: '二维码可视化生成、样式定制与图片扫码识别解码',
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
