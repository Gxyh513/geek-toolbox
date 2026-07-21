import { useState } from 'react';
import CryptoJS from 'crypto-js';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { useDebounce } from '../../hooks/useDebounce';
import { useToolStore } from '../../stores/toolStore';

const TOOL_ID = 'hmac';

const ALGORITHMS = [
  { id: 'MD5', label: 'HMAC-MD5' },
  { id: 'SHA1', label: 'HMAC-SHA1' },
  { id: 'SHA256', label: 'HMAC-SHA256' },
];

const KEY_STORE_KEY = 'geek-toolbox-hmac-key';

function loadKey() {
  try { return localStorage.getItem(KEY_STORE_KEY) || ''; } catch { return ''; }
}
function saveKey(key) {
  try { localStorage.setItem(KEY_STORE_KEY, key); } catch {}
}

export default function HmacTool() {
  const [algo, setAlgo] = useState('SHA256');
  const [secretKey, setSecretKey] = useState(loadKey);
  const { inputs, setInput } = useToolStore();
  const input = inputs[TOOL_ID] || '';
  const debouncedInput = useDebounce(input, 300);

  const handleKeyChange = (val) => {
    setSecretKey(val);
    saveKey(val);
  };

  let result = '';
  if (debouncedInput && secretKey) {
    try {
      const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo[algo], secretKey);
      hmac.update(debouncedInput);
      result = CryptoJS.enc.Hex.stringify(hmac.finalize());
    } catch (e) {
      result = '计算失败: ' + e.message;
    }
  }

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        {/* 算法切换 */}
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

        {/* Secret Key */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">密钥 (Secret Key)</label>
          <input
            className="terminal-input"
            type="text"
            value={secretKey}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder="输入密钥..."
          />
        </div>

        {/* 输入 */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">输入文本</label>
          <textarea
            className="terminal-textarea"
            rows={6}
            value={input}
            onChange={(e) => setInput(TOOL_ID, e.target.value)}
            placeholder="输入要计算 HMAC 的文本..."
            spellCheck={false}
          />
        </div>

        {/* 输出 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-500">
              {ALGORITHMS.find((a) => a.id === algo)?.label} 结果
            </label>
            {result && <CopyButton value={result} />}
          </div>
          <div className="output-card min-h-[50px]">
            {result ? (
              <pre className="whitespace-pre-wrap break-all font-mono text-sm tracking-wide">{result}</pre>
            ) : !secretKey ? (
              <span className="text-gray-400 text-xs">请输入密钥</span>
            ) : (
              <span className="text-gray-400 text-xs">等待输入...</span>
            )}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
