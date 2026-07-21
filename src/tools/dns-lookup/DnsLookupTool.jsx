import { useState } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';

const TOOL_ID = 'dns-lookup';

const RECORD_TYPES = [
  { type: 'A', desc: 'IPv4 地址记录', example: '140.82.121.3' },
  { type: 'AAAA', desc: 'IPv6 地址记录', example: '::1' },
  { type: 'CNAME', desc: '别名记录', example: 'github.com.' },
  { type: 'MX', desc: '邮件交换记录', example: 'alt4.aspmx.l.google.com.' },
  { type: 'NS', desc: '名称服务器记录', example: 'ns1.example.com.' },
  { type: 'TXT', desc: '文本记录', example: 'v=spf1 include:_spf.google.com ~all' },
  { type: 'SRV', desc: '服务定位记录', example: '0 0 80 example.com.' },
  { type: 'SOA', desc: '权威起始记录', example: 'admin.example.com.' },
  { type: 'PTR', desc: '指针记录（反向解析）', example: 'example.com.' },
  { type: 'CAA', desc: '证书授权记录', example: '0 issue "letsencrypt.org"' },
];

export default function DnsLookupTool() {
  const [domain, setDomain] = useState('example.com');
  const [selectedType, setSelectedType] = useState('A');

  const record = RECORD_TYPES.find((r) => r.type === selectedType);

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            <strong>说明：</strong>由于浏览器的安全策略限制，纯前端无法发起真实的 DNS 查询。
            此工具提供 DNS 记录类型查询的教育参考，展示每种记录类型的格式和用途。
            如需真实查询，请使用 <code className="font-mono">dig</code>、<code className="font-mono">nslookup</code> 等命令行工具。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">域名</label>
            <input className="terminal-input font-mono"
              value={domain} onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com" spellCheck={false} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">记录类型</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
              className="terminal-input w-28">
              {RECORD_TYPES.map((r) => (
                <option key={r.type} value={r.type}>{r.type}</option>
              ))}
            </select>
          </div>
        </div>

        {record && (
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">
              {record.type} 记录 — {record.desc}
            </label>
            <div className="output-card">
              <div className="font-mono text-sm">
                <span className="text-blue-500">{domain}</span>
                <span className="text-gray-400">. 3600 IN {record.type} </span>
                <span className="text-green-500">{record.example}</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">DNS 记录类型参考</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {RECORD_TYPES.map((r) => (
              <div key={r.type} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] p-3
                cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => setSelectedType(r.type)}>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono font-bold text-blue-500">{r.type}</code>
                  {selectedType === r.type && <span className="text-xs text-blue-500">当前</span>}
                </div>
                <span className="text-xs text-gray-400">{r.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
