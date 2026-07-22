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
      <div className="w-full flex-1 flex flex-col space-y-4 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[350px]">
          {/* 左侧编辑 */}
          <div className="flex flex-col h-full space-y-1.5">
            <div className="flex items-center justify-between flex-shrink-0">
              <label className="text-xs text-gray-500 dark:text-gray-500">Markdown</label>
              <CopyButton value={input} label="已复制 Markdown" />
            </div>
            <textarea className="terminal-textarea flex-1 w-full min-h-[280px]"
              value={input} onChange={(e) => handleChange(e.target.value)}
              placeholder="输入 Markdown 内容..." spellCheck={false} />
          </div>

          {/* 右侧预览 */}
          <div className="flex flex-col h-full space-y-1.5">
            <label className="block text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">预览</label>
            <div className="output-card flex-1 overflow-y-auto prose prose-sm dark:prose-invert max-w-none min-h-[280px]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && (!className && !String(children).includes('\n'));
                    if (isInline) {
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
