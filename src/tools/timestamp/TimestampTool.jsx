import { useState, useMemo } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { useToolStore } from '../../stores/toolStore';

const TOOL_ID = 'timestamp';

export default function TimestampTool() {
  const [mode, setMode] = useState('ts2date');
  const [input, setLocalInput] = useState('');
  const [unit, setUnit] = useState('seconds');

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      if (mode === 'ts2date') {
        const num = parseInt(input.trim(), 10);
        if (isNaN(num)) return { error: '无效的时间戳，请输入数字' };
        const ms = unit === 'seconds' ? num * 1000 : num;
        const date = new Date(ms);
        if (date.toString() === 'Invalid Date') return { error: '无效的日期' };
        return {
          utc: date.toUTCString(),
          local: date.toLocaleString(),
          iso: date.toISOString(),
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString(),
          full: date.toString(),
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
          hour: date.getHours(),
          minute: date.getMinutes(),
          second: date.getSeconds(),
        };
      } else {
        const date = new Date(input);
        if (date.toString() === 'Invalid Date') return { error: '无效的日期格式，请使用 ISO 格式 (YYYY-MM-DDTHH:mm:ss)' };
        const ts_s = Math.floor(date.getTime() / 1000);
        const ts_ms = date.getTime();
        return { seconds: ts_s, milliseconds: ts_ms };
      }
    } catch (e) {
      return { error: e.message };
    }
  }, [input, mode, unit]);

  const nowTs = () => {
    setLocalInput(String(Math.floor(Date.now() / 1000)));
    if (mode !== 'ts2date') setMode('ts2date');
  };

  const nowDate = () => {
    setLocalInput(new Date().toISOString().slice(0, 19));
    if (mode !== 'date2ts') setMode('date2ts');
  };

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setMode('ts2date')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'ts2date' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>时间戳 → 日期</button>
          <button onClick={() => setMode('date2ts')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'date2ts' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>日期 → 时间戳</button>
          {mode === 'ts2date' && (
            <select value={unit} onChange={(e) => setUnit(e.target.value)}
              className="terminal-input w-32 text-xs">
              <option value="seconds">秒 (10位)</option>
              <option value="milliseconds">毫秒 (13位)</option>
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input className="terminal-input flex-1 font-mono"
            value={input} onChange={(e) => setLocalInput(e.target.value)}
            placeholder={mode === 'ts2date' ? '输入 Unix 时间戳...' : '输入日期 (YYYY-MM-DDTHH:mm:ss)...'} />
          <button onClick={nowTs} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">现在</button>
          <button onClick={nowDate} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">今天</button>
        </div>

        {result && result.error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-500 text-xs">{result.error}</p>
          </div>
        )}

        {result && !result.error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mode === 'ts2date' ? (
              <>
                {[
                  { label: 'UTC 时间', value: result.utc, key: 'utc' },
                  { label: '本地时间', value: result.local, key: 'local' },
                  { label: 'ISO 8601', value: result.iso, key: 'iso' },
                  { label: '完整格式', value: result.full, key: 'full' },
                ].map((item) => (
                  <div key={item.key} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">{item.label}</span>
                      <CopyButton value={item.value} />
                    </div>
                    <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">{item.value}</pre>
                  </div>
                ))}
                <div className="md:col-span-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] p-3">
                  <span className="text-xs text-gray-500 mb-1 block">分解</span>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-gray-600 dark:text-gray-400">
                    <span>{result.year}年</span>
                    <span>{result.month}月</span>
                    <span>{result.day}日</span>
                    <span>{result.hour}时</span>
                    <span>{result.minute}分</span>
                    <span>{result.second}秒</span>
                    <span>星期{['日','一','二','三','四','五','六'][new Date(result.full).getDay()]}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {[
                  { label: 'Unix 时间戳 (秒)', value: String(result.seconds), key: 'sec' },
                  { label: 'Unix 时间戳 (毫秒)', value: String(result.milliseconds), key: 'ms' },
                ].map((item) => (
                  <div key={item.key} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">{item.label}</span>
                      <CopyButton value={item.value} />
                    </div>
                    <pre className="text-sm font-mono text-gray-800 dark:text-gray-200">{item.value}</pre>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
