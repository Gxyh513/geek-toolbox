import { useState, useCallback, useMemo } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { showToast } from '../../components/ui/Toast';

const TOOL_ID = 'password-generator';

const CHARS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: 'il1Lo0O',
};

function generatePassword(length, options) {
  let pool = '';
  if (options.lowercase) pool += CHARS.lowercase;
  if (options.uppercase) pool += CHARS.uppercase;
  if (options.digits) pool += CHARS.digits;
  if (options.special) pool += CHARS.special;
  if (options.ambiguous) {
    for (const ch of CHARS.ambiguous) {
      pool = pool.replaceAll(ch, '');
    }
  }
  if (!pool) return '请至少选择一种字符类型';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += pool[array[i] % pool.length];
  }
  return result;
}

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    lowercase: true,
    uppercase: true,
    digits: true,
    special: true,
    ambiguous: false,
  });
  const toggleOption = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const [password, setPassword] = useState(() => generatePassword(16, options));

  const handleGenerate = useCallback(() => {
    setPassword(generatePassword(length, options));
  }, [length, options]);

  const passwordStrength = useMemo(() => {
    let poolSize = 0;
    if (options.lowercase) poolSize += 26;
    if (options.uppercase) poolSize += 26;
    if (options.digits) poolSize += 10;
    if (options.special) poolSize += CHARS.special.length;
    if (options.ambiguous) poolSize -= CHARS.ambiguous.length;
    const entropy = Math.round(length * Math.log2(Math.max(poolSize, 1)));
    if (entropy < 40) return { label: '弱', class: 'text-red-500', bar: 'w-1/3 bg-red-500' };
    if (entropy < 60) return { label: '一般', class: 'text-yellow-500', bar: 'w-2/3 bg-yellow-500' };
    if (entropy < 80) return { label: '强', class: 'text-green-500', bar: 'w-4/5 bg-green-500' };
    return { label: '非常强', class: 'text-green-400', bar: 'w-full bg-green-400' };
  }, [length, options]);

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="w-full flex-1 flex flex-col space-y-4 min-h-0">
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">密码长度</label>
          <input type="range" min={4} max={64} value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="flex-1 accent-blue-500" />
          <span className="text-sm font-mono text-gray-700 dark:text-gray-300 w-8 text-right">{length}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'lowercase', label: '小写 (a-z)' },
            { key: 'uppercase', label: '大写 (A-Z)' },
            { key: 'digits', label: '数字 (0-9)' },
            { key: 'special', label: '特殊字符' },
            { key: 'ambiguous', label: '排除易混淆字符' },
          ].map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={options[opt.key]}
                onChange={() => toggleOption(opt.key)}
                className="rounded border-gray-300 dark:border-gray-700 text-blue-500 focus:ring-blue-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">{opt.label}</span>
            </label>
          ))}
        </div>
        <button onClick={handleGenerate}
          className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors">
          生成密码
        </button>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-500">生成的密码</span>
              <span className={`text-xs font-medium ${passwordStrength.class}`}>{passwordStrength.label}</span>
            </div>
            <CopyButton value={password} />
          </div>
          <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 mb-2 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.bar}`} />
          </div>
          <div className="output-card">
            {password.startsWith('请') ? (
              <span className="text-yellow-500 text-xs">{password}</span>
            ) : (
              <pre className="whitespace-pre-wrap break-all font-mono text-lg tracking-wider">{password}</pre>
            )}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
