import { useState, useEffect } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { showToast } from '../../components/ui/Toast';
import { Clock } from 'lucide-react';

const TOOL_ID = 'timestamp-e';

function formatDate(d) {
  const Y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, '0');
  const D = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

export default function TimestampETool() {
  const [now, setNow] = useState(new Date());

  const [inputTs, setInputTs] = useState('');
  const [tsToDateRes, setTsToDateRes] = useState('-');

  const [inputDate, setInputDate] = useState('');
  const [dateToSecRes, setDateToSecRes] = useState('-');
  const [dateToMsRes, setDateToMsRes] = useState('-');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const secTs = Math.floor(now.getTime() / 1000);
  const msTs = now.getTime();
  const dateStr = formatDate(now);

  const handleTsToDate = () => {
    const val = inputTs.trim();
    if (!val) return;
    let ts = parseInt(val, 10);
    if (isNaN(ts)) {
      setTsToDateRes('无效的时间戳');
      return;
    }
    if (val.length === 10) ts = ts * 1000;
    const d = new Date(ts);
    if (isNaN(d.getTime())) {
      setTsToDateRes('无效的时间戳');
    } else {
      setTsToDateRes(formatDate(d));
      showToast('转换成功');
    }
  };

  const handleDateToTs = () => {
    const val = inputDate.trim();
    if (!val) return;
    const d = new Date(val.replace(/-/g, '/'));
    if (isNaN(d.getTime())) {
      setDateToSecRes('无效日期');
      setDateToMsRes('无效日期');
    } else {
      setDateToSecRes(String(Math.floor(d.getTime() / 1000)));
      setDateToMsRes(String(d.getTime()));
      showToast('转换成功');
    }
  };

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="w-full flex-1 flex flex-col space-y-4 min-h-0">
        {/* 实时时钟面板 */}
        <div className="p-4 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent rounded-lg border border-blue-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>当前系统时间与时间戳</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-white dark:bg-[#161b22] rounded border border-gray-200 dark:border-gray-800 space-y-1">
              <div className="text-[11px] text-gray-400">10位 Unix 时间戳 (秒)</div>
              <div className="flex items-center justify-between font-mono text-base font-bold text-gray-800 dark:text-gray-100">
                <span>{secTs}</span>
                <CopyButton value={String(secTs)} />
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#161b22] rounded border border-gray-200 dark:border-gray-800 space-y-1">
              <div className="text-[11px] text-gray-400">13位 毫秒时间戳</div>
              <div className="flex items-center justify-between font-mono text-base font-bold text-gray-800 dark:text-gray-100">
                <span>{msTs}</span>
                <CopyButton value={String(msTs)} />
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#161b22] rounded border border-gray-200 dark:border-gray-800 space-y-1">
              <div className="text-[11px] text-gray-400">北京时间 (本地时间)</div>
              <div className="flex items-center justify-between font-mono text-sm font-bold text-blue-500">
                <span>{dateStr}</span>
                <CopyButton value={dateStr} />
              </div>
            </div>
          </div>
        </div>

        {/* 转换算盘 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 左：时间戳转北京时间 */}
          <div className="p-4 bg-white dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-gray-800 space-y-3">
            <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400">时间戳 ➔ 标准北京时间</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputTs}
                  onChange={(e) => setInputTs(e.target.value)}
                  placeholder="例如: 1784650000"
                  className="flex-1 p-2 rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleTsToDate}
                  className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
                >
                  转换时间
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded font-mono text-xs">
                <span className="text-gray-500">转换结果: <strong className="text-blue-500">{tsToDateRes}</strong></span>
                {tsToDateRes !== '-' && <CopyButton value={tsToDateRes} />}
              </div>
            </div>
          </div>

          {/* 右：北京时间转时间戳 */}
          <div className="p-4 bg-white dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-gray-800 space-y-3">
            <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400">标准北京时间 ➔ 时间戳</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  placeholder="例如: 2026-07-21 23:30:00"
                  className="flex-1 p-2 rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleDateToTs}
                  className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
                >
                  转换时间戳
                </button>
              </div>

              <div className="space-y-1 bg-gray-50 dark:bg-gray-900 p-2.5 rounded font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">10位秒: <strong className="text-green-500">{dateToSecRes}</strong></span>
                  {dateToSecRes !== '-' && <CopyButton value={dateToSecRes} />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">13位毫秒: <strong className="text-purple-500">{dateToMsRes}</strong></span>
                  {dateToMsRes !== '-' && <CopyButton value={dateToMsRes} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
