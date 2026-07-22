import { useState, useMemo } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { showToast } from '../../components/ui/Toast';
import { ChevronRight, ChevronDown, Copy, FolderTree, Code, Sparkles, Trash2 } from 'lucide-react';

const TOOL_ID = 'json-tree';

const SAMPLE_JSON = {
  code: 200,
  msg: '操作成功',
  data: {
    userId: 10086,
    userName: '易语言开发者',
    isVip: true,
    balance: 998.5,
    lastLogin: null,
    tags: ['VIP', '开发者', '易语言'],
  },
};

function toEString(str) {
  if (str === null || str === undefined) return '""';
  let escaped = str.toString().replace(/"/g, '""');
  return `"${escaped}"`;
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

function generateZjsonGetterCode(obj, defineVars = true) {
  let varsDeclarations = [];
  let gettersCode = '';

  function walk(currentObj, pathPrefix = '', varPrefix = '局_') {
    const isArrayNode = Array.isArray(currentObj);

    for (let key in currentObj) {
      const val = currentObj[key];
      const jsonPath = isArrayNode ? (pathPrefix ? `${pathPrefix}[${key}]` : `[${key}]`) : pathPrefix ? `${pathPrefix}.${key}` : key;
      const cleanVarName = varPrefix + key.toString().replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '_');
      const pathArg = toEString(jsonPath);

      if (val === null || val === undefined) {
        varsDeclarations.push(`.局部变量 ${cleanVarName}, 文本型`);
        gettersCode += `${cleanVarName} ＝ JSON.取文本 (${pathArg})\n`;
      } else if (typeof val === 'string') {
        varsDeclarations.push(`.局部变量 ${cleanVarName}, 文本型`);
        gettersCode += `${cleanVarName} ＝ JSON.取文本 (${pathArg})\n`;
      } else if (typeof val === 'number') {
        if (Number.isInteger(val)) {
          varsDeclarations.push(`.局部变量 ${cleanVarName}, 整数型`);
          gettersCode += `${cleanVarName} ＝ JSON.取整数 (${pathArg})\n`;
        } else {
          varsDeclarations.push(`.局部变量 ${cleanVarName}, 双精度小数型`);
          gettersCode += `${cleanVarName} ＝ JSON.取小数 (${pathArg})\n`;
        }
      } else if (typeof val === 'boolean') {
        varsDeclarations.push(`.局部变量 ${cleanVarName}, 逻辑型`);
        gettersCode += `${cleanVarName} ＝ JSON.取逻辑 (${pathArg})\n`;
      } else if (typeof val === 'object') {
        walk(val, jsonPath, `${cleanVarName}_`);
      }
    }
  }

  walk(obj);

  let fullCode = '';
  if (defineVars) {
    fullCode += `.版本 2\n\n.局部变量 JSON, ZJSON\n.局部变量 局_JSON文本, 文本型\n`;
    varsDeclarations.forEach((v) => {
      fullCode += `${v}\n`;
    });
    fullCode += `\nJSON.解析 (局_JSON文本)\n\n`;
  }
  fullCode += gettersCode;
  return fullCode;
}

function TreeNode({ name, value, path, onSelect, selectedPath }) {
  const [collapsed, setCollapsed] = useState(false);

  const isObject = typeof value === 'object' && value !== null;
  const isArray = Array.isArray(value);

  const isSelected = selectedPath === path;

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(path, value);
  };

  if (isObject) {
    const keys = Object.keys(value);
    const badgeText = isArray ? `[Array(${keys.length})]` : `{Object(${keys.length})}`;

    return (
      <div className="pl-3 space-y-0.5">
        <div
          onClick={handleClick}
          className={`flex items-center gap-1.5 py-0.5 px-1.5 rounded text-xs font-mono cursor-pointer transition-colors ${
            isSelected
              ? 'bg-blue-500 text-white font-medium'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(!collapsed);
            }}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {name !== undefined && <span className="text-purple-600 dark:text-purple-400 font-semibold">{name}:</span>}
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'}`}>
            {badgeText}
          </span>
        </div>

        {!collapsed && (
          <div className="border-l border-gray-200 dark:border-gray-800 ml-2 space-y-0.5">
            {keys.map((k) => {
              const childPath = isArray ? (path ? `${path}[${k}]` : `[${k}]`) : path ? `${path}.${k}` : k;
              return (
                <TreeNode
                  key={k}
                  name={isArray ? `[${k}]` : k}
                  value={value[k]}
                  path={childPath}
                  onSelect={onSelect}
                  selectedPath={selectedPath}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Primitive node
  let valueColor = 'text-green-600 dark:text-green-400';
  if (typeof value === 'number') valueColor = 'text-yellow-600 dark:text-yellow-400';
  if (typeof value === 'boolean') valueColor = 'text-pink-600 dark:text-pink-400';
  if (value === null) valueColor = 'text-gray-400';

  return (
    <div className="pl-3">
      <div
        onClick={handleClick}
        className={`flex items-center gap-1.5 py-0.5 px-1.5 rounded text-xs font-mono cursor-pointer transition-colors ${
          isSelected
            ? 'bg-blue-500 text-white font-medium'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
        }`}
      >
        <span className="w-3.5" />
        {name !== undefined && <span className="text-purple-600 dark:text-purple-400 font-semibold">{name}:</span>}
        <span className={isSelected ? 'text-white' : valueColor}>{JSON.stringify(value)}</span>
      </div>
    </div>
  );
}

export default function JsonTreeTool() {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(SAMPLE_JSON, null, 2));
  const [selectedNode, setSelectedNode] = useState({ path: '', value: SAMPLE_JSON });
  const [defineVars, setDefineVars] = useState(false);

  const parsedJson = useMemo(() => {
    try {
      return JSON.parse(jsonText);
    } catch (e) {
      return null;
    }
  }, [jsonText]);

  const pathInspector = useMemo(() => {
    const { path, value } = selectedNode;
    const displayPath = path === '' ? '"" (根节点)' : path;
    const displayVal = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);

    const pathArg = toEString(path);
    let getCode = '';
    let setCode = '';

    if (typeof value === 'object' && value !== null) {
      if (path === '') {
        getCode = `JSON.取JSON文本 ()`;
        setCode = `JSON.解析 (${toEString(displayVal)})`;
      } else {
        getCode = `JSON.取对象 (${pathArg}, 子JSON)`;
        setCode = Array.isArray(value) ? `JSON.置空数组 (${pathArg})` : `JSON.置空对象 (${pathArg})`;
      }
    } else {
      if (value === null) {
        getCode = `JSON.取文本 (${pathArg})`;
        setCode = `JSON.置空值 (${pathArg})`;
      } else if (typeof value === 'string') {
        getCode = `JSON.取文本 (${pathArg})`;
        setCode = `JSON.置文本 (${pathArg}, ${toEString(value)})`;
      } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          getCode = `JSON.取整数 (${pathArg})`;
          setCode = `JSON.置整数 (${pathArg}, ${value})`;
        } else {
          getCode = `JSON.取小数 (${pathArg})`;
          setCode = `JSON.置小数 (${pathArg}, ${value})`;
        }
      } else if (typeof value === 'boolean') {
        getCode = `JSON.取逻辑 (${pathArg})`;
        setCode = `JSON.置逻辑 (${pathArg}, ${value ? '真' : '假'})`;
      } else {
        getCode = `JSON.取文本 (${pathArg})`;
        setCode = `JSON.置文本 (${pathArg}, ${toEString(value)})`;
      }
    }

    return { displayPath, displayVal, getCode, setCode };
  }, [selectedNode]);

  const handleSelectNode = (path, value) => {
    setSelectedNode({ path, value });
  };

  const handleGenerateFullZjson = () => {
    if (!parsedJson) {
      showToast('请先输入正确的 JSON');
      return;
    }
    let code = '';
    if (defineVars) {
      code += `.版本 2\n\n.局部变量 JSON, ZJSON\n.局部变量 局_提交数据, 文本型\n\n`;
    }
    code += generateZjsonBuilderCode(parsedJson);
    code += `局_提交数据 ＝ JSON.取JSON文本 ()\n调试输出 (局_提交数据)\n`;
    navigator.clipboard.writeText(code).then(() => showToast('已生成并复制完整 ZJSON 赋值源码！'));
  };

  const handleGenerateZjsonGetter = () => {
    if (!parsedJson) {
      showToast('请先输入正确的 JSON');
      return;
    }
    const code = generateZjsonGetterCode(parsedJson, defineVars);
    navigator.clipboard.writeText(code).then(() => showToast('已生成并复制完整 ZJSON 取值源码！'));
  };

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="w-full flex-1 flex flex-col space-y-4 min-h-0">
        {/* Path Inspector (JSON Path & ZJSON 取值/置值代码) */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 space-y-2 text-xs font-mono flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center justify-between bg-white dark:bg-[#161b22] p-2 rounded border border-gray-200 dark:border-gray-800">
              <span className="text-gray-500 truncate">JSON Path: <strong className="text-blue-500">{pathInspector.displayPath}</strong></span>
              <CopyButton value={pathInspector.displayPath} label="复制" />
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-[#161b22] p-2 rounded border border-gray-200 dark:border-gray-800">
              <span className="text-gray-500 truncate">节点数值: <strong className="text-green-500">{pathInspector.displayVal}</strong></span>
              <CopyButton value={pathInspector.displayVal} label="复制" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center justify-between bg-white dark:bg-[#161b22] p-2 rounded border border-gray-200 dark:border-gray-800">
              <span className="text-gray-500 truncate">ZJSON 取值: <strong className="text-purple-500">{pathInspector.getCode}</strong></span>
              <CopyButton value={pathInspector.getCode} label="复制代码" />
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-[#161b22] p-2 rounded border border-gray-200 dark:border-gray-800">
              <span className="text-gray-500 truncate">ZJSON 置值: <strong className="text-pink-500">{pathInspector.setCode}</strong></span>
              <CopyButton value={pathInspector.setCode} label="复制代码" />
            </div>
          </div>
        </div>

        {/* 顶部按钮快捷工具栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => {
                if (parsedJson) setJsonText(JSON.stringify(parsedJson, null, 2));
              }}
              className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              格式化 (美化)
            </button>

            <button
              onClick={() => {
                if (parsedJson) setJsonText(JSON.stringify(parsedJson));
              }}
              className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              压缩 (紧缩)
            </button>

            <button
              onClick={() => {
                if (!jsonText) return;
                setJsonText(JSON.stringify(jsonText));
                showToast('转义成功');
              }}
              className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              转义引号
            </button>

            <button
              onClick={() => {
                if (!jsonText) return;
                try {
                  const parsed = JSON.parse(jsonText);
                  if (typeof parsed === 'string') {
                    setJsonText(parsed);
                  } else if (typeof parsed === 'object' && parsed !== null) {
                    setJsonText(JSON.stringify(parsed, null, 2));
                  } else {
                    setJsonText(String(parsed));
                  }
                  showToast('反转义成功');
                } catch (e) {
                  showToast('反转义失败：文本非有效转义格式', 'error');
                }
              }}
              className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              反转义
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={defineVars}
                onChange={(e) => setDefineVars(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-700 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-gray-700 dark:text-gray-300 font-medium">生成变量声明</span>
            </label>

            <button
              onClick={handleGenerateZjsonGetter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Code className="w-3.5 h-3.5" />
              生成 ZJSON 取值源码
            </button>

            <button
              onClick={handleGenerateFullZjson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              生成 ZJSON 赋值源码
            </button>
          </div>
        </div>

        {/* 双栏区域：原始 JSON 输入 vs 树形层级解析视图 (自适应窗口) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[350px]">
          <div className="flex flex-col space-y-2 h-full">
            <div className="flex items-center justify-between flex-shrink-0">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">原始 JSON 输入</label>
              <button
                onClick={() => setJsonText('')}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                清空
              </button>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="在此粘贴 JSON 文本..."
              className="w-full flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] font-mono text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[250px]"
            />
          </div>

          <div className="flex flex-col space-y-2 h-full">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">树形节点解析视图 (点击节点计算路径)</label>
            <div className="w-full flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] overflow-auto min-h-[250px]">
              {parsedJson ? (
                <TreeNode
                  name="root"
                  value={parsedJson}
                  path=""
                  onSelect={handleSelectNode}
                  selectedPath={selectedNode.path}
                />
              ) : (
                <div className="text-red-500 text-xs font-mono p-4">JSON 语法错误或文本为空，请输入有效的 JSON 文本</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
