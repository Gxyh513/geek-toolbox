import { useState, useEffect } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';

const TOOL_ID = 'ip-lookup';

function parseIP(ip) {
  const clean = ip.trim();
  // IPv6
  if (clean.includes(':')) {
    if (clean === '::1') return { version: 6, type: '环回地址', isSpecial: true };
    if (clean.startsWith('fe80:')) return { version: 6, type: '链路本地地址', isSpecial: true };
    if (clean.startsWith('fc') || clean.startsWith('fd')) return { version: 6, type: '唯一本地地址', isSpecial: true };
    if (clean.startsWith('ff')) return { version: 6, type: '组播地址', isSpecial: true };
    return { version: 6, type: '全局单播地址', isSpecial: false };
  }
  // IPv4
  const parts = clean.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN) || parts.some((p) => p < 0 || p > 255)) return null;
  let type = '公网地址';
  let isSpecial = false;
  if (parts[0] === 10) { type = '私有地址 (10.0.0.0/8)'; isSpecial = true; }
  else if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) { type = '私有地址 (172.16.0.0/12)'; isSpecial = true; }
  else if (parts[0] === 192 && parts[1] === 168) { type = '私有地址 (192.168.0.0/16)'; isSpecial = true; }
  else if (parts[0] === 127) { type = '环回地址 (127.0.0.0/8)'; isSpecial = true; }
  else if (parts[0] === 0) { type = '当前网络 (0.0.0.0/8)'; isSpecial = true; }
  else if (parts[0] >= 224 && parts[0] <= 239) { type = '组播地址 (224.0.0.0/4)'; isSpecial = true; }
  else if (parts[0] >= 240) { type = '保留地址 (240.0.0.0/4)'; isSpecial = true; }
  return {
    version: 4,
    type,
    isSpecial,
    octets: parts,
    binary: parts.map((p) => p.toString(2).padStart(8, '0')).join('.'),
    hex: parts.map((p) => p.toString(16).padStart(2, '0')).join('.'),
  };
}

export default function IpLookupTool() {
  const [input, setInput] = useState('');
  const [connectionInfo, setConnectionInfo] = useState(null);
  const debouncedInput = input;

  useEffect(() => {
    if ('connection' in navigator) {
      const c = navigator.connection;
      setConnectionInfo({
        type: c.type || 'unknown',
        effectiveType: c.effectiveType || 'unknown',
        downlink: c.downlink,
        rtt: c.rtt,
      });
      const handler = () => setConnectionInfo({
        type: c.type || 'unknown',
        effectiveType: c.effectiveType || 'unknown',
        downlink: c.downlink,
        rtt: c.rtt,
      });
      c.addEventListener('change', handler);
      return () => c.removeEventListener('change', handler);
    }
  }, []);

  const result = input ? parseIP(input) : null;

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">输入 IP 地址</label>
          <input className="terminal-input font-mono"
            value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="例如: 192.168.1.1 或 ::1" spellCheck={false} />
        </div>

        {input && !result && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-500 text-xs">无效的 IP 地址格式</p>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                IPv{result.version}
              </span>
              <span className={'px-2 py-0.5 rounded text-xs font-medium ' + (result.isSpecial ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400')}>
                {result.type}
              </span>
            </div>

            {result.version === 4 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] p-3">
                  <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">十进制</span><CopyButton value={input} /></div>
                  <pre className="text-sm font-mono">{input}</pre>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] p-3">
                  <span className="text-xs text-gray-500 mb-1 block">十六进制</span>
                  <pre className="text-sm font-mono">{result.hex}</pre>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] p-3 col-span-2">
                  <span className="text-xs text-gray-500 mb-1 block">二进制</span>
                  <pre className="text-sm font-mono break-all">{result.binary}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {connectionInfo && (
          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">浏览器网络信息</summary>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-900">
                <span>连接类型</span><span className="font-mono">{connectionInfo.type}</span>
              </div>
              <div className="flex justify-between p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-900">
                <span>网络类型</span><span className="font-mono">{connectionInfo.effectiveType}</span>
              </div>
              <div className="flex justify-between p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-900">
                <span>下行速度</span><span className="font-mono">{connectionInfo.downlink} Mbps</span>
              </div>
              <div className="flex justify-between p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-900">
                <span>RTT</span><span className="font-mono">{connectionInfo.rtt} ms</span>
              </div>
            </div>
          </details>
        )}
      </div>
    </ToolPageLayout>
  );
}
