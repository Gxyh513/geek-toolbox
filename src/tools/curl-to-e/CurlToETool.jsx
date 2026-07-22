import { useState, useMemo } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { showToast } from '../../components/ui/Toast';
import { Code, ListCheck, Trash2, FlaskConical, Copy } from 'lucide-react';

const TOOL_ID = 'curl-to-e';

const SAMPLES = {
  'get': `curl 'https://api.github.com/users/octocat/repos?sort=updated' \\
  -H 'accept: application/vnd.github.v3+json' \\
  -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' \\
  -H 'cookie: _gh_sess=xyz123; logged_in=yes'`,

  'post-json': `curl 'https://api.example.com/v1/auth/login' \\
  -X POST \\
  -H 'Content-Type: application/json' \\
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)' \\
  -H 'Origin: https://example.com' \\
  -H 'Cookie: session_id=abc123xyz; token=eyJhbGciOiJIUzI1NiIn' \\
  --data-raw '{"username":"admin","password":"secretPassword123","remember":true,"score":98.5,"lastLogin":null}'`,

  'fd-post': `POST /v1/auth/login HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Content-Type: application/json
Cookie: session_id=fd_abc123; token=eyJhbGciOiJIUzI1NiIn

{"username":"admin","password":"secretPassword123","remember":true,"score":98.5,"lastLogin":null}`,

  'fd-get': `GET /users/octocat/repos?sort=updated HTTP/1.1
Host: api.github.com
Accept: application/vnd.github.v3+json
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Cookie: _gh_sess=fd_xyz123`,

  'post-form': `curl 'https://httpbin.org/post' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  --data-urlencode 'grant_type=client_credentials' \\
  --data-urlencode 'client_id=myAppId' \\
  --data-urlencode 'scope=read write'`,
};

function tokenize(cmd) {
  const result = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < cmd.length; i++) {
    const char = cmd[i];
    if (char === "'" && !inDouble) inSingle = !inSingle;
    else if (char === '"' && !inSingle) inDouble = !inDouble;
    else if (char === ' ' && !inSingle && !inDouble) {
      if (current.length > 0) {
        result.push(stripQuotes(current));
        current = '';
      }
    } else {
      current += char;
    }
  }
  if (current.length > 0) result.push(stripQuotes(current));
  return result;
}

function stripQuotes(str) {
  if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
    return str.slice(1, -1);
  }
  return str;
}

function toEString(str) {
  if (str === null || str === undefined) return '""';
  let escaped = str.toString().replace(/"/g, '""');
  if (escaped.includes('\n')) {
    let lines = escaped.split(/\r?\n/);
    return lines.map((line) => `"${line}"`).join(' ＋ #换行符 ＋ ');
  }
  return `"${escaped}"`;
}

function tryParseJson(str) {
  if (!str) return null;
  let s = str.trim();
  if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
    s = s.slice(1, -1).trim();
  }
  try {
    const obj = JSON.parse(s);
    if (typeof obj === 'object' && obj !== null) return obj;
  } catch (e) {}

  try {
    let relaxed = s.replace(/'/g, '"');
    const obj = JSON.parse(relaxed);
    if (typeof obj === 'object' && obj !== null) return obj;
  } catch (e) {}

  return null;
}

function parseRawHttp(rawText, separateCookie) {
  if (!rawText) return null;
  const lines = rawText.split(/\r?\n/);
  if (lines.length === 0) return null;

  const firstLine = lines[0].trim();
  const match = firstLine.match(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+([^\s]+)(?:\s+HTTP\/[0-9\.]+)?$/i);
  if (!match) return null;

  const method = match[1].toUpperCase();
  let rawPath = match[2];

  let headers = [];
  let cookie = '';
  let host = '';
  let bodyLines = [];
  let inBody = false;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!inBody) {
      if (line.trim() === '') {
        inBody = true;
        continue;
      }
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const name = line.substring(0, colonIdx).trim();
        const value = line.substring(colonIdx + 1).trim();
        const lowerName = name.toLowerCase();

        if (lowerName === 'host') {
          host = value;
        } else if (lowerName === 'cookie' && separateCookie) {
          cookie = value;
        } else {
          headers.push({ name, value });
        }
      }
    } else {
      bodyLines.push(line);
    }
  }

  let url = rawPath;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (host) {
      url = 'https://' + host + (rawPath.startsWith('/') ? rawPath : '/' + rawPath);
    } else {
      url = 'https://' + rawPath;
    }
  }

  const body = bodyLines.join('\n').trim();
  return { method, url, headers, cookie, body };
}

function parseCurl(raw, separateCookie) {
  let cleaned = raw.replace(/\\\r?\n/g, ' ').replace(/\^\r?\n/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  let method = 'GET';
  let url = '';
  let headers = [];
  let cookie = '';
  let body = '';

  const tokens = tokenize(cleaned);

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    if (token === 'curl') continue;

    if (token === '-X' || token === '--request') {
      if (i + 1 < tokens.length) method = tokens[++i].toUpperCase();
      continue;
    }

    if (token === '-H' || token === '--header') {
      if (i + 1 < tokens.length) {
        const headerStr = tokens[++i];
        const colonIdx = headerStr.indexOf(':');
        if (colonIdx > 0) {
          const hName = headerStr.substring(0, colonIdx).trim();
          const hVal = headerStr.substring(colonIdx + 1).trim();

          if (hName.toLowerCase() === 'cookie' && separateCookie) {
            cookie = hVal;
          } else {
            headers.push({ name: hName, value: hVal });
          }
        }
      }
      continue;
    }

    if (token === '-b' || token === '--cookie') {
      if (i + 1 < tokens.length) {
        const cVal = tokens[++i];
        if (separateCookie) cookie = cVal;
        else headers.push({ name: 'Cookie', value: cVal });
      }
      continue;
    }

    if (token === '-A' || token === '--user-agent') {
      if (i + 1 < tokens.length) headers.push({ name: 'User-Agent', value: tokens[++i] });
      continue;
    }

    if (token === '-e' || token === '--referer') {
      if (i + 1 < tokens.length) headers.push({ name: 'Referer', value: tokens[++i] });
      continue;
    }

    if (['-d', '--data', '--data-raw', '--data-binary', '--data-urlencode', '--data-ascii', '-F', '--form'].includes(token)) {
      if (i + 1 < tokens.length) {
        const payload = tokens[++i];
        body = body ? body + '&' + payload : payload;
        if (method === 'GET') method = 'POST';
      }
      continue;
    }

    if (!url && !token.startsWith('-')) {
      let candidate = token.replace(/^['"]|['"]$/g, '');
      if (candidate.startsWith('http://') || candidate.startsWith('https://') || candidate.includes('.')) {
        url = candidate;
      }
    }
  }

  return { method, url, headers, cookie, body };
}

function parseInputData(raw, options) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const firstLine = trimmed.split(/\r?\n/)[0].trim();
  if (/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+/i.test(firstLine)) {
    const rawParsed = parseRawHttp(trimmed, options.separateCookie);
    if (rawParsed && rawParsed.url) return rawParsed;
  }

  return parseCurl(trimmed, options.separateCookie);
}

function generateZjsonBuilderCode(obj, prefix = '') {
  let code = '';
  const isArr = Array.isArray(obj);

  for (let key in obj) {
    const val = obj[key];
    let jsonPath = isArr ? (prefix ? `${prefix}[${key}]` : `[${key}]`) : prefix ? `${prefix}.${key}` : key;

    if (val === null) {
      code += `JSON.置空值 (${toEString(jsonPath)})\n`;
    } else if (typeof val === 'string') {
      code += `JSON.置文本 (${toEString(jsonPath)}, ${toEString(val)})\n`;
    } else if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        code += `JSON.置整数 (${toEString(jsonPath)}, ${val})\n`;
      } else {
        code += `JSON.置小数 (${toEString(jsonPath)}, ${val})\n`;
      }
    } else if (typeof val === 'boolean') {
      code += `JSON.置逻辑 (${toEString(jsonPath)}, ${val ? '真' : '假'})\n`;
    } else if (typeof val === 'object') {
      code += generateZjsonBuilderCode(val, jsonPath);
    }
  }
  return code;
}

function generateWinHttpRZjsonCode(data, options) {
  const jsonObj = options.jsonBuilder ? tryParseJson(data.body) : null;
  const isJson = jsonObj !== null;

  let code = `.版本 2\n\n`;

  if (options.defineVars) {
    code += `.局部变量 HTTP, WinHttpR\n`;
    code += `.局部变量 局_网址, 文本型\n`;
    if (data.body) code += `.局部变量 局_提交数据, 文本型\n`;
    if (data.cookie) code += `.局部变量 局_Cookie, 文本型\n`;
    code += `.局部变量 局_返回文本, 文本型\n`;

    if (isJson) {
      code += `.局部变量 JSON, ZJSON\n`;
    }
    code += `\n`;
  }

  code += `局_网址 ＝ ${toEString(data.url)}\n`;

  if (data.cookie) {
    code += `局_Cookie ＝ ${toEString(data.cookie)}\n`;
  }

  if (data.body) {
    if (isJson) {
      code += generateZjsonBuilderCode(jsonObj);
      code += `局_提交数据 ＝ JSON.取JSON文本 ()\n`;
    } else {
      if (data.body.includes('"')) {
        const singleQuotedBody = data.body.replace(/"/g, "'");
        code += `局_提交数据 ＝ 子文本替换 (${toEString(singleQuotedBody)}, "'", #引号, , , 真)\n`;
      } else {
        code += `局_提交数据 ＝ ${toEString(data.body)}\n`;
      }
    }
  }

  code += `\n`;
  code += `HTTP.Open (${toEString(data.method)}, 局_网址)\n`;

  if (data.cookie) {
    code += `HTTP.Cookies (局_Cookie)\n`;
    code += `HTTP.SetRequestHeader ("Cookie", 局_Cookie)\n`;
  }

  data.headers.forEach((h) => {
    code += `HTTP.SetRequestHeader (${toEString(h.name)}, ${toEString(h.value)})\n`;
  });

  if (data.body) {
    code += `HTTP.Send (局_提交数据)\n`;
  } else {
    code += `HTTP.Send ()\n`;
  }

  if (options.utf8Convert) {
    code += `局_返回文本 ＝ HTTP.GetResponseTextU2A ()\n`;
  } else {
    code += `局_返回文本 ＝ HTTP.GetResponseText ()\n`;
  }

  code += `调试输出 (局_返回文本)\n`;
  return code;
}

export default function CurlToETool() {
  const [input, setInput] = useState(SAMPLES['post-json']);
  const [options, setOptions] = useState({
    defineVars: true,
    separateCookie: true,
    utf8Convert: true,
    jsonBuilder: true,
  });
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'details'

  const parsedData = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return parseInputData(input, options);
    } catch (e) {
      return null;
    }
  }, [input, options]);

  const generatedCode = useMemo(() => {
    if (!parsedData || !parsedData.url) return '// 请在左侧输入有效的数据包或 cURL 文本...';
    try {
      return generateWinHttpRZjsonCode(parsedData, options);
    } catch (e) {
      return `// 转换出错: ${e.message}`;
    }
  }, [parsedData, options]);

  const toggleOption = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="w-full flex-1 flex flex-col space-y-4 min-h-0">
        {/* 配置参数与示例选择 */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            {[
              { key: 'defineVars', label: '生成变量声明' },
              { key: 'separateCookie', label: '分离 Cookie 变量' },
              { key: 'utf8Convert', label: '自动 Utf8转Ansi' },
              { key: 'jsonBuilder', label: '使用 ZJSON 引擎' },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={options[opt.key]}
                  onChange={() => toggleOption(opt.key)}
                  className="rounded border-gray-300 dark:border-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FlaskConical className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500 font-medium">示例测试包:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'post-json', label: 'cURL POST JSON' },
                { id: 'get', label: 'cURL GET' },
                { id: 'fd-post', label: 'Fiddler 抓包' },
                { id: 'post-form', label: 'Form 表单' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    if (SAMPLES[s.id]) {
                      setInput(SAMPLES[s.id]);
                      showToast(`已载入 ${s.label} 示例数据包`);
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 text-[11px] font-medium transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>

            <select
              onChange={(e) => {
                if (SAMPLES[e.target.value]) {
                  setInput(SAMPLES[e.target.value]);
                  showToast('已加载示例数据包');
                }
              }}
              className="terminal-input text-xs py-1 px-2 cursor-pointer ml-1"
              defaultValue="post-json"
            >
              <option value="get">cURL GET 请求 (带 Cookie)</option>
              <option value="post-json">cURL POST JSON (ZJSON)</option>
              <option value="fd-post">Fiddler (FD) POST 抓包</option>
              <option value="fd-get">Fiddler (FD) GET 抓包</option>
              <option value="post-form">POST Form 表单包</option>
            </select>
          </div>
        </div>

        {/* 核心双栏架构 (随窗口自适应缩放) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[350px]">
          {/* 左栏：数据包文本输入 */}
          <div className="flex flex-col space-y-2 h-full">
            <div className="flex items-center justify-between flex-shrink-0">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                粘贴 cURL / Fiddler / Reqable 请求文本
              </label>
              <button
                onClick={() => setInput('')}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                清空
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在此粘贴 cURL 数据包、Fiddler (FD) 或 Reqable 原始抓包请求..."
              className="w-full flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] font-mono text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[250px]"
            />
          </div>

          {/* 右栏：易语言代码与拆解明细 */}
          <div className="flex flex-col space-y-2 h-full">
            <div className="flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-md">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all ${
                    activeTab === 'code'
                      ? 'bg-white dark:bg-[#161b22] text-blue-500 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  易语言代码
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all ${
                    activeTab === 'details'
                      ? 'bg-white dark:bg-[#161b22] text-blue-500 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <ListCheck className="w-3.5 h-3.5" />
                  参数拆解明细
                </button>
              </div>

              {activeTab === 'code' && <CopyButton value={generatedCode} label="复制代码" />}
            </div>

            {/* 视角 1：易语言代码 */}
            {activeTab === 'code' && (
              <div className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-900 overflow-auto font-mono text-sm text-green-400 whitespace-pre-wrap break-all leading-relaxed min-h-[250px]">
                <pre className="whitespace-pre-wrap break-all font-mono">{generatedCode}</pre>
              </div>
            )}

            {/* 视角 2：参数拆解明细表 */}
            {activeTab === 'details' && (
              <div className="flex-1 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] overflow-y-auto space-y-4 text-xs min-h-[250px]">
                {parsedData ? (
                  <>
                    {/* URL & Method */}
                    <div className="space-y-1.5 pb-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="font-semibold text-gray-500">请求目标</div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-bold text-[10px]">
                          {parsedData.method}
                        </span>
                        <code className="font-mono text-gray-800 dark:text-gray-200 break-all">{parsedData.url}</code>
                      </div>
                    </div>

                    {/* Cookie 明细 */}
                    {parsedData.cookie && (() => {
                      const cookieList = parsedData.cookie
                        .split(';')
                        .map((s) => s.trim())
                        .filter(Boolean);
                      return (
                        <div className="space-y-1.5 pb-3 border-b border-gray-100 dark:border-gray-800">
                          <div className="font-semibold text-gray-500">
                            Cookie 键值对拆解 ({cookieList.length})
                          </div>
                          <div className="space-y-1 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            {cookieList.map((pair, idx) => {
                              const eq = pair.indexOf('=');
                              const k = eq > 0 ? pair.slice(0, eq) : pair;
                              const v = eq > 0 ? pair.slice(eq + 1) : '';
                              return (
                                <div key={idx} className="flex items-start justify-between font-mono gap-2">
                                  <span className="text-pink-500 font-medium">{k}</span>
                                  <span className="text-gray-600 dark:text-gray-400 break-all text-right">{v}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Headers 明细 */}
                    {parsedData.headers.length > 0 && (
                      <div className="space-y-1.5 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="font-semibold text-gray-500">Headers 请求头 ({parsedData.headers.length})</div>
                        <div className="space-y-1 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                          {parsedData.headers.map((h, idx) => (
                            <div key={idx} className="flex items-start justify-between font-mono gap-2">
                              <span className="text-cyan-500 font-medium">{h.name}</span>
                              <span className="text-gray-600 dark:text-gray-400 break-all text-right">{h.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Body */}
                    {parsedData.body && (
                      <div className="space-y-1.5">
                        <div className="font-semibold text-gray-500">Body 提交载荷</div>
                        <pre className="p-2 rounded bg-gray-50 dark:bg-gray-900 font-mono text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
                          {parsedData.body}
                        </pre>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400 text-center py-10">请输入或粘贴有效的数据包文本以查看拆解明细</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
