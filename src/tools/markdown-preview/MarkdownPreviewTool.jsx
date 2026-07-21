import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { useDebounce } from '../../hooks/useDebounce';
import { useToolStore } from '../../stores/toolStore';

const TOOL_ID = 'markdown-preview';

const DEFAULT_MD = `# Markdown 实时预览

## 支持语法

- **粗体** / *斜体* / ~~删除线~~
- \`行内代码\`
- 列表和任务列表
  - [x] 已完成
  - [ ] 待办

\`\`\`javascript
// 代码块
console.log('Hello World');
\`\`\`

| 表头1 | 表头2 |
|-------|-------|
| 单元格 | 单元格 |

> 引用段落
`;

export default function MarkdownPreviewTool() {
  const { inputs, setInput } = useToolStore();
  const stored = inputs[TOOL_ID];
  const [input, setLocalInput] = useState(stored !== undefined ? stored : DEFAULT_MD);
  const debouncedInput = useDebounce(input, 300);

  // Sync both local state and zustand store
  const handleChange = (val) => {
    setLocalInput(val);
    setInput(TOOL_ID, val);
  };

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左侧编辑 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-500">Markdown</label>
              <CopyButton value={input} label="已复制 Markdown" />
            </div>
            <textarea className="terminal-textarea" rows={20}
              value={input} onChange={(e) => handleChange(e.target.value)}
              placeholder="输入 Markdown 内容..." spellCheck={false} />
          </div>

          {/* 右侧预览 */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">预览</label>
            <div className="output-card min-h-[520px] max-h-[624px] overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    if (inline) {
                      return <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono text-pink-500" {...props}>{children}</code>;
                    }
                    return (
                      <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                        <code className={`text-xs font-mono ${className || ''}`} {...props}>{children}</code>
                      </pre>
                    );
                  },
                }}
              >
                {debouncedInput}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
