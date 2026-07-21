import { useState } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { useDebounce } from '../../hooks/useDebounce';
import { useToolStore } from '../../stores/toolStore';

const TOOL_ID = 'unicode';

export default function UnicodeTool() {
  const [mode, setMode] = useState('encode');
  const { inputs, setInput } = useToolStore();
  const input = inputs[TOOL_ID] || '';
  const debouncedInput = useDebounce(input, 300);

  let result = '';
  let error = '';

  if (debouncedInput) {
    try {
      if (mode === 'encode') {
        // 中文 / 特殊字符 → \\uXXXX
        result = debouncedInput.replace(/[^\x00-\x7F]/g, (ch) => {
          const hex = ch.charCodeAt(0).toString(16).toUpperCase();
          return '\\u' + hex.padStart(4, '0');
        });
      } else {
        // \\uXXXX → 中文
        result = debouncedInput.replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) => {
          return String.fromCharCode(parseInt(hex, 16));
        });
        // 也处理 \u{XXXXX} 格式（4字节以上）
        result = result.replace(/\\u\{([0-9A-Fa-f]+)\}/g, (_, hex) => {
          return String.fromCodePoint(parseInt(hex, 16));
        });
      }
    } catch (e) {
      error = '转换失败：' + e.message;
    }
  }

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('encode')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'encode'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            中文 → \uXXXX
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'decode'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            \uXXXX → 中文
          </button>
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">
            {mode === 'encode' ? '输入文本（含中文或特殊字符）' : '输入 \\uXXXX 编码'}
          </label>
          <textarea
            className="terminal-textarea"
            rows={6}
            value={input}
            onChange={(e) => setInput(TOOL_ID, e.target.value)}
            placeholder={mode === 'encode' ? '例如：你好世界' : '例如：\\u4F60\\u597D'}
            spellCheck={false}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-500">
              {mode === 'encode' ? 'Unicode 编码结果' : '解码结果'}
            </label>
            {result && <CopyButton value={result} />}
          </div>
          <div className={`output-card min-h-[80px] ${error ? 'border-red-300 dark:border-red-800' : ''}`}>
            {error ? (
              <span className="text-red-500 text-xs">{error}</span>
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
