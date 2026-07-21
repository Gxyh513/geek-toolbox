import { useState, useMemo } from 'react';
import { toString } from 'cronstrue';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';

const TOOL_ID = 'cron-parser';

const EXAMPLES = [
  { expr: '*/5 * * * *', label: '每5分钟' },
  { expr: '0 * * * *', label: '每小时' },
  { expr: '0 9 * * *', label: '每天 9:00' },
  { expr: '0 9 * * 1-5', label: '工作日 9:00' },
  { expr: '30 4 * * 1', label: '每周一 4:30' },
  { expr: '0 0 1 * *', label: '每月1日午夜' },
  { expr: '0 */2 * * *', label: '每2小时' },
  { expr: '0 0 * * 0', label: '每周日午夜' },
];

export default function CronParserTool() {
  const [expr, setExpr] = useState('*/5 * * * *');

  const description = useMemo(() => {
    try {
      return toString(expr, { throwExceptionOnParseError: true });
    } catch (e) {
      return null;
    }
  }, [expr]);

  const parts = useMemo(() => {
    const p = expr.trim().split(/\s+/);
    if (p.length !== 5) return null;
    const labels = ['分钟 (0-59)', '小时 (0-23)', '日 (1-31)', '月份 (1-12)', '星期 (0-7)'];
    return p.map((v, i) => ({ value: v, label: labels[i] }));
  }, [expr]);

  const nextDates = useMemo(() => {
    if (!description) return [];
    const dates = [];
    let d = new Date();
    d.setSeconds(0, 0);
    for (let i = 0; i < 5; i++) {
      d.setMinutes(d.getMinutes() + 1);
      dates.push(new Date(d));
    }
    return dates;
  }, [description]);

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">Cron 表达式 (5段)</label>
          <input className="terminal-input font-mono text-lg tracking-wider"
            value={expr} onChange={(e) => setExpr(e.target.value)}
            placeholder="*/5 * * * *" spellCheck={false} />
        </div>

        {description ? (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">可读描述</span>
                <p className="text-sm text-green-800 dark:text-green-300 mt-1 font-medium">{description}</p>
              </div>
              <CopyButton value={description} label="已复制描述" />
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-500 text-xs">无效的 Cron 表达式，请输入标准的 5 段式 (分 时 日 月 星期)</p>
          </div>
        )}

        {parts && (
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">字段分解</label>
            <div className="grid grid-cols-5 gap-2">
              {parts.map((p, i) => (
                <div key={i} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-800">
                  <code className="block text-lg font-mono font-bold text-blue-500">{p.value}</code>
                  <span className="text-xs text-gray-400">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 常用示例 */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">常用示例</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {EXAMPLES.map((ex) => (
              <button key={ex.expr} onClick={() => setExpr(ex.expr)}
                className="text-left p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] hover:border-blue-500 transition-colors">
                <code className="block text-xs font-mono text-blue-500">{ex.expr}</code>
                <span className="text-xs text-gray-400">{ex.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
