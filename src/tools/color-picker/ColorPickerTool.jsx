import { useState, useMemo, useCallback } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';

const TOOL_ID = 'color-picker';

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  if (clean.length !== 6 && clean.length !== 3) return null;
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const num = parseInt(full, 16);
  if (isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function ColorPickerTool() {
  const [hex, setHex] = useState('#3498db');

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null, [rgb]);

  const handleHexChange = useCallback((val) => {
    const clean = val.startsWith('#') ? val : '#' + val;
    if (/^#[0-9a-fA-F]{3,6}$/.test(clean)) setHex(clean);
    else setHex(val);
  }, []);

  const textColor = rgb && (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > 128 ? '#1a1a1a' : '#ffffff';

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        {/* 颜色预览 & 输入 */}
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex-shrink-0"
            style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#cccccc' }} />
          <div className="flex-1">
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">HEX</label>
            <div className="flex items-center gap-2">
              <input className="terminal-input w-32 font-mono uppercase"
                value={hex} onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#000000" maxLength={7} />
              {/^#[0-9a-fA-F]{6}$/.test(hex) && <CopyButton value={hex} />}
            </div>
            <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#3498db'}
              onChange={(e) => setHex(e.target.value)}
              className="mt-2 w-32 h-8 rounded cursor-pointer" />
          </div>
        </div>

        {/* RGB / HSL */}
        {rgb && hsl && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">RGB</span>
                <CopyButton value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1"><label className="text-xs text-gray-400">R</label>
                  <input type="number" min={0} max={255} value={rgb.r}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 0;
                      setHex('#' + [v, rgb.g, rgb.b].map(c => Math.round(c).toString(16).padStart(2, '0').toUpperCase()).join(''));
                    }}
                    className="terminal-input font-mono" /></div>
                <div className="flex-1"><label className="text-xs text-gray-400">G</label>
                  <input type="number" min={0} max={255} value={rgb.g}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 0;
                      setHex('#' + [rgb.r, v, rgb.b].map(c => Math.round(c).toString(16).padStart(2, '0').toUpperCase()).join(''));
                    }}
                    className="terminal-input font-mono" /></div>
                <div className="flex-1"><label className="text-xs text-gray-400">B</label>
                  <input type="number" min={0} max={255} value={rgb.b}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 0;
                      setHex('#' + [rgb.r, rgb.g, v].map(c => Math.round(c).toString(16).padStart(2, '0').toUpperCase()).join(''));
                    }}
                    className="terminal-input font-mono" /></div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">HSL</span>
                <CopyButton value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1"><label className="text-xs text-gray-400">H</label>
                  <div className="terminal-input font-mono text-sm">{hsl.h}°</div></div>
                <div className="flex-1"><label className="text-xs text-gray-400">S</label>
                  <div className="terminal-input font-mono text-sm">{hsl.s}%</div></div>
                <div className="flex-1"><label className="text-xs text-gray-400">L</label>
                  <div className="terminal-input font-mono text-sm">{hsl.l}%</div></div>
              </div>
            </div>
          </div>
        )}

        {/* 颜色信息卡片 */}
        {/^#[0-9a-fA-F]{6}$/.test(hex) && (
          <div className="rounded-xl p-6 text-center" style={{ backgroundColor: hex, color: textColor }}>
            <span className="font-mono text-lg font-bold tracking-wider">{hex.toUpperCase()}</span>
            {rgb && <span className="block text-sm opacity-80 mt-1">rgb({rgb.r}, {rgb.g}, {rgb.b})</span>}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
