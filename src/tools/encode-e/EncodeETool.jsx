import { useState } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { showToast } from '../../components/ui/Toast';
import { Trash2 } from 'lucide-react';
import { useToolStore } from '../../stores/toolStore';

const TOOL_ID = 'encode-e';

function toEString(str, maxLen = 80) {
  if (str === null || str === undefined) return '""';
  let s = str.toString();
  if (s.length > maxLen) {
    s = s.substring(0, maxLen) + '...';
  }
  let singleLine = s.replace(/\r?\n/g, '\\n');
  let escaped = singleLine.replace(/"/g, '""');
  return `"${escaped}"`;
}

export default function EncodeETool() {
  const { inputs, setInput: storeSetInput } = useToolStore();
  const storedInput = inputs[TOOL_ID] || '';
  const [input, setLocalInput] = useState(storedInput);
  const [output, setOutput] = useState('// 转换结果与易语言代码提示将在此处呈现...');
  const [eHint, setEHint] = useState('');

  const setInput = (val) => {
    setLocalInput(val);
    storeSetInput(TOOL_ID, val);
  };

  const handleAction = (action) => {
    if (!input) {
      showToast('请先输入文本');
      return;
    }
    let res = '';
    let hint = '';

    try {
      switch (action) {
        case 'url-encode':
          res = encodeURIComponent(input);
          hint = `// 易语言代码: URLEncodeUtf8 (${toEString(input)})`;
          break;
        case 'url-decode':
          res = decodeURIComponent(input);
          hint = `// 易语言代码: URLDecodeUtf8 (${toEString(input)})`;
          break;
        case 'base64-encode':
          res = btoa(unescape(encodeURIComponent(input)));
          hint = `// 易语言代码: Base64Encode (到字节集 (${toEString(input)}))`;
          break;
        case 'base64-decode': {
          const cleanB64 = input.replace(/\s+/g, '');
          const binaryStr = atob(cleanB64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          res = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
          hint = `// 易语言代码: Base64Decode2 (${toEString(input)})`;
          break;
        }
        case 'unicode-encode':
          res = input.split('').map((c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
          hint = `// 易语言代码: A2W (${toEString(input)})`;
          break;
        case 'unicode-decode':
          res = input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
          hint = `// 易语言代码: W2A (局_Unicode字节集)`;
          break;
        case 'hex-encode':
          res = Array.from(new TextEncoder().encode(input)).map((b) => b.toString(16).padStart(2, '0')).join('');
          hint = `// 易语言代码: HexEncode (到字节集 (${toEString(input)}))`;
          break;
        case 'hex-decode': {
          const cleanHex = input.replace(/[^0-9a-fA-F]/g, '');
          if (!cleanHex) {
            res = '';
            hint = '// 易语言代码: HexDecode2 ("")';
            break;
          }
          const matches = cleanHex.match(/.{1,2}/g) || [];
          const bytes = new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
          res = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
          hint = `// 易语言代码: HexDecode2 (${toEString(input)})`;
          break;
        }
        default:
          break;
      }
      setOutput(res);
      setEHint(hint);
      showToast('转换成功');
    } catch (e) {
      setOutput(`转换错误: ${e.message}`);
      setEHint('');
    }
  };

  const fullOutput = eHint ? `${output}\n\n${eHint}` : output;

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="w-full flex-1 flex flex-col space-y-4 min-h-0">
        {/* 操作按钮区 */}
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 flex-shrink-0">
          {[
            { id: 'url-encode', label: 'URL 编码' },
            { id: 'url-decode', label: 'URL 解码' },
            { id: 'base64-encode', label: 'Base64 编码' },
            { id: 'base64-decode', label: 'Base64 解码' },
            { id: 'unicode-encode', label: 'Unicode 编码' },
            { id: 'unicode-decode', label: 'Unicode 解码' },
            { id: 'hex-encode', label: 'Hex 16进制编码' },
            { id: 'hex-decode', label: 'Hex 16进制解码' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleAction(item.id)}
              className="px-3 py-1.5 rounded text-xs font-medium bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 输入输出双栏 (自适应窗口) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[350px]">
          {/* 左侧：输入框 */}
          <div className="flex flex-col space-y-2 h-full">
            <div className="h-7 flex items-center justify-between flex-shrink-0">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">输入待转换文本</label>
              <button
                onClick={() => {
                  setInput('');
                  setOutput('// 转换结果与易语言代码提示将在此处呈现...');
                  setEHint('');
                }}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                清空
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入需要转换或解码的文本..."
              className="w-full flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] font-mono text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[250px]"
            />
          </div>

          {/* 右侧：转换结果与易语言代码框 */}
          <div className="flex flex-col space-y-2 h-full">
            <div className="h-7 flex items-center justify-between flex-shrink-0">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">转换结果与易语言代码</label>
              <CopyButton value={fullOutput} label="复制结果" />
            </div>
            <div className="w-full flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-900 overflow-auto font-mono text-sm text-green-400 whitespace-pre-wrap break-all leading-relaxed min-h-[250px]">
              {fullOutput}
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
