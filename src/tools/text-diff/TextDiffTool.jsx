import { useMemo } from 'react';
import { diffChars } from 'diff';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { showToast } from '../../components/ui/Toast';
import { useDebounce } from '../../hooks/useDebounce';
import { useToolStore } from '../../stores/toolStore';
import { Sparkles, Trash2 } from 'lucide-react';

const TOOL_ID = 'text-diff';

export default function TextDiffTool() {
  const { inputs, setInput } = useToolStore();

  const textA = inputs['text-diff-a'] || '';
  const textB = inputs['text-diff-b'] || '';
  const debouncedA = useDebounce(textA, 200);
  const debouncedB = useDebounce(textB, 200);

  // 字符级精确差异对比
  const changes = useMemo(() => {
    if (!debouncedA && !debouncedB) return null;
    try {
      return diffChars(debouncedA, debouncedB);
    } catch (e) {
      return { error: e.message };
    }
  }, [debouncedA, debouncedB]);

  // 整理差异纯文本（用于一键复制）
  const outputText = useMemo(() => {
    if (!changes || changes.error) return '';
    return changes
      .map((part) => {
        if (part.added) return `[+${part.value}]`;
        if (part.removed) return `[-${part.value}]`;
        return part.value;
      })
      .join('');
  }, [changes]);

  const handleClear = () => {
    setInput('text-diff-a', '');
    setInput('text-diff-b', '');
    showToast('已清空文本内容');
  };

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="w-full flex-1 flex flex-col space-y-4 min-h-0">
        {/* 顶部控制栏 */}
        <div className="flex items-center justify-between flex-shrink-0 border-b border-gray-200 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>精细化字符差异对比 (Inline Diff)</span>
          </div>

          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold transition-all border border-red-200/50 dark:border-red-800/50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空文本
          </button>
        </div>

        {/* 双栏文本输入区 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[220px]">
          {/* A 文本 */}
          <div className="flex flex-col h-full space-y-1.5">
            <div className="flex items-center justify-between flex-shrink-0">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">A 文本 (基准文本)</label>
              {textA && <span className="text-[11px] text-gray-400 font-mono">{textA.length} 字符</span>}
            </div>
            <textarea
              className="terminal-textarea flex-1 w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] font-mono text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[180px]"
              value={textA}
              onChange={(e) => setInput('text-diff-a', e.target.value)}
              placeholder="在此输入或粘贴 A 文本 (如: 123456)..."
              spellCheck={false}
            />
          </div>

          {/* B 文本 */}
          <div className="flex flex-col h-full space-y-1.5">
            <div className="flex items-center justify-between flex-shrink-0">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">B 文本 (对比文本)</label>
              {textB && <span className="text-[11px] text-gray-400 font-mono">{textB.length} 字符</span>}
            </div>
            <textarea
              className="terminal-textarea flex-1 w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] font-mono text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[180px]"
              value={textB}
              onChange={(e) => setInput('text-diff-b', e.target.value)}
              placeholder="在此输入或粘贴 B 文本 (如: 123222456)..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* 差异对比结果输出区 */}
        <div className="flex flex-col flex-1 min-h-[220px]">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              字符差异对比结果 (高亮中段不同处)
            </label>

            {outputText && <CopyButton value={outputText} label="复制差异结果" />}
          </div>

          {/* 高亮结果面板 */}
          <div className="flex-1 overflow-auto min-h-[180px] p-4 rounded-xl bg-gray-950 border border-gray-800 font-mono text-sm leading-relaxed">
            {!changes ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs space-y-2">
                <span>在上方分别输入 A 文本和 B 文本，系统将精确高亮对比中段差异</span>
              </div>
            ) : changes.error ? (
              <div className="text-red-500 text-xs font-mono">{changes.error}</div>
            ) : (
              <div className="whitespace-pre-wrap break-all">
                {changes.map((part, i) => {
                  if (part.added) {
                    return (
                      <span
                        key={i}
                        className="bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded mx-0.5 border border-emerald-500/40"
                        title="B 文本新增内容"
                      >
                        {part.value}
                      </span>
                    );
                  }
                  if (part.removed) {
                    return (
                      <span
                        key={i}
                        className="bg-red-500/20 text-red-300 font-bold px-1.5 py-0.5 rounded mx-0.5 border border-red-500/40 line-through"
                        title="A 文本删除内容"
                      >
                        {part.value}
                      </span>
                    );
                  }
                  return (
                    <span key={i} className="text-gray-300">
                      {part.value}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
