import { useState, useRef, useCallback, useEffect } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { showToast } from '../../components/ui/Toast';
import { useDebounce } from '../../hooks/useDebounce';

const TOOL_ID = 'qrcode';

export default function QRCodeTool() {
  const [mode, setMode] = useState('generate');
  const [text, setText] = useState('https://github.com');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [decodedText, setDecodedText] = useState('');
  const [decoding, setDecoding] = useState(false);
  const fileRef = useRef(null);
  const debouncedText = useDebounce(text, 300);

  useEffect(() => {
    if (mode === 'generate' && debouncedText) {
      import('qrcode').then((mod) => {
        mod.default.toDataURL(debouncedText, { width: 280, margin: 2, color: { dark: '#1a1a2e', light: '#ffffff' } })
          .then(setQrDataUrl)
          .catch(() => showToast('生成二维码失败', 'error'));
      });
    }
  }, [debouncedText, mode]);

  const handleDecode = async (file) => {
    if (!file) return;
    setDecoding(true);
    try {
      const jsQR = (await import('jsqr')).default;
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        setDecodedText(code ? code.data : '未能识别二维码，请尝试更清晰的图片');
        if (code) showToast('解码成功');
        URL.revokeObjectURL(url);
        setDecoding(false);
      };
      img.src = url;
    } catch (e) {
      setDecodedText('解码失败: ' + e.message);
      setDecoding(false);
    }
  };

  const btnClass = (active) => 'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors' + (active
    ? ' bg-blue-500 text-white'
    : ' bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400');

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        <div className="flex items-center gap-2">
          <button onClick={() => setMode('generate')} className={btnClass(mode === 'generate')}>
            生成二维码
          </button>
          <button onClick={() => setMode('decode')} className={btnClass(mode === 'decode')}>
            解码二维码
          </button>
        </div>

        {mode === 'generate' ? (
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">输入文本 / URL</label>
            <textarea className="terminal-textarea" rows={3}
              value={text} onChange={(e) => setText(e.target.value)}
              placeholder="输入要编码的文本..." spellCheck={false} />
            <div className="flex flex-col items-center gap-2 mt-4">
              {qrDataUrl ? (
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                  <img src={qrDataUrl} alt="QR Code" className="w-56 h-56" />
                </div>
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-gray-400 text-xs bg-white rounded-xl border">
                  输入内容后自动生成
                </div>
              )}
              {qrDataUrl && (
                <div className="flex items-center gap-2">
                  <CopyButton value={qrDataUrl} label="已复制二维码图片 (Base64)" />
                  <a href={qrDataUrl} download="qrcode.png"
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    下载 PNG
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3">
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { if (e.target.files[0]) handleDecode(e.target.files[0]); }} />
              <button onClick={() => fileRef.current.click()}
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors">
                选择图片
              </button>
              <span className="text-xs text-gray-400">支持 JPG / PNG / WebP</span>
            </div>
            {decoding && <p className="text-xs text-gray-400 mt-2">解码中...</p>}
            {decodedText && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-gray-500 dark:text-gray-500">解码结果</label>
                  <CopyButton value={decodedText} />
                </div>
                <div className="output-card">
                  <pre className="whitespace-pre-wrap break-all text-sm">{decodedText}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
