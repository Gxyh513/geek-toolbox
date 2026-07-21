import { useState, useMemo } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';

const TOOL_ID = 'timezone';

const COMMON_ZONES = [
  'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Singapore', 'Asia/Hong_Kong',
  'Asia/Seoul', 'Asia/Dubai', 'Asia/Kolkata',
  'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Moscow',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Pacific/Auckland', 'Australia/Sydney', 'UTC',
];

export default function TimezoneTool() {
  const [srcZone, setSrcZone] = useState('Asia/Shanghai');
  const [timeStr, setTimeStr] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });
  const [dateStr, setDateStr] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const currentTimeZones = useMemo(() => {
    const now = new Date();
    return COMMON_ZONES.map((z) => {
      const t = now.toLocaleString('zh-CN', { timeZone: z, hour12: false });
      const parts = t.split(/[/, ]/).filter(Boolean);
      const time = parts[parts.length - 1] || '';
      const dateParts = t.split(' ')[0].split('/');
      const offset = -now.getTimezoneOffset() / 60;
      const tzOffset = Intl.DateTimeFormat('zh-CN', { timeZone: z, timeZoneName: 'longOffset' }).formatToParts(now).find(p => p.type === 'timeZoneName')?.value || '';
      return { zone: z, time, date: t.split(' ')[0], offset: tzOffset };
    });
  }, []);

  const converted = useMemo(() => {
    try {
      const dt = new Date(`${dateStr}T${timeStr}:00`);
      const utcMs = dt.getTime();
      return COMMON_ZONES.map((z) => {
        const t = new Date(utcMs).toLocaleString('zh-CN', { timeZone: z, hour12: false });
        const datePart = t.split(' ')[0];
        const timePart = t.split(' ')[1] || '';
        return { zone: z, time: timePart, date: datePart };
      });
    } catch {
      return null;
    }
  }, [dateStr, timeStr]);

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        <div className="flex items-center gap-3 flex-wrap">
          <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)}
            className="terminal-input w-40" />
          <input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)}
            className="terminal-input w-32" />
          <button onClick={() => {
            const now = new Date();
            setDateStr(now.toISOString().slice(0, 10));
            setTimeStr(now.toTimeString().slice(0, 5));
          }} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            当前时间
          </button>
        </div>

        {converted && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {converted.map((c) => (
              <div key={c.zone} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-blue-500 truncate">{c.zone.split('/').pop()}</span>
                  <CopyButton value={`${c.date} ${c.time} ${c.zone}`} label={`已复制 ${c.zone}`} />
                </div>
                <div className="text-lg font-mono font-semibold text-gray-800 dark:text-gray-200">{c.time}</div>
                <div className="text-xs text-gray-400">{c.date}</div>
              </div>
            ))}
          </div>
        )}

        {/* 各时区当前时间 */}
        <details className="text-xs text-gray-400">
          <summary className="cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">各时区当前时间</summary>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1">
            {currentTimeZones.map((c) => (
              <div key={c.zone} className="flex justify-between p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-900">
                <span className="text-xs text-gray-500 truncate mr-2">{c.zone}</span>
                <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{c.time}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </ToolPageLayout>
  );
}
