import { useState, useCallback } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { showToast } from '../../components/ui/Toast';

const TOOL_ID = 'uuid-generator';

/**
 * 生成一个 UUID v4
 */
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function UuidGeneratorTool() {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);

  const generate = useCallback(() => {
    const c = Math.max(1, Math.min(100, count));
    return Array.from({ length: c }, () => {
      const id = uuidv4();
      return uppercase ? id.toUpperCase() : id;
    });
  }, [count, uppercase]);

  const [uuids, setUuids] = useState(() => generate());

  const handleRegenerate = () => {
    setUuids(generate());
  };

  const copyAll = useCallback(() => {
    const text = uuids.join('\n');
    navigator.clipboard.writeText(text).then(() => showToast('已复制全部 UUID'));
  }, [uuids]);

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        {/* 控制栏 */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-500">生成数量</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="terminal-input w-20 text-center"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">大写</span>
          </label>

          <button
            onClick={handleRegenerate}
            className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
          >
            重新生成
          </button>
        </div>

        {/* 结果区 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-500">
              共 {uuids.length} 个 UUID v4
            </label>
            <div className="flex items-center gap-2">
              <CopyButton value={uuids.join('\n')} label="已复制全部 UUID" />
            </div>
          </div>
          <div className="output-card max-h-96 overflow-y-auto">
            {uuids.map((id, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <code className="text-sm font-mono text-gray-700 dark:text-gray-300 select-all">{id}</code>
                <CopyButton value={id} label={`已复制 ${id}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
