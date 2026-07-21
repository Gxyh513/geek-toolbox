import { useState, useMemo } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { useDebounce } from '../../hooks/useDebounce';

const TOOL_ID = 'regex-visualizer';

/**
 * 简单的正则结构可视化
 * 分析正则并分解为带颜色的组成部分
 */
function analyzeRegex(pattern) {
  try {
    new RegExp(pattern); // validate
  } catch {
    return null;
  }

  const parts = [];
  let i = 0;
  const s = pattern;

  while (i < s.length) {
    if (s[i] === '\\' && i + 1 < s.length) {
      const ch = s[i + 1];
      const meta = { 'd': '数字', 'w': '单词字符', 's': '空白', 'b': '单词边界', 'D': '非数字', 'W': '非单词', 'S': '非空白', 'B': '非边界' };
      parts.push({ type: 'escape', text: `\\${ch}`, desc: meta[ch] || `转义 ${ch}` });
      i += 2;
    } else if (s[i] === '(') {
      let j = i + 1;
      let depth = 1;
      while (j < s.length && depth > 0) {
        if (s[j] === '(') depth++;
        else if (s[j] === ')') depth--;
        j++;
      }
      parts.push({ type: 'group', text: s.slice(i, j), desc: '分组' });
      i = j;
    } else if (s[i] === '[') {
      let j = i + 1;
      while (j < s.length && s[j] !== ']') j++;
      if (j < s.length) j++;
      parts.push({ type: 'class', text: s.slice(i, j), desc: '字符类' });
      i = j;
    } else if ('+*?'.includes(s[i])) {
      parts.push({ type: 'quant', text: s[i], desc: { '+': '1次或多次', '*': '0次或多次', '?': '0次或1次' }[s[i]] });
      i++;
    } else if (s[i] === '{') {
      let j = i + 1;
      while (j < s.length && s[j] !== '}') j++;
      if (j < s.length) j++;
      parts.push({ type: 'quant', text: s.slice(i, j), desc: '自定义量词' });
      i = j;
    } else if (s[i] === '|') {
      parts.push({ type: 'alt', text: '|', desc: '或' });
      i++;
    } else if (s[i] === '^' || s[i] === '$') {
      parts.push({ type: 'anchor', text: s[i], desc: s[i] === '^' ? '开头' : '结尾' });
      i++;
    } else if (s[i] === '.') {
      parts.push({ type: 'dot', text: '.', desc: '任意字符' });
      i++;
    } else {
      parts.push({ type: 'literal', text: s[i], desc: '字面量' });
      i++;
    }
  }
  return parts;
}

const TYPE_STYLES = {
  anchor: { color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20' },
  escape: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20' },
  group: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/20' },
  class: { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/20' },
  quant: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20' },
  alt: { color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-900/20' },
  dot: { color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/20' },
  literal: { color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
};

const LEGEND = [
  { type: 'anchor', label: '锚点' },
  { type: 'escape', label: '转义序列' },
  { type: 'group', label: '分组' },
  { type: 'class', label: '字符类' },
  { type: 'quant', label: '量词' },
  { type: 'alt', label: '或' },
  { type: 'dot', label: '通配符' },
  { type: 'literal', label: '字面量' },
];

export default function RegexVisualizerTool() {
  const [pattern, setPattern] = useState('^(https?://)?[\\w.-]+\\.\\w{2,}(/\\S*)?$');
  const debouncedPattern = useDebounce(pattern, 300);

  const analysis = useMemo(() => analyzeRegex(debouncedPattern), [debouncedPattern]);
  const isValid = useMemo(() => { try { new RegExp(debouncedPattern); return true; } catch { return false; } }, [debouncedPattern]);

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">正则表达式</label>
          <input className="terminal-input font-mono"
            value={pattern} onChange={(e) => setPattern(e.target.value)}
            placeholder="输入正则表达式..." spellCheck={false} />
        </div>

        {analysis && (
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">结构分解</label>
            <div className="output-card overflow-x-auto">
              <div className="flex flex-wrap gap-1">
                {analysis.map((part, i) => {
                  const s = TYPE_STYLES[part.type] || TYPE_STYLES.literal;
                  return (
                    <span key={i} className={`inline-flex flex-col items-center ${s.bg} rounded px-1.5 py-0.5`} title={part.desc}>
                      <code className={`text-sm font-mono ${s.color}`}>{part.text}</code>
                      <span className="text-[10px] text-gray-400 mt-0.5">{part.desc}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!isValid && debouncedPattern && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-500 text-xs">无效的正则表达式</p>
          </div>
        )}

        {/* 图例 */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">图例</label>
          <div className="flex flex-wrap gap-2">
            {LEGEND.map((item) => {
              const s = TYPE_STYLES[item.type];
              return (
                <div key={item.type} className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${s.bg}`}>
                  <span className={`font-mono font-medium ${s.color}`}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
