import { useState, useMemo, useRef } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { showToast } from '../../components/ui/Toast';
import {
  Code2,
  ListCheck,
  Replace,
  Sparkles,
  Trash2,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const TOOL_ID = 'regex-tester';

// 常用正则预设模板
const PRESETS = [
  {
    name: '电子邮箱 (Email)',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    flags: 'g',
    text: 'test.user@domain.com\ninvalid_email@.com\nhello_world-123@sub.example.co.uk',
  },
  {
    name: '中国手机号码 (Mobile)',
    pattern: '^1[3-9]\\d{9}$',
    flags: 'gm',
    text: '13812345678\n19987654321\n12000000000\n15901010101',
  },
  {
    name: '身份证号 (18位)',
    pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]$',
    flags: 'gm',
    text: '110101199003072345\n44030120000101888X\n123456789012345678',
  },
  {
    name: 'IPv4 地址',
    pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    flags: 'gm',
    text: '192.168.1.1\n10.0.0.255\n256.100.0.1\n127.0.0.1',
  },
  {
    name: 'URL 网址',
    pattern: 'https?://[w-]+(\\.[w-]+)+[/#?]?.*',
    flags: 'gi',
    text: '访问 https://antigravity.google.com/docs 查看文档\n或者 http://localhost:5173/tool/regex-tester',
  },
  {
    name: '中文字符',
    pattern: '[\\u4e00-\\u9fa5]+',
    flags: 'g',
    text: 'Hello 极客工具箱 Antigravity 正则测试器 2026',
  },
  {
    name: '数字 (整数/小数)',
    pattern: '-?\\d+(\\.\\d+)?',
    flags: 'g',
    text: '数值: 3.14159, -42, 100, 0.005, -0.99',
  },
  {
    name: 'HTML 标签匹配',
    pattern: '<([a-z1-6]+)(?:\\s+[^>]*?)?>(.*?)</\\1>',
    flags: 'gi',
    text: '<div class="card"><h1>标题</h1><p>正文内容...</p></div>',
  },
];

// 正则表达式修饰符 Flag
const FLAGS = [
  { id: 'g', label: 'g', desc: 'Global (全局匹配)' },
  { id: 'i', label: 'i', desc: 'Ignore Case (忽略大小写)' },
  { id: 'm', label: 'm', desc: 'Multiline (多行模式 ^ 和 $ 匹配每行首尾)' },
  { id: 's', label: 's', desc: 'DotAll (点号 . 匹配包含换行符在内的任意字符)' },
  { id: 'u', label: 'u', desc: 'Unicode (启用 Unicode 匹配)' },
  { id: 'y', label: 'y', desc: 'Sticky (粘性匹配仅从 lastIndex 位置开始)' },
];

// 常用语法速查表
const CHEATSHEET = [
  {
    cat: '字符类',
    items: [
      { p: '.', d: '任意字符(除换行)' },
      { p: '\\d', d: '数字 [0-9]' },
      { p: '\\D', d: '非数字 [^0-9]' },
      { p: '\\w', d: '单词字符 [a-zA-Z0-9_]' },
      { p: '\\W', d: '非单词字符' },
      { p: '\\s', d: '空白字符 (空格/Tab/换行)' },
      { p: '\\S', d: '非空白字符' },
      { p: '[abc]', d: '字符集合' },
      { p: '[^abc]', d: '否定字符集合' },
    ],
  },
  {
    cat: '锚点边界',
    items: [
      { p: '^', d: '匹配字符串/行首' },
      { p: '$', d: '匹配字符串/行尾' },
      { p: '\\b', d: '单词边界' },
      { p: '\\B', d: '非单词边界' },
    ],
  },
  {
    cat: '量词匹配',
    items: [
      { p: '*', d: '0 次或多次' },
      { p: '+', d: '1 次或多次' },
      { p: '?', d: '0 次或 1 次' },
      { p: '{n}', d: '恰好 n 次' },
      { p: '{n,}', d: '至少 n 次' },
      { p: '{n,m}', d: 'n 到 m 次' },
      { p: '*?', d: '非贪婪(惰性)匹配' },
    ],
  },
  {
    cat: '分组与引用',
    items: [
      { p: '(...)', d: '捕获分组' },
      { p: '(?:...)', d: '非捕获分组' },
      { p: '(?<name>...)', d: '命名捕获分组' },
      { p: '\\1', d: '反向引用第1个分组' },
      { p: 'a|b', d: '匹配 a 或 b' },
    ],
  },
  {
    cat: '预查/断言',
    items: [
      { p: '(?=...)', d: '正向先行断言' },
      { p: '(?!...)', d: '负向先行断言' },
      { p: '(?<=...)', d: '正向后行断言' },
      { p: '(?<!...)', d: '负向后行断言' },
    ],
  },
];

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState('\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState(
    '欢迎使用极客工具箱！官方邮箱：contact@example.com，客服邮箱：support.help@domain.co.uk，非法格式：invalid-email@.com'
  );
  const [replaceText, setReplaceText] = useState('[REDACTED_EMAIL]');
  const [activeTab, setActiveTab] = useState('highlight'); // 'highlight' | 'groups' | 'replace'
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  const inputRef = useRef(null);

  const toggleFlag = (f) => {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, '') : prev + f));
  };

  // 插入字符到表达式框
  const insertToken = (tok) => {
    setPattern((prev) => prev + tok);
    showToast(`已插入 ${tok}`);
  };

  // 快捷加载预设
  const loadPreset = (preset) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestText(preset.text);
    showToast(`已载入预设：${preset.name}`);
  };

  // 匹配计算中心
  const matchResult = useMemo(() => {
    if (!pattern || !testText) return { matches: [], valid: true, error: null };
    try {
      const activeFlags = flags.includes('g') ? flags : flags + 'g';
      const regex = new RegExp(pattern, activeFlags);
      const matches = [];
      let match;
      let count = 0;

      while ((match = regex.exec(testText)) !== null && count < 3000) {
        const groups = match.slice(1);
        const namedGroups = match.groups || null;
        matches.push({
          index: match.index,
          endIndex: regex.lastIndex,
          fullMatch: match[0],
          groups,
          namedGroups,
        });

        if (!regex.lastIndex) {
          regex.lastIndex++;
        }
        count++;
      }

      return { matches, count: matches.length, valid: true, error: null };
    } catch (e) {
      return { matches: [], count: 0, valid: false, error: e.message };
    }
  }, [pattern, flags, testText]);

  // 高亮渲染分块
  const highlightedParts = useMemo(() => {
    if (!matchResult.valid || matchResult.matches.length === 0 || !pattern) return null;
    try {
      const parts = [];
      let lastIndex = 0;
      const activeFlags = flags.includes('g') ? flags : flags + 'g';
      const regex = new RegExp(pattern, activeFlags);
      let m;

      while ((m = regex.exec(testText)) !== null) {
        if (m.index > lastIndex) {
          parts.push({ text: testText.slice(lastIndex, m.index), highlight: false });
        }
        parts.push({ text: m[0], highlight: true });
        lastIndex = regex.lastIndex;

        if (!regex.lastIndex) {
          regex.lastIndex++;
        }
      }

      if (lastIndex < testText.length) {
        parts.push({ text: testText.slice(lastIndex), highlight: false });
      }

      return parts;
    } catch (e) {
      return null;
    }
  }, [pattern, flags, testText, matchResult]);

  // 文本替换结果
  const replacedOutput = useMemo(() => {
    if (!matchResult.valid || !pattern) return testText;
    try {
      const regex = new RegExp(pattern, flags);
      return testText.replace(regex, replaceText);
    } catch (e) {
      return testText;
    }
  }, [pattern, flags, testText, replaceText, matchResult]);

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="w-full flex-1 flex flex-col space-y-4 min-h-0">
        {/* 顶部预设常用选择下拉 */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">常用正则模板库：</span>
            <select
              onChange={(e) => {
                const p = PRESETS.find((pr) => pr.name === e.target.value);
                if (p) loadPreset(p);
              }}
              className="terminal-input text-xs py-1 px-2 cursor-pointer"
              defaultValue="电子邮箱 (Email)"
            >
              {PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowCheatsheet(!showCheatsheet)}
            className="flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showCheatsheet ? '隐藏语法速查表' : '常用正则语法速查'}
          </button>
        </div>

        {/* 常用语法速查面板 */}
        {showCheatsheet && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-3 rounded-lg bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 text-xs flex-shrink-0">
            {CHEATSHEET.map((cat) => (
              <div key={cat.cat} className="space-y-1.5">
                <div className="font-bold text-gray-400 dark:text-gray-500 text-[11px] uppercase tracking-wider">
                  {cat.cat}
                </div>
                <div className="space-y-1">
                  {cat.items.map((item) => (
                    <button
                      key={item.p}
                      onClick={() => insertToken(item.p)}
                      title="点击直接插入到正则表达式框"
                      className="w-full flex items-center justify-between p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors group"
                    >
                      <code className="font-mono text-blue-500 font-bold group-hover:scale-105 transition-transform">
                        {item.p}
                      </code>
                      <span className="text-[10px] text-gray-400 truncate ml-1">{item.d}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 正则表达式与 Flag 控制核心栏 */}
        <div className="p-3 bg-white dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-gray-800 space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <span>正则表达式 (RegExp)</span>
              {matchResult.valid ? (
                <span className="text-green-500 text-[11px] flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> 语法正确
                </span>
              ) : (
                <span className="text-red-500 text-[11px] flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3" /> 表达式错误
                </span>
              )}
            </label>

            <span className="text-xs text-gray-400 font-mono">
              / pattern / flags
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-400 font-bold">/</span>
            <input
              ref={inputRef}
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="输入正则表达式，例如 \b[a-z]+\b..."
              className={`flex-1 p-2 rounded border font-mono text-sm outline-none transition-all ${
                matchResult.valid
                  ? 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500'
                  : 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-600 focus:ring-2 focus:ring-red-500'
              }`}
              spellCheck={false}
            />
            <span className="text-sm font-mono text-gray-400 font-bold">/</span>

            {/* Flags 按钮组 */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-md">
              {FLAGS.map((f) => {
                const active = flags.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleFlag(f.id)}
                    title={f.desc}
                    className={`w-7 h-7 rounded text-xs font-mono font-bold transition-all ${
                      active
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {!matchResult.valid && (
            <div className="text-xs font-mono text-red-500 pt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{matchResult.error}</span>
            </div>
          )}
        </div>

        {/* 测试文本输入区 (动态拉伸) */}
        <div className="flex flex-col space-y-2 flex-1 min-h-[160px]">
          <div className="flex items-center justify-between flex-shrink-0">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">待测试的目标文本</label>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-blue-500 font-semibold">
                共找到 {matchResult.matches.length} 处匹配
              </span>
              <button
                onClick={() => setTestText('')}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                清空文本
              </button>
            </div>
          </div>

          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="在在此粘贴或输入需要进行正则匹配与替换的测试文本..."
            className="w-full flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] font-mono text-xs text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[120px]"
            spellCheck={false}
          />
        </div>

        {/* 匹配分析结果选项卡 */}
        <div className="space-y-2 flex-1 flex flex-col min-h-[180px]">
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-md">
              <button
                onClick={() => setActiveTab('highlight')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  activeTab === 'highlight'
                    ? 'bg-white dark:bg-[#161b22] text-blue-500 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                匹配文本高亮
              </button>

              <button
                onClick={() => setActiveTab('groups')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  activeTab === 'groups'
                    ? 'bg-white dark:bg-[#161b22] text-blue-500 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <ListCheck className="w-3.5 h-3.5" />
                捕获组明细 ({matchResult.matches.length})
              </button>

              <button
                onClick={() => setActiveTab('replace')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  activeTab === 'replace'
                    ? 'bg-white dark:bg-[#161b22] text-blue-500 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Replace className="w-3.5 h-3.5" />
                正则文本替换
              </button>
            </div>

            {activeTab === 'replace' ? (
              <CopyButton value={replacedOutput} label="复制替换后文本" />
            ) : (
              <CopyButton value={testText} label="复制原始文本" />
            )}
          </div>

          {/* 视角 1: 匹配高亮预览 */}
          {activeTab === 'highlight' && (
            <div className="flex-1 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] overflow-auto font-mono text-xs leading-relaxed min-h-[140px]">
              {highlightedParts ? (
                <pre className="whitespace-pre-wrap font-mono">
                  {highlightedParts.map((part, idx) =>
                    part.highlight ? (
                      <mark
                        key={idx}
                        className="bg-yellow-300 dark:bg-yellow-500/40 text-gray-900 dark:text-yellow-200 px-0.5 rounded border-b-2 border-yellow-500 font-bold"
                      >
                        {part.text}
                      </mark>
                    ) : (
                      <span key={idx}>{part.text}</span>
                    )
                  )}
                </pre>
              ) : (
                <div className="text-gray-400 py-8 text-center">暂无匹配文本或未找到符合要求的模式</div>
              )}
            </div>
          )}

          {/* 视角 2: 捕获组明细表 */}
          {activeTab === 'groups' && (
            <div className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] overflow-y-auto space-y-3 font-mono text-xs min-h-[140px]">
              {matchResult.matches.length > 0 ? (
                matchResult.matches.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-gray-500 font-sans text-[11px]">
                      <span className="font-bold text-blue-500">Match #{idx + 1}</span>
                      <span>
                        位置: {m.index} ~ {m.endIndex} (长度: {m.fullMatch.length})
                      </span>
                    </div>

                    <div className="p-1.5 bg-white dark:bg-[#161b22] rounded border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 font-bold break-all">
                      {m.fullMatch}
                    </div>

                    {/* Group 捕获组列表 */}
                    {m.groups.length > 0 && (
                      <div className="pl-3 space-y-1 border-l-2 border-purple-500">
                        {m.groups.map((grp, gIdx) => (
                          <div key={gIdx} className="flex items-start gap-2 text-[11px]">
                            <span className="text-purple-500 font-semibold flex-shrink-0">
                              Group ${gIdx + 1}:
                            </span>
                            <span className="text-gray-600 dark:text-gray-300 break-all font-mono">
                              {grp !== undefined ? `"${grp}"` : 'undefined'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 py-8 text-center">暂无匹配组分析数据</div>
              )}
            </div>
          )}

          {/* 视角 3: 正则文本替换模式 */}
          {activeTab === 'replace' && (
            <div className="flex-1 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] space-y-3 min-h-[140px]">
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">
                  替换文本字符串 (支持使用 $1, $2 引用捕获组)
                </label>
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="例如: [REDACTED] 或 $1_replaced..."
                  className="w-full p-2 rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 font-mono text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">
                  替换后的输出结果
                </label>
                <textarea
                  readOnly
                  value={replacedOutput}
                  className="w-full h-24 p-3 rounded border border-gray-200 dark:border-gray-800 bg-gray-900 font-mono text-xs text-green-400 leading-relaxed outline-none resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
