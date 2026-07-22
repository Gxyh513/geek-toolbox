import { useState, useMemo } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { showToast } from '../../components/ui/Toast';
import CryptoJS from 'crypto-js';
import {
  Lock,
  Unlock,
  Fingerprint,
  Key,
  ShieldCheck,
  Search,
  Sparkles,
  Trash2,
  CheckCircle2,
  Zap,
  ArrowRight,
  Code2,
  Layers,
} from 'lucide-react';

const TOOL_ID = 'crypto-e';

const SAMPLE_TEXT = 'Hello Antigravity 易语言 2026';
const SAMPLE_KEY = '1234567890123456';
const SAMPLE_IV = '1234567890123456';

export default function CryptoETool() {
  const [activeTab, setActiveTab] = useState('hash'); // 'hash' | 'encrypt' | 'decrypt'

  // Tab 1: 哈希与摘要全集状态
  const [text, setText] = useState(SAMPLE_TEXT);
  const [keyStr, setKeyStr] = useState(SAMPLE_KEY);
  const [searchFilter, setSearchFilter] = useState('');

  // Tab 2: 对称加密工作台状态
  const [encAlgo, setEncAlgo] = useState('AES-CBC');
  const [encKey, setEncKey] = useState(SAMPLE_KEY);
  const [encIv, setEncIv] = useState(SAMPLE_IV);
  const [plainInput, setPlainInput] = useState(SAMPLE_TEXT);
  const [encResultB64, setEncResultB64] = useState('');
  const [encResultHex, setEncResultHex] = useState('');
  const [encStatus, setEncStatus] = useState('idle');

  // Tab 3: 对称解密工作台状态
  const [cipherInput, setCipherInput] = useState('');
  const [decryptAlgo, setDecryptAlgo] = useState('AES-CBC');
  const [decryptKey, setDecryptKey] = useState(SAMPLE_KEY);
  const [decryptIv, setDecryptIv] = useState(SAMPLE_IV);
  const [decryptedResult, setDecryptedResult] = useState('');
  const [decryptStatus, setDecryptStatus] = useState('idle');

  // 1. 哈希与 HMAC 算法计算全集 (纯 HEX 输出)
  const rawResults = useMemo(() => {
    if (!text) return null;

    try {
      // 1. MD5
      const md532 = CryptoJS.MD5(text).toString();
      const md532L = md532.toLowerCase();
      const md532U = md532.toUpperCase();
      const md516L = md532.substring(8, 24).toLowerCase();
      const md516U = md532.substring(8, 24).toUpperCase();

      // 2. SHA 算法全集
      const sha1 = CryptoJS.SHA1(text).toString();
      const sha224 = CryptoJS.SHA224(text).toString();
      const sha256 = CryptoJS.SHA256(text).toString();
      const sha384 = CryptoJS.SHA384(text).toString();
      const sha512 = CryptoJS.SHA512(text).toString();
      const sha3 = CryptoJS.SHA3(text, { outputLength: 512 }).toString();
      const ripemd160 = CryptoJS.RIPEMD160(text).toString();

      // 3. HMAC 全集 (纯 Hex 格式)
      let hmacMd5 = '-';
      let hmacSha1 = '-';
      let hmacSha256 = '-';
      let hmacSha512 = '-';

      if (keyStr) {
        hmacMd5 = CryptoJS.HmacMD5(text, keyStr).toString();
        hmacSha1 = CryptoJS.HmacSHA1(text, keyStr).toString();
        hmacSha256 = CryptoJS.HmacSHA256(text, keyStr).toString();
        hmacSha512 = CryptoJS.HmacSHA512(text, keyStr).toString();
      }

      return [
        // 摘要哈希类 (Hex)
        { category: 'hash', name: 'MD5 (32位小写)', value: md532L, bits: '128-bit' },
        { category: 'hash', name: 'MD5 (32位大写)', value: md532U, bits: '128-bit' },
        { category: 'hash', name: 'MD5 (16位小写)', value: md516L, bits: '64-bit' },
        { category: 'hash', name: 'MD5 (16位大写)', value: md516U, bits: '64-bit' },
        { category: 'hash', name: 'SHA-1 (Hex)', value: sha1, bits: '160-bit' },
        { category: 'hash', name: 'SHA-224 (Hex)', value: sha224, bits: '224-bit' },
        { category: 'hash', name: 'SHA-256 (Hex)', value: sha256, bits: '256-bit' },
        { category: 'hash', name: 'SHA-384 (Hex)', value: sha384, bits: '384-bit' },
        { category: 'hash', name: 'SHA-512 (Hex)', value: sha512, bits: '512-bit' },
        { category: 'hash', name: 'SHA-3 (512位 Hex)', value: sha3, bits: '512-bit' },
        { category: 'hash', name: 'RIPEMD-160 (Hex)', value: ripemd160, bits: '160-bit', fullSpan: true },

        // HMAC 认证类 (Hex)
        { category: 'hmac', name: 'HMAC-MD5 (Hex)', value: hmacMd5, bits: '128-bit' },
        { category: 'hmac', name: 'HMAC-SHA1 (Hex)', value: hmacSha1, bits: '160-bit' },
        { category: 'hmac', name: 'HMAC-SHA256 (Hex)', value: hmacSha256, bits: '256-bit' },
        { category: 'hmac', name: 'HMAC-SHA512 (Hex)', value: hmacSha512, bits: '512-bit' },
      ];
    } catch (e) {
      return null;
    }
  }, [text, keyStr]);

  // 搜索过滤
  const filteredResults = useMemo(() => {
    if (!rawResults) return null;
    if (!searchFilter.trim()) return rawResults;
    const q = searchFilter.toLowerCase().trim();
    return rawResults.filter(
      (r) => r.name.toLowerCase().includes(q) || r.category.includes(q)
    );
  }, [rawResults, searchFilter]);

  const hashItems = useMemo(() => filteredResults?.filter((r) => r.category === 'hash') || [], [filteredResults]);
  const hmacItems = useMemo(() => filteredResults?.filter((r) => r.category === 'hmac') || [], [filteredResults]);

  // Tab 2: 执行对称加密
  const handleEncrypt = () => {
    if (!plainInput.trim()) {
      showToast('请输入要加密的明文文本');
      setEncStatus('error');
      return;
    }
    if (!encKey) {
      showToast('请输入加密 Key');
      setEncStatus('error');
      return;
    }

    try {
      const keyUtf8 = CryptoJS.enc.Utf8.parse(encKey);
      const ivUtf8 = CryptoJS.enc.Utf8.parse(encIv);
      let encryptedObj = null;

      switch (encAlgo) {
        case 'AES-CBC':
          encryptedObj = CryptoJS.AES.encrypt(plainInput, keyUtf8, {
            iv: ivUtf8,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          });
          break;
        case 'AES-ECB':
          encryptedObj = CryptoJS.AES.encrypt(plainInput, keyUtf8, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
          });
          break;
        case 'DES-CBC':
          encryptedObj = CryptoJS.DES.encrypt(plainInput, keyUtf8, {
            iv: ivUtf8,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          });
          break;
        case 'DES-ECB':
          encryptedObj = CryptoJS.DES.encrypt(plainInput, keyUtf8, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
          });
          break;
        case '3DES-CBC':
          encryptedObj = CryptoJS.TripleDES.encrypt(plainInput, keyUtf8, {
            iv: ivUtf8,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          });
          break;
        case 'RC4':
          encryptedObj = CryptoJS.RC4.encrypt(plainInput, encKey);
          break;
        case 'Rabbit':
          encryptedObj = CryptoJS.Rabbit.encrypt(plainInput, encKey);
          break;
        default:
          break;
      }

      if (encryptedObj) {
        setEncResultB64(encryptedObj.toString());
        setEncResultHex(encryptedObj.ciphertext ? encryptedObj.ciphertext.toString() : '');
        setEncStatus('success');
        showToast('加密成功');
      }
    } catch (e) {
      setEncStatus('error');
      showToast(`加密失败: ${e.message}`, 'error');
    }
  };

  // Tab 2: 快捷加载对称加密示例
  const loadEncSample = (algo) => {
    setEncKey(SAMPLE_KEY);
    setEncIv(SAMPLE_IV);
    setPlainInput(SAMPLE_TEXT);
    setEncAlgo(algo);

    setTimeout(() => {
      const keyUtf8 = CryptoJS.enc.Utf8.parse(SAMPLE_KEY);
      const ivUtf8 = CryptoJS.enc.Utf8.parse(SAMPLE_IV);
      let enc = null;

      if (algo === 'AES-CBC') enc = CryptoJS.AES.encrypt(SAMPLE_TEXT, keyUtf8, { iv: ivUtf8, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
      else if (algo === 'AES-ECB') enc = CryptoJS.AES.encrypt(SAMPLE_TEXT, keyUtf8, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
      else if (algo === 'DES-CBC') enc = CryptoJS.DES.encrypt(SAMPLE_TEXT, keyUtf8, { iv: ivUtf8, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
      else if (algo === 'DES-ECB') enc = CryptoJS.DES.encrypt(SAMPLE_TEXT, keyUtf8, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
      else if (algo === '3DES-CBC') enc = CryptoJS.TripleDES.encrypt(SAMPLE_TEXT, keyUtf8, { iv: ivUtf8, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
      else if (algo === 'RC4') enc = CryptoJS.RC4.encrypt(SAMPLE_TEXT, SAMPLE_KEY);
      else if (algo === 'Rabbit') enc = CryptoJS.Rabbit.encrypt(SAMPLE_TEXT, SAMPLE_KEY);

      if (enc) {
        setEncResultB64(enc.toString());
        setEncResultHex(enc.ciphertext ? enc.ciphertext.toString() : '');
        setEncStatus('success');
      }
    }, 50);

    showToast(`已加载 ${algo} 加密示例并生成密文`);
  };

  // Tab 3: 执行对称解密
  const handleDecrypt = () => {
    if (!cipherInput.trim()) {
      showToast('请输入需要解密的密文');
      setDecryptStatus('error');
      setDecryptedResult('解密失败：请输入有效的密文');
      return;
    }
    if (!decryptKey) {
      showToast('请输入解密密钥');
      setDecryptStatus('error');
      setDecryptedResult('解密失败：请输入解密 Key');
      return;
    }

    try {
      const keyUtf8 = CryptoJS.enc.Utf8.parse(decryptKey);
      const ivUtf8 = CryptoJS.enc.Utf8.parse(decryptIv);
      let decrypted = '';

      switch (decryptAlgo) {
        case 'AES-CBC':
          decrypted = CryptoJS.AES.decrypt(cipherInput.trim(), keyUtf8, {
            iv: ivUtf8,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          }).toString(CryptoJS.enc.Utf8);
          break;
        case 'AES-ECB':
          decrypted = CryptoJS.AES.decrypt(cipherInput.trim(), keyUtf8, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
          }).toString(CryptoJS.enc.Utf8);
          break;
        case 'DES-CBC':
          decrypted = CryptoJS.DES.decrypt(cipherInput.trim(), keyUtf8, {
            iv: ivUtf8,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          }).toString(CryptoJS.enc.Utf8);
          break;
        case 'DES-ECB':
          decrypted = CryptoJS.DES.decrypt(cipherInput.trim(), keyUtf8, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
          }).toString(CryptoJS.enc.Utf8);
          break;
        case '3DES-CBC':
          decrypted = CryptoJS.TripleDES.decrypt(cipherInput.trim(), keyUtf8, {
            iv: ivUtf8,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          }).toString(CryptoJS.enc.Utf8);
          break;
        case 'RC4':
          decrypted = CryptoJS.RC4.decrypt(cipherInput.trim(), decryptKey).toString(CryptoJS.enc.Utf8);
          break;
        case 'Rabbit':
          decrypted = CryptoJS.Rabbit.decrypt(cipherInput.trim(), decryptKey).toString(CryptoJS.enc.Utf8);
          break;
        default:
          break;
      }

      if (!decrypted) {
        setDecryptStatus('error');
        setDecryptedResult('解密失败：可能密文、密钥(Key)或向量(IV)不匹配');
        showToast('解密失败');
      } else {
        setDecryptStatus('success');
        setDecryptedResult(decrypted);
        showToast('解密成功');
      }
    } catch (e) {
      setDecryptStatus('error');
      setDecryptedResult(`解密出错: ${e.message}`);
    }
  };

  // Tab 3: 快捷加载示例解密密文
  const loadDecSample = (algo) => {
    const sampleText = 'Hello Antigravity 易语言 2026';
    const sampleKey = '1234567890123456';
    const sampleIv = '1234567890123456';
    const keyUtf8 = CryptoJS.enc.Utf8.parse(sampleKey);
    const ivUtf8 = CryptoJS.enc.Utf8.parse(sampleIv);
    let cipher = '';

    setDecryptKey(sampleKey);
    setDecryptIv(sampleIv);
    setDecryptAlgo(algo);

    try {
      switch (algo) {
        case 'AES-CBC':
          cipher = CryptoJS.AES.encrypt(sampleText, keyUtf8, {
            iv: ivUtf8,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          }).toString();
          break;
        case 'AES-ECB':
          cipher = CryptoJS.AES.encrypt(sampleText, keyUtf8, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
          }).toString();
          break;
        case 'DES-CBC':
          cipher = CryptoJS.DES.encrypt(sampleText, keyUtf8, {
            iv: ivUtf8,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          }).toString();
          break;
        case 'DES-ECB':
          cipher = CryptoJS.DES.encrypt(sampleText, keyUtf8, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
          }).toString();
          break;
        case '3DES-CBC':
          cipher = CryptoJS.TripleDES.encrypt(sampleText, keyUtf8, {
            iv: ivUtf8,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          }).toString();
          break;
        case 'RC4':
          cipher = CryptoJS.RC4.encrypt(sampleText, sampleKey).toString();
          break;
        case 'Rabbit':
          cipher = CryptoJS.Rabbit.encrypt(sampleText, sampleKey).toString();
          break;
        default:
          break;
      }
      setCipherInput(cipher);

      setTimeout(() => {
        let dec = '';
        if (algo === 'RC4') dec = CryptoJS.RC4.decrypt(cipher, sampleKey).toString(CryptoJS.enc.Utf8);
        else if (algo === 'Rabbit') dec = CryptoJS.Rabbit.decrypt(cipher, sampleKey).toString(CryptoJS.enc.Utf8);
        else if (algo === 'AES-CBC') dec = CryptoJS.AES.decrypt(cipher, keyUtf8, { iv: ivUtf8, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
        else if (algo === 'AES-ECB') dec = CryptoJS.AES.decrypt(cipher, keyUtf8, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
        else if (algo === 'DES-CBC') dec = CryptoJS.DES.decrypt(cipher, keyUtf8, { iv: ivUtf8, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
        else if (algo === 'DES-ECB') dec = CryptoJS.DES.decrypt(cipher, keyUtf8, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
        else if (algo === '3DES-CBC') dec = CryptoJS.TripleDES.decrypt(cipher, keyUtf8, { iv: ivUtf8, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);

        setDecryptedResult(dec);
        setDecryptStatus('success');
      }, 50);

      showToast(`已加载 ${algo} 示例参数并自动解密`);
    } catch (e) {
      showToast('快捷示例加载失败', 'error');
    }
  };

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="w-full flex-1 flex flex-col space-y-5 min-h-0">
        {/* 顶部三标签页 Views 分栏 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-3 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 dark:bg-gray-800/80 p-1.5 rounded-xl">
            <button
              onClick={() => setActiveTab('hash')}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-lg font-bold transition-all ${
                activeTab === 'hash'
                  ? 'bg-white dark:bg-[#161b22] text-cyan-600 dark:text-cyan-400 shadow-md shadow-cyan-500/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Fingerprint className="w-4 h-4 text-cyan-500" />
              哈希与摘要套件 (HASH / HMAC 全算法)
            </button>

            <button
              onClick={() => setActiveTab('encrypt')}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-lg font-bold transition-all ${
                activeTab === 'encrypt'
                  ? 'bg-white dark:bg-[#161b22] text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Lock className="w-4 h-4 text-emerald-500" />
              对称加密工作台 (AES / DES / RC4)
            </button>

            <button
              onClick={() => setActiveTab('decrypt')}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-lg font-bold transition-all ${
                activeTab === 'decrypt'
                  ? 'bg-white dark:bg-[#161b22] text-purple-600 dark:text-purple-400 shadow-md shadow-purple-500/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Unlock className="w-4 h-4 text-purple-500" />
              对称解密工作台 (AES / DES / RC4)
            </button>
          </div>

          {activeTab === 'hash' && (
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="搜索 HASH 算法 (如 md5, sha256)..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] text-xs font-mono text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-cyan-500 w-60"
              />
            </div>
          )}
        </div>

        {/* 视角 1: HASH / HMAC 摘要哈希全集 */}
        {activeTab === 'hash' && (
          <div className="space-y-4">
            {/* 配置控制卡片 */}
            <div className="p-4 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-transparent rounded-xl border border-cyan-200/80 dark:border-cyan-900/50 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Fingerprint className="w-4 h-4" />
                  <span>哈希与摘要配置面板 (Hash & HMAC Engine)</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setText(SAMPLE_TEXT);
                      setKeyStr(SAMPLE_KEY);
                      showToast('已重置示例参数');
                    }}
                    className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-xs font-medium hover:bg-cyan-500/20 transition-all border border-cyan-200/50 dark:border-cyan-800/50"
                  >
                    载入示例明文 & Key
                  </button>
                  <button
                    onClick={() => {
                      setText('');
                      setKeyStr('');
                    }}
                    className="px-2.5 py-1 rounded bg-red-500/10 text-red-600 text-xs font-medium hover:bg-red-500/20 transition-all border border-red-200/50 dark:border-red-800/50 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    清空
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                    原始明文文本 (Input Text)
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="在此输入要计算哈希摘要的原始文本..."
                    className="w-full h-20 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] font-mono text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                    HMAC 签名密钥 (Secret Key)
                  </label>
                  <input
                    type="text"
                    value={keyStr}
                    onChange={(e) => setKeyStr(e.target.value)}
                    placeholder="HMAC 密钥 Key 字符串..."
                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] font-mono text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* 结果算法展示组 */}
            {filteredResults ? (
              <div className="space-y-5">
                {/* 1. 摘要哈希全集 */}
                {hashItems.length > 0 && (
                  <div className="p-4 bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800/80 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                        <Fingerprint className="w-4 h-4" />
                        <span>摘要哈希算法全集 (MD5 16/32位 · SHA全集 · RIPEMD160)</span>
                      </div>
                      <span className="text-[11px] text-cyan-500/70 font-mono font-semibold">({hashItems.length} 项)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                      {hashItems.map((item) => (
                        <div
                          key={item.name}
                          className={`p-3 bg-cyan-500/5 dark:bg-cyan-950/20 hover:bg-cyan-500/10 dark:hover:bg-cyan-950/40 rounded-lg border border-cyan-200/60 dark:border-cyan-800/40 transition-all space-y-1.5 ${
                            item.fullSpan ? 'md:col-span-2' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between text-cyan-800 dark:text-cyan-300 font-sans text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold">{item.name}</span>
                              {item.bits && <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-600 font-mono">{item.bits}</span>}
                            </div>
                            <CopyButton value={item.value} label="复制" />
                          </div>
                          <div className="break-all font-bold text-cyan-600 dark:text-cyan-400 text-xs leading-relaxed">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. HMAC 消息认证码全集 */}
                {hmacItems.length > 0 && (
                  <div className="p-4 bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800/80 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        <Key className="w-4 h-4" />
                        <span>HMAC 消息认证码全集 (HMAC-MD5 / SHA1 / SHA256 / SHA512)</span>
                      </div>
                      <span className="text-[11px] text-purple-500/70 font-mono font-semibold">({hmacItems.length} 项)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                      {hmacItems.map((item) => (
                        <div
                          key={item.name}
                          className={`p-3 bg-purple-500/5 dark:bg-purple-950/20 hover:bg-purple-500/10 dark:hover:bg-purple-950/40 rounded-lg border border-purple-200/60 dark:border-purple-800/40 transition-all space-y-1.5 ${
                            item.fullSpan ? 'md:col-span-2' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between text-purple-800 dark:text-purple-300 font-sans text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold">{item.name}</span>
                              {item.bits && <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 font-mono">{item.bits}</span>}
                            </div>
                            <CopyButton value={item.value} label="复制" />
                          </div>
                          <div className="break-all font-bold text-purple-600 dark:text-purple-400 text-xs leading-relaxed">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 text-xs py-12">请输入明文计算哈希结果</div>
            )}
          </div>
        )}

        {/* 视角 2: 对称加密工作台 */}
        {activeTab === 'encrypt' && (
          <div className="flex-1 flex flex-col space-y-4 min-h-0">
            {/* 顶部：快捷算法切换 Pills & 预设示例芯片 */}
            <div className="p-4 bg-gradient-to-r from-emerald-900/10 via-emerald-600/5 to-transparent rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 shadow-sm space-y-3 flex-shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Lock className="w-4 h-4" />
                  <span>对称加密核心引擎选单</span>
                </div>

                {/* 快捷示例芯片组 */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-gray-400 font-medium">快捷载入加密示例:</span>
                  {[
                    { id: 'AES-CBC', label: 'AES-CBC 示例' },
                    { id: 'AES-ECB', label: 'AES-ECB 示例' },
                    { id: 'DES-CBC', label: 'DES-CBC 示例' },
                    { id: '3DES-CBC', label: '3DES 示例' },
                    { id: 'RC4', label: 'RC4 示例' },
                    { id: 'Rabbit', label: 'Rabbit 示例' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => loadEncSample(s.id)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-200/50 dark:border-emerald-800/50 transition-all"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 算法模式 Pills 选择器 */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { id: 'AES-CBC', label: 'AES-CBC (Pkcs7)' },
                  { id: 'AES-ECB', label: 'AES-ECB (Pkcs7)' },
                  { id: 'DES-CBC', label: 'DES-CBC' },
                  { id: 'DES-ECB', label: 'DES-ECB' },
                  { id: '3DES-CBC', label: '3DES-CBC' },
                  { id: 'RC4', label: 'RC4 流加密' },
                  { id: 'Rabbit', label: 'Rabbit 流加密' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setEncAlgo(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                      encAlgo === item.id
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-emerald-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 核心双栏加密工作台架构 (像素级顶部/高度对齐) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[350px]">
              {/* 左栏：明文输入与 Key/IV 配置 */}
              <div className="p-4 bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800/80 shadow-sm flex flex-col space-y-3 h-full">
                <div className="h-7 flex items-center justify-between flex-shrink-0">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-emerald-500" />
                    加密 Key / IV 与原始明文
                  </span>

                  <button
                    onClick={() => {
                      setPlainInput('');
                      setEncResultB64('');
                      setEncResultHex('');
                      setEncStatus('idle');
                    }}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    清空输入
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-shrink-0">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                      加密 Key (密钥字符串)
                    </label>
                    <input
                      type="text"
                      value={encKey}
                      onChange={(e) => setEncKey(e.target.value)}
                      placeholder="加密 Key 字符串..."
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 font-mono text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                      加密 IV (偏移向量 / 可选)
                    </label>
                    <input
                      type="text"
                      value={encIv}
                      onChange={(e) => setEncIv(e.target.value)}
                      placeholder="IV 向量字符串..."
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 font-mono text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col space-y-1.5 min-h-[180px]">
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block flex-shrink-0">
                    原始待加密明文
                  </label>
                  <textarea
                    value={plainInput}
                    onChange={(e) => setPlainInput(e.target.value)}
                    placeholder="在此输入要进行对称加密的明文文本..."
                    className="w-full flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 font-mono text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 resize-none min-h-[150px]"
                  />
                </div>

                <button
                  onClick={handleEncrypt}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <Zap className="w-4 h-4" />
                  执行对称加密 ({encAlgo})
                </button>
              </div>

              {/* 右栏：多格式密文结果呈现面板 */}
              <div className="p-4 bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800/80 shadow-sm flex flex-col space-y-3 h-full">
                <div className="h-7 flex items-center justify-between flex-shrink-0">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    加密密文输出面板 (Base64 / Hex)
                  </span>

                  {encResultB64 && <CopyButton value={encResultB64} label="复制 Base64 密文" />}
                </div>

                {/* 加密状态 Indicator */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs font-mono flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">状态:</span>
                    {encStatus === 'success' ? (
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 加密成功
                      </span>
                    ) : encStatus === 'error' ? (
                      <span className="text-red-500 font-bold">加密失败</span>
                    ) : (
                      <span className="text-gray-400">等待输入明文与 Key</span>
                    )}
                  </div>

                  {encResultB64 && (
                    <span className="text-[11px] text-gray-400">
                      密文长度: {encResultB64.length} 字符
                    </span>
                  )}
                </div>

                {/* 密文多格式显示 */}
                <div className="flex-1 space-y-3 overflow-auto min-h-[220px]">
                  {/* Base64 格式 */}
                  <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-sans">
                      <span className="font-bold text-emerald-400">Base64 密文:</span>
                      {encResultB64 && <CopyButton value={encResultB64} label="复制 Base64" />}
                    </div>
                    <pre className="font-mono text-xs text-blue-400 break-all whitespace-pre-wrap">
                      {encResultB64 || '// 尚未加密...'}
                    </pre>
                  </div>

                  {/* Hex 16进制格式 */}
                  {encResultHex && (
                    <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-sans">
                        <span className="font-bold text-cyan-400">Hex (16进制) 密文:</span>
                        <CopyButton value={encResultHex} label="复制 Hex" />
                      </div>
                      <pre className="font-mono text-xs text-cyan-400 break-all whitespace-pre-wrap">
                        {encResultHex}
                      </pre>
                    </div>
                  )}

                  {!encResultB64 && (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-600 space-y-2">
                      <ArrowRight className="w-6 h-6 animate-pulse text-emerald-500" />
                      <span>在左侧配置参数并输入明文，点击「执行对称加密」生成密文</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 视角 3: 专业级对称解密工作台 */}
        {activeTab === 'decrypt' && (
          <div className="flex-1 flex flex-col space-y-4 min-h-0">
            {/* 顶部：快捷算法切换 Pills & 预设示例芯片 */}
            <div className="p-4 bg-gradient-to-r from-purple-900/10 via-purple-600/5 to-transparent rounded-xl border border-purple-200/80 dark:border-purple-900/50 shadow-sm space-y-3 flex-shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <Unlock className="w-4 h-4" />
                  <span>对称解密核心引擎选单</span>
                </div>

                {/* 快捷示例芯片组 */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-gray-400 font-medium">快捷载入解密示例:</span>
                  {[
                    { id: 'AES-CBC', label: 'AES-CBC 示例' },
                    { id: 'AES-ECB', label: 'AES-ECB 示例' },
                    { id: 'DES-CBC', label: 'DES-CBC 示例' },
                    { id: '3DES-CBC', label: '3DES 示例' },
                    { id: 'RC4', label: 'RC4 示例' },
                    { id: 'Rabbit', label: 'Rabbit 示例' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => loadDecSample(s.id)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-300 hover:bg-purple-500/20 border border-purple-200/50 dark:border-purple-800/50 transition-all"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 算法模式 Pills 选择器 */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { id: 'AES-CBC', label: 'AES-CBC (Pkcs7)' },
                  { id: 'AES-ECB', label: 'AES-ECB (Pkcs7)' },
                  { id: 'DES-CBC', label: 'DES-CBC' },
                  { id: 'DES-ECB', label: 'DES-ECB' },
                  { id: '3DES-CBC', label: '3DES-CBC' },
                  { id: 'RC4', label: 'RC4 流加密' },
                  { id: 'Rabbit', label: 'Rabbit 流加密' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDecryptAlgo(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                      decryptAlgo === item.id
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                        : 'bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-purple-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 核心双栏解密工作台架构 (像素级顶部/高度对齐) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[350px]">
              {/* 左栏：密文输入与参数配置 */}
              <div className="p-4 bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800/80 shadow-sm flex flex-col space-y-3 h-full">
                <div className="h-7 flex items-center justify-between flex-shrink-0">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-purple-500" />
                    解密 Key / IV 与待解密密文
                  </span>

                  <button
                    onClick={() => {
                      setCipherInput('');
                      setDecryptedResult('');
                      setDecryptStatus('idle');
                    }}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    清空输入
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-shrink-0">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                      解密 Key (密钥字符串)
                    </label>
                    <input
                      type="text"
                      value={decryptKey}
                      onChange={(e) => setDecryptKey(e.target.value)}
                      placeholder="解密 Key 字符串..."
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 font-mono text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                      解密 IV (偏移向量 / 可选)
                    </label>
                    <input
                      type="text"
                      value={decryptIv}
                      onChange={(e) => setDecryptIv(e.target.value)}
                      placeholder="IV 向量字符串..."
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 font-mono text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col space-y-1.5 min-h-[180px]">
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block flex-shrink-0">
                    待解密密文 (Base64 / Hex 编码格式)
                  </label>
                  <textarea
                    value={cipherInput}
                    onChange={(e) => setCipherInput(e.target.value)}
                    placeholder="在此粘贴需要解密的 Base64 密文..."
                    className="w-full flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 font-mono text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[150px]"
                  />
                </div>

                <button
                  onClick={handleDecrypt}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <Zap className="w-4 h-4" />
                  执行对称解密 ({decryptAlgo})
                </button>
              </div>

              {/* 右栏：实时解密状态与代码级高亮结果 */}
              <div className="p-4 bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800/80 shadow-sm flex flex-col space-y-3 h-full">
                <div className="h-7 flex items-center justify-between flex-shrink-0">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-emerald-500" />
                    解密原始明文结果面板
                  </span>

                  {decryptedResult && <CopyButton value={decryptedResult} label="复制明文" />}
                </div>

                {/* 解密状态 Indicator */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs font-mono flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">状态:</span>
                    {decryptStatus === 'success' ? (
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 解密成功
                      </span>
                    ) : decryptStatus === 'error' ? (
                      <span className="text-red-500 font-bold">解密失败</span>
                    ) : (
                      <span className="text-gray-400">等待输入密文与密钥</span>
                    )}
                  </div>

                  {decryptedResult && (
                    <span className="text-[11px] text-gray-400">
                      长度: {decryptedResult.length} 字符
                    </span>
                  )}
                </div>

                {/* 明文结果代码输出区 */}
                <div className="flex-1 p-4 rounded-lg bg-gray-950 border border-gray-800 font-mono text-xs text-emerald-400 leading-relaxed overflow-auto min-h-[220px]">
                  {decryptedResult ? (
                    <pre className="whitespace-pre-wrap break-all">{decryptedResult}</pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-2">
                      <ArrowRight className="w-6 h-6 animate-pulse text-purple-500" />
                      <span>在左侧配置密钥并输入密文，点击「执行解密」查看结果</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
