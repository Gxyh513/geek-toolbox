import { useState, useMemo } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';

const TOOL_ID = 'gradient-generator';

export default function GradientGeneratorTool() {
  const [type, setType] = useState('linear');
  const [angle, setAngle] = useState('90');
  const [color1, setColor1] = useState('#3498db');
  const [color2, setColor2] = useState('#e74c3c');

  const css = useMemo(() => {
    if (type === 'linear') {
      return `background: linear-gradient(${angle}deg, ${color1}, ${color2});`;
    }
    return `background: radial-gradient(circle, ${color1}, ${color2});`;
  }, [type, angle, color1, color2]);

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        {/* 渐变预览 */}
        <div className="h-40 rounded-xl border border-gray-200 dark:border-gray-700"
          style={{
            background: type === 'linear'
              ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
              : `radial-gradient(circle, ${color1}, ${color2})`,
          }} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">类型</label>
            <div className="flex gap-2">
              <button onClick={() => setType('linear')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  type === 'linear' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>线性</button>
              <button onClick={() => setType('radial')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  type === 'radial' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>径向</button>
            </div>
          </div>

          {type === 'linear' && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">角度: {angle}°</label>
              <input type="range" min={0} max={360} value={angle}
                onChange={(e) => setAngle(e.target.value)} className="w-full accent-blue-500" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0° (上→下)</span><span>90° (左→右)</span><span>360°</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">颜色 1</label>
            <div className="flex items-center gap-2">
              <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-700" />
              <input className="terminal-input font-mono uppercase flex-1" value={color1}
                onChange={(e) => setColor1(e.target.value)} maxLength={7} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">颜色 2</label>
            <div className="flex items-center gap-2">
              <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-700" />
              <input className="terminal-input font-mono uppercase flex-1" value={color2}
                onChange={(e) => setColor2(e.target.value)} maxLength={7} />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-500 dark:text-gray-500">CSS 代码</label>
            <CopyButton value={css} />
          </div>
          <pre className="output-card font-mono text-sm select-all">{css}</pre>
        </div>
      </div>
    </ToolPageLayout>
  );
}
