import { useState, useMemo } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { useDebounce } from '../../hooks/useDebounce';
import { useToolStore } from '../../stores/toolStore';

const TOOL_ID = 'regex-tester';

const CHEATSHEET = [
  { cat: '锚点', items: [
    { p: '^', d: '字符串开头' },
    { p: '$', d: '字符串结尾' },
    { p: '\\b', d: '单词边界' },
    { p: '\\B', d: '非单词边界' },
  ]},
  { cat: '字符类', items: [
    { p: '.', d: '任意字符（除换行）' },
    { p: '\\d', d: '数字 [0-9]' },
    { p: '\\w', d: '单词字符 [a-zA-Z0-9_]' },
    { p: '\\s', d: '空白字符' },
    { p: '[abc]', d: '字符集合' },
    { p: '[^abc]', d: '否定字符集合' },
  ]},
  { cat: '量词', items: [
    { p: '*', d: '0 次或多次' },
    { p: '+', d: '1 次或多次' },
    { p: '?', d: '0 次或 1 次' },
    { p: '{n}', d: '恰好 n 次' },
    { p: '{n,}', d: '至少 n 次' },
    { p: '{n,m}', d: 'n 到 m 次' },
  ]},
  { cat: '分组/引用', items: [
    { p: '(...)', d: '捕获分组' },
    { p: '(?:...)', d: '非捕获分组' },
    { p: '\\1', d: '反向引用' },
    { p: '|', d: '条件或' },
  ]},
  { cat: '预查', items: [
    { p: '(?=...)', d: '正向先行断言' },
    { p: '(?!...)', d: '负向先行断言' },
    { p: '(?<=...)', d: '正向后行断言' },
    { p: '(?<!...)', d: '负向后行断言' },
  ]},
];

const FLAGS = [
  { id: 'g', label: 'g', desc: '全局匹配' },
  { id: 'i', label: 'i', desc: '忽略大小写' },
  { id: 'm', label: 'm', desc: '多行模式' },
  { id: 's', label: 's', desc: '点号匹配换行' },
];

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('gm');
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const { inputs, setInput } = useToolStore();
  const testText = inputs[TOOL_ID] || '';
  const debouncedPattern = useDebounce(pattern, 300);
  const debouncedText = useDebounce(testText, 300);

  const toggleFlag = (f) => {
    setFlags((prev) => prev.includes(f) ? prev.replace(f, '') : prev + f);
  };

  const result = useMemo(() => {
    if (!debouncedPattern || !debouncedText) return null;
    try {
      const regex = new RegExp(debouncedPattern, flags);
      const matches = [];
      let match;
      let cnt = 0;
      const re = new RegExp(debouncedPattern, flags.includes('g') ? flags : flags + 'g');
      while ((match = re.exec(debouncedText)) !== null && cnt < 5000) {
        matches.push({ index: match.index, value: match[0], length: match[0].length });
        if (!re.lastIndex) break;
        cnt++;
      }
      return { matches, count: matches.length, valid: true };
    } catch (e) {
      return { error: e.message, valid: false };
    }
  }, [debouncedPattern, flags, debouncedText]);

  // 高亮文本
  const highlighted = useMemo(() => {
    if (!result || !result.valid || result.matches.length === 0 || !debouncedPattern) return null;
    try {
      const parts = [];
      let lastEnd = 0;
      const re = new RegExp(debouncedPattern, flags.includes('g') ? flags : flags + 'g');
      let m;
      while ((m = re.exec(debouncedText)) !== null) {
        if (m.index > lastEnd) {
          parts.push({ text: debouncedText.slice(lastEnd, m.index), highlight: false });
        }
        parts.push({ text: m[0], highlight: true });
        lastEnd = re.lastIndex;
        if (!re.lastIndex) break;
      }
      if (lastEnd < debouncedText.length) {
        parts.push({ text: debouncedText.slice(lastEnd), highlight: false });
      }
      return parts;
    } catch {
      return null;
    }
  }, [debouncedPattern, flags, debouncedText, result]);

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-5xl">
        {/* 正则输入 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-gray-500">/</span>
          <input
            className="terminal-input font-mono flex-1"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="输入正则表达式..."
            spellCheck={false}
          />
          <span className="text-sm font-mono text-gray-500">/</span>
          <div className="flex gap-1">
            {FLAGS.map((f) => (
              <button
                key={f.id}
                onClick={() => toggleFlag(f.id)}
                title={f.desc}
                className={`w-7 h-7 rounded text-xs font-mono font-medium transition-colors ${
                  flags.includes(f.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 速查表切换 */}
        <button
          onClick={() => setShowCheatsheet(!showCheatsheet)}
          className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
        >
          {showCheatsheet ? '收起速查表 ▲' : '常用正则速查表 ▼'}
        </button>

        {showCheatsheet && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-800">
            {CHEATSHEET.map((section) => (
              <div key={section.cat}>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wider">
                  {section.cat}
                </h4>
                <div className="space-y-1.5">
                  {section.items.map((item) => (
                    <div key={item.p} className="flex flex-col">
                      <code className="text-xs font-mono text-blue-500">{item.p}</code>
                      <span className="text-xs text-gray-400">{item.d}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 测试文本 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-500">测试文本</label>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {result && result.valid && (
                <span>匹配 {result.count} 处</span>
              )}
            </div>
          </div>
          <textarea
            className="terminal-textarea"
            rows={8}
            value={testText}
            onChange={(e) => setInput(TOOL_ID, e.target.value)}
            placeholder="粘贴要测试的文本..."
            spellCheck={false}
          />
        </div>

        {/* 高亮预览 */}
        {highlighted && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-500">匹配高亮</label>
              <CopyButton value={testText} />
            </div>
            <div className="output-card overflow-x-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                {highlighted.map((part, i) =>
                  part.highlight ? (
                    <span key={i} className="bg-blue-500/20 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300 rounded px-0.5">
                      {part.text}
                    </span>
                  ) : (
                    <span key={i}>{part.text}</span>
                  )
                )}
              </pre>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {result && !result.valid && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-500 text-xs font-mono">{result.error}</p>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
