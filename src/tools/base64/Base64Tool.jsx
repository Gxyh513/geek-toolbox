import { useState } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { useDebounce } from '../../hooks/useDebounce';
import { useToolStore } from '../../stores/toolStore';

const TOOL_ID = 'base64';

export default function Base64Tool() {
  const [mode, setMode] = useState('encode');
  const { inputs, setInput } = useToolStore();
  const input = inputs[TOOL_ID] || '';
  const debouncedInput = useDebounce(input, 300);

  let result = '';
  let error = '';

  if (debouncedInput) {
    try {
      if (mode === 'encode') {
        result = btoa(unescape(encodeURIComponent(debouncedInput)));
      } else {
        const decoded = atob(debouncedInput);
        result = decodeURIComponent(escape(decoded));
      }
    } catch (e) {
      error = mode === 'decode' ? '无效的 Base64 字符串' : '编码失败';
    }
  }

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        {/* 模式切换 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('encode')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'encode'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            编码 Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'decode'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            解码 Decode
          </button>
        </div>

        {/* 输入区 */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">
            {mode === 'encode' ? '输入文本' : '输入 Base64 字符串'}
          </label>
          <textarea
            className="terminal-textarea"
            rows={6}
            value={input}
            onChange={(e) => setInput(TOOL_ID, e.target.value)}
            placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入要解码的 Base64...'}
            spellCheck={false}
          />
        </div>

        {/* 输出区 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-500">
              {mode === 'encode' ? 'Base64 编码结果' : '解码结果'}
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
