import { useState } from 'react';
import CryptoJS from 'crypto-js';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { useDebounce } from '../../hooks/useDebounce';
import { useToolStore } from '../../stores/toolStore';

const TOOL_ID = 'hash';

const ALGORITHMS = [
  { id: 'MD5', label: 'MD5' },
  { id: 'SHA1', label: 'SHA1' },
  { id: 'SHA256', label: 'SHA256' },
  { id: 'SHA512', label: 'SHA512' },
];

const ALGO_MAP = {
  MD5: (text) => CryptoJS.MD5(text).toString(),
  SHA1: (text) => CryptoJS.SHA1(text).toString(),
  SHA256: (text) => CryptoJS.SHA256(text).toString(),
  SHA512: (text) => CryptoJS.SHA512(text).toString(),
};

export default function HashTool() {
  const [algo, setAlgo] = useState('MD5');
  const { inputs, setInput } = useToolStore();
  const input = inputs[TOOL_ID] || '';
  const debouncedInput = useDebounce(input, 300);

  let result = '';
  if (debouncedInput) {
    try {
      result = ALGO_MAP[algo](debouncedInput);
    } catch (e) {
      result = '计算失败: ' + e.message;
    }
  }

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        {/* 算法选择 */}
        <div className="flex flex-wrap items-center gap-2">
          {ALGORITHMS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAlgo(a.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-mono font-medium transition-colors ${
                algo === a.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* 输入 */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">输入文本</label>
          <textarea
            className="terminal-textarea"
            rows={6}
            value={input}
            onChange={(e) => setInput(TOOL_ID, e.target.value)}
            placeholder="输入要计算哈希的文本..."
            spellCheck={false}
          />
        </div>

        {/* 输出 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-500">
              {algo} 哈希值
            </label>
            {result && <CopyButton value={result} />}
          </div>
          <div className="output-card min-h-[50px]">
            {result ? (
              <pre className="whitespace-pre-wrap break-all font-mono text-sm tracking-wide">{result}</pre>
            ) : (
              <span className="text-gray-400 text-xs">等待输入...</span>
            )}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
