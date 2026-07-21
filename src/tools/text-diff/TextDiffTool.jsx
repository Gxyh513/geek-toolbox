import { useState, useMemo } from 'react';
import { diffWords, diffLines } from 'diff';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { useDebounce } from '../../hooks/useDebounce';
import { useToolStore } from '../../stores/toolStore';

const TOOL_ID = 'text-diff';

export default function TextDiffTool() {
  const [mode, setMode] = useState('words');
  const { inputs, setInput } = useToolStore();
  const textA = inputs['text-diff-a'] || '';
  const textB = inputs['text-diff-b'] || '';
  const debouncedA = useDebounce(textA, 300);
  const debouncedB = useDebounce(textB, 300);

  const changes = useMemo(() => {
    if (!debouncedA && !debouncedB) return null;
    try {
      const d = mode === 'words' ? diffWords(debouncedA, debouncedB) : diffLines(debouncedA, debouncedB);
      return d;
    } catch (e) {
      return { error: e.message };
    }
  }, [debouncedA, debouncedB, mode]);

  const stats = useMemo(() => {
    if (!changes || changes.error) return null;
    let added = 0, removed = 0;
    for (const part of changes) {
      if (part.added) added += part.value.length;
      else if (part.removed) removed += part.value.length;
    }
    return { added, removed };
  }, [changes]);

  const outputText = useMemo(() => {
    if (!changes || changes.error) return '';
    return changes.map((part) => part.value).join('');
  }, [changes]);

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-5xl">
        <div className="flex items-center gap-2">
          <button onClick={() => setMode('words')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'words' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>按单词对比</button>
          <button onClick={() => setMode('lines')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'lines' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>按行对比</button>
          {stats && (
            <span className="text-xs text-gray-400 ml-auto">
              <span className="text-green-500">+{stats.added}</span>
              {' / '}
              <span className="text-red-500">-{stats.removed}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">原始文本 (A)</label>
            <textarea className="terminal-textarea" rows={10}
              value={textA} onChange={(e) => setInput('text-diff-a', e.target.value)}
              placeholder="输入原始文本..." spellCheck={false} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">修改文本 (B)</label>
            <textarea className="terminal-textarea" rows={10}
              value={textB} onChange={(e) => setInput('text-diff-b', e.target.value)}
              placeholder="输入修改后的文本..." spellCheck={false} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-500">差异对比</label>
            {outputText && <CopyButton value={outputText} label="已复制差异" />}
          </div>
          <div className="output-card overflow-x-auto max-h-96" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', lineHeight: '1.6' }}>
            {!changes ? (
              <span className="text-gray-400 text-xs">在两侧输入文本后自动对比</span>
            ) : changes.error ? (
              <span className="text-red-500 text-xs">{changes.error}</span>
            ) : (
              changes.map((part, i) => {
                if (part.added) {
                  return <span key={i} className="bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded px-0.5">{part.value}</span>;
                }
                if (part.removed) {
                  return <span key={i} className="bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300 rounded px-0.5 line-through">{part.value}</span>;
                }
                return <span key={i} className="text-gray-700 dark:text-gray-300">{part.value}</span>;
              })
            )}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
