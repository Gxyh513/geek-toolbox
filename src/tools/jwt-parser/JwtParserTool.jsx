import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { useDebounce } from '../../hooks/useDebounce';
import { useToolStore } from '../../stores/toolStore';

const TOOL_ID = 'jwt-parser';

export default function JwtParserTool() {
  const { inputs, setInput } = useToolStore();
  const input = inputs[TOOL_ID] || '';
  const debouncedInput = useDebounce(input, 300);

  let header = null;
  let payload = null;
  let signature = '';
  let error = '';

  if (debouncedInput) {
    const parts = debouncedInput.trim().split('.');
    if (parts.length !== 3) {
      error = '无效的 JWT：JWT 应包含三段以点号分隔的 Base64URL 编码内容';
    } else {
      try {
        // Base64URL 解码
        const b64urlDecode = (str) => {
          str = str.replace(/-/g, '+').replace(/_/g, '/');
          str += '='.repeat((4 - str.length % 4) % 4);
          return decodeURIComponent(escape(atob(str)));
        };
        header = JSON.parse(b64urlDecode(parts[0]));
        payload = JSON.parse(b64urlDecode(parts[1]));
        signature = parts[2];
      } catch (e) {
        error = '解析失败：JWT 段不是有效的 Base64URL 编码 JSON';
      }
    }
  }

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        {/* 输入区 */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">
            粘贴 JWT Token
          </label>
          <textarea
            className="terminal-textarea"
            rows={4}
            value={input}
            onChange={(e) => setInput(TOOL_ID, e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0..."
            spellCheck={false}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-500 text-xs">{error}</p>
          </div>
        )}

        {/* Header */}
        {header && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-500 font-medium">HEADER: 算法与令牌类型</label>
              <CopyButton value={JSON.stringify(header, null, 2)} label="复制 Header" />
            </div>
            <div className="output-card">
              <pre className="whitespace-pre-wrap break-all text-xs">{JSON.stringify(header, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Payload */}
        {payload && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-500 font-medium">PAYLOAD: 数据声明</label>
              <CopyButton value={JSON.stringify(payload, null, 2)} label="复制 Payload" />
            </div>
            <div className="output-card">
              <pre className="whitespace-pre-wrap break-all text-xs">{JSON.stringify(payload, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Signature */}
        {signature && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-500 font-medium">SIGNATURE: 签名</label>
              <CopyButton value={signature} label="复制 Signature" />
            </div>
            <div className="output-card">
              <pre className="whitespace-pre-wrap break-all text-xs font-mono text-gray-500">{signature}</pre>
            </div>
          </div>
        )}

        {!input && !error && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-xs">
            粘贴 JWT Token 后自动解析
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
