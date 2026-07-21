import { useState } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { useDebounce } from '../../hooks/useDebounce';
import { useToolStore } from '../../stores/toolStore';

const TOOL_ID = 'json-formatter';

export default function JsonFormatterTool() {
  const [mode, setMode] = useState('format');
  const { inputs, setInput } = useToolStore();
  const input = inputs[TOOL_ID] || '';
  const debouncedInput = useDebounce(input, 300);

  let result = '';
  let error = '';
  let isValid = false;

  if (debouncedInput) {
    try {
      const parsed = JSON.parse(debouncedInput);
      isValid = true;
      if (mode === 'format') {
        result = JSON.stringify(parsed, null, 2);
      } else {
        result = JSON.stringify(parsed);
      }
    } catch (e) {
      error = e.message || 'JSON 格式无效';
      isValid = false;
    }
  }

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        {/* 模式切换 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('format')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'format'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            格式化 Format
          </button>
          <button
            onClick={() => setMode('compress')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'compress'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            压缩 Compress
          </button>
        </div>

        {/* 输入区 */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">
            输入 JSON
          </label>
          <textarea
            className="terminal-textarea"
            rows={8}
            value={input}
            onChange={(e) => setInput(TOOL_ID, e.target.value)}
            placeholder="粘贴 JSON 字符串..."
            spellCheck={false}
          />
        </div>

        {/* 输出区 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-500">
              {mode === 'format' ? '格式化结果' : '压缩结果'}
            </label>
            <div className="flex items-center gap-2">
              {isValid && (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  JSON 有效
                </span>
              )}
              {result && <CopyButton value={result} />}
            </div>
          </div>
          <div className={`output-card min-h-[120px] ${error ? 'border-red-300 dark:border-red-800' : ''}`}>
            {error ? (
              <div className="flex items-start gap-2">
                <span className="text-red-500 text-xs font-mono">✗</span>
                <div>
                  <p className="text-red-500 text-xs font-medium mb-1">JSON 解析错误</p>
                  <p className="text-red-400/70 text-xs font-mono">{error}</p>
                </div>
              </div>
            ) : result ? (
              <pre className="whitespace-pre-wrap break-all">{result}</pre>
            ) : (
              <span className="text-gray-400 text-xs">等待输入...</span>
            )}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
