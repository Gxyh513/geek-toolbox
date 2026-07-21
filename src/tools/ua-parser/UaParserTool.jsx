import { useState, useEffect } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';

const TOOL_ID = 'ua-parser';

function parseUA(ua) {
  const result = {};
  // Browser
  const browsers = [
    { key: 'Chrome', re: /Chrome\/([\d.]+)/, label: 'Chrome' },
    { key: 'Firefox', re: /Firefox\/([\d.]+)/, label: 'Firefox' },
    { key: 'Safari', re: /Version\/([\d.]+).*Safari/, label: 'Safari' },
    { key: 'Edge', re: /Edg\/([\d.]+)/, label: 'Edge' },
    { key: 'IE', re: /MSIE ([\d.]+)/, label: 'Internet Explorer' },
    { key: 'Opera', re: /OPR\/([\d.]+)/, label: 'Opera' },
  ];
  for (const b of browsers) {
    const m = ua.match(b.re);
    if (m) {
      result.browser = b.label;
      result.browserVersion = m[1];
      break;
    }
  }
  if (!result.browser) {
    const m = ua.match(/(\w+)\/([\d.]+)/);
    if (m) { result.browser = m[1]; result.browserVersion = m[2]; }
  }

  // OS
  const oses = [
    { key: 'Windows', re: /Windows NT ([\d.]+)/, label: 'Windows', v: (v) => ({ '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.2': 'XP x64', '5.1': 'XP' }[v] || v) },
    { key: 'macOS', re: /Mac OS X ([\d_]+)/, label: 'macOS', v: (v) => v.replace(/_/g, '.') },
    { key: 'iOS', re: /iPhone OS ([\d_]+)/, label: 'iOS', v: (v) => v.replace(/_/g, '.') },
    { key: 'Android', re: /Android ([\d.]+)/, label: 'Android' },
    { key: 'Linux', re: /Linux/, label: 'Linux' },
  ];
  for (const os of oses) {
    const m = ua.match(os.re);
    if (m) {
      result.os = os.label;
      if (m[1]) result.osVersion = os.v ? os.v(m[1]) : m[1];
      break;
    }
  }

  // Device
  if (/Mobile|Android.*Mobile/.test(ua)) result.device = '手机';
  else if (/Tablet|iPad/.test(ua)) result.device = '平板';
  else if (/Mobi/.test(ua)) result.device = '移动设备';
  else result.device = '桌面';

  // Engine
  const engines = [
    { key: 'Blink', re: /Chrome\/.*Safari\//, label: 'Blink' },
    { key: 'WebKit', re: /AppleWebKit\//, label: 'WebKit' },
    { key: 'Gecko', re: /Gecko\//, label: 'Gecko' },
    { key: 'Trident', re: /Trident\//, label: 'Trident' },
  ];
  for (const e of engines) {
    if (ua.includes(e.key) || e.re.test(ua)) {
      result.engine = e.label;
      break;
    }
  }

  return result;
}

export default function UaParserTool() {
  const [input, setInput] = useState('');
  const [currentUA, setCurrentUA] = useState('');

  useEffect(() => {
    setCurrentUA(navigator.userAgent);
  }, []);

  const ua = input || currentUA;
  const parsed = ua ? parseUA(ua) : null;

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        <button onClick={() => setInput(navigator.userAgent)}
          className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors">
          使用当前浏览器 UA
        </button>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">User-Agent 字符串</label>
          <textarea className="terminal-textarea" rows={3}
            value={ua} onChange={(e) => setInput(e.target.value)}
            placeholder="粘贴 User-Agent..." spellCheck={false} />
        </div>

        {parsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: '浏览器', value: parsed.browser, version: parsed.browserVersion, key: 'browser' },
              { label: '操作系统', value: parsed.os, version: parsed.osVersion, key: 'os' },
              { label: '设备类型', value: parsed.device, key: 'device' },
              { label: '渲染引擎', value: parsed.engine, key: 'engine' },
            ].map((item) => (
              <div key={item.key} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] p-3">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <CopyButton value={item.value + (item.version ? ' ' + item.version : '')} label={'已复制 ' + item.value} />
                </div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.value || '未知'}</div>
                {item.version && <div className="text-xs text-gray-400">v{item.version}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
