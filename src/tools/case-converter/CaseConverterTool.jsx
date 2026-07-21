import ToolPageLayout from '../../components/layout/ToolPageLayout';
import CopyButton from '../../components/ui/CopyButton';
import { useDebounce } from '../../hooks/useDebounce';
import { useToolStore } from '../../stores/toolStore';

const TOOL_ID = 'case-converter';

const CONVERTERS = [
  {
    id: 'lowercase',
    label: '全部小写',
    example: 'hello world',
    fn: (s) => s.toLowerCase(),
  },
  {
    id: 'uppercase',
    label: '全部大写',
    example: 'HELLO WORLD',
    fn: (s) => s.toUpperCase(),
  },
  {
    id: 'capitalize',
    label: '首字母大写',
    example: 'Hello World',
    fn: (s) => s.replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    id: 'camelCase',
    label: 'camelCase',
    example: 'helloWorld',
    fn: (s) => s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
  },
  {
    id: 'PascalCase',
    label: 'PascalCase',
    example: 'HelloWorld',
    fn: (s) => {
      const cleaned = s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    },
  },
  {
    id: 'snake_case',
    label: 'snake_case',
    example: 'hello_world',
    fn: (s) => s.replace(/([A-Z])/g, '_$1').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '').toLowerCase(),
  },
  {
    id: 'kebab-case',
    label: 'kebab-case',
    example: 'hello-world',
    fn: (s) => s.replace(/([A-Z])/g, '-$1').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase(),
  },
  {
    id: 'UPPER_SNAKE',
    label: 'UPPER_SNAKE',
    example: 'HELLO_WORLD',
    fn: (s) => s.replace(/([A-Z])/g, '_$1').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '').toUpperCase(),
  },
];

export default function CaseConverterTool() {
  const { inputs, setInput } = useToolStore();
  const input = inputs[TOOL_ID] || '';
  const debouncedInput = useDebounce(input, 300);

  return (
    <ToolPageLayout toolId={TOOL_ID}>
      <div className="space-y-4 max-w-4xl">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5">输入文本</label>
          <textarea className="terminal-textarea" rows={4}
            value={input} onChange={(e) => setInput(TOOL_ID, e.target.value)}
            placeholder="输入要转换的文本..." spellCheck={false} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CONVERTERS.map((conv) => {
            let result = '';
            let error = false;
            if (debouncedInput) {
              try {
                result = conv.fn(debouncedInput);
              } catch {
                result = '转换失败';
                error = true;
              }
            }

            return (
              <div key={conv.id} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-blue-500">{conv.label}</code>
                  </div>
                  {result && <CopyButton value={result} label={`已复制 ${conv.label}`} />}
                </div>
                <div className={`output-card min-h-[32px] text-xs ${error ? 'border-red-300' : ''}`}>
                  {result ? (
                    <pre className="whitespace-pre-wrap break-all font-mono">{result}</pre>
                  ) : (
                    <span className="text-gray-400">{conv.example}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToolPageLayout>
  );
}
