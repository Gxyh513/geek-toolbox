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

  const handleDecode = useCallback(async (inputSrc) => {
    if (!inputSrc) return;
    setDecoding(true);
    try {
      const jsQR = (await import('jsqr')).default;
      const img = new Image();
      let createdUrl = null;

      if (typeof inputSrc === 'string') {
        let str = inputSrc.trim();
        if (str.startsWith('data:image/') || str.startsWith('http://') || str.startsWith('https://')) {
          img.src = str;
        } else {
          // 纯 Base64 字符串补全前缀
          img.src = `data:image/png;base64,${str}`;
        }
      } else if (inputSrc instanceof Blob || inputSrc instanceof File) {
        createdUrl = URL.createObjectURL(inputSrc);
        img.src = createdUrl;
      } else {
        setDecoding(false);
        return;
      }

      img.onerror = () => {
        if (createdUrl) URL.revokeObjectURL(createdUrl);
        setDecodedText('解码失败：无法加载图片，请检查 Data URL 或 Base64 文本格式');
        setDecoding(false);
      };

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
        if (createdUrl) URL.revokeObjectURL(createdUrl);
        setDecoding(false);
      };
    } catch (e) {
      setDecodedText('解码失败: ' + e.message);
      setDecoding(false);
    }
  }, []);

  // 监听键盘 Ctrl+V / Cmd+V 粘贴剪贴板图片或 Data URL 文本
  useEffect(() => {
    if (mode !== 'decode') return;
    const handlePaste = (e) => {
      // 1. 尝试剪贴板二进制图片
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              handleDecode(file);
              showToast('已从剪贴板读取二进制截图并解码');
              return;
            }
          }
        }
      }

      // 2. 尝试剪贴板文本 (Data URL 或 Base64 字符串)
      const textData = e.clipboardData?.getData('text');
      if (textData) {
        const trimmed = textData.trim();
        if (
          trimmed.startsWith('data:image/') ||
          trimmed.startsWith('iVBOR') ||
          trimmed.startsWith('/9j/') ||
          trimmed.startsWith('PHN2')
        ) {
          handleDecode(trimmed);
          showToast('已从剪贴板解析 Data URL / Base64 图片文本');
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [mode, handleDecode]);

  // 从剪贴板 API 读取二进制图片或文本图片
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard) {
        // 优先读取文本型 Data URL / Base64
        if (navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text) {
            const trimmed = text.trim();
            if (
              trimmed.startsWith('data:image/') ||
              trimmed.startsWith('iVBOR') ||
              trimmed.startsWith('/9j/') ||
              trimmed.startsWith('PHN2')
            ) {
              handleDecode(trimmed);
              showToast('已成功从剪贴板读取 Data URL / Base64 图片文本');
              return;
            }
          }
        }

        // 读取二进制截图
        if (navigator.clipboard.read) {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            const type = item.types.find((t) => t.startsWith('image/'));
            if (type) {
              const blob = await item.getType(type);
              const file = new File([blob], 'clipboard.png', { type });
              handleDecode(file);
              showToast('已成功从剪贴板读取截图文件');
              return;
            }
          }
        }
      }
      showToast('剪贴板中未找到有效的图片文件或 Data URL 文本', 'error');
    } catch (e) {
      showToast('无法直接读取剪贴板，请直接按 Ctrl+V 快捷键粘贴图片或文本', 'error');
    }
  };

  const btnClass = (active) => 'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors' + (active
    ? ' bg-blue-500 text-white'
    : ' bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400');

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="w-full flex-1 flex flex-col space-y-4 min-h-0">
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
          <div className="space-y-4">
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { if (e.target.files[0]) handleDecode(e.target.files[0]); }} />
            
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) {
                  handleDecode(e.dataTransfer.files[0]);
                }
              }}
              className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center text-center space-y-3 transition-colors"
            >
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                拖拽二维码图片到此处，或使用 <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 font-mono text-xs">Ctrl + V</kbd> 粘贴图片 / Data URL 文本
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => fileRef.current.click()}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                >
                  选择图片文件
                </button>
                <button
                  onClick={handlePasteFromClipboard}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
                >
                  从剪贴板读取
                </button>
              </div>
              <span className="text-xs text-gray-400">支持 JPG / PNG / WebP / Data URL (data:image/...) 文本</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-400 block font-semibold">
                粘贴 Data URL / Base64 图片文本直接解码
              </label>
              <textarea
                rows={2}
                placeholder="例如粘贴: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] font-mono text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (val) handleDecode(val);
                }}
              />
            </div>

            {decoding && <p className="text-xs text-gray-400 text-center">解码中...</p>}
            {decodedText && (
              <div>
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
