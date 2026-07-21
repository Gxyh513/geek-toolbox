import ToolPageLayout from '../components/layout/ToolPageLayout';

/**
 * 未实现工具的占位页面
 * 后续每个工具实现后，将替换此占位组件
 */
export default function PlaceholderTool({ toolId }) {
  if (!toolId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p className="text-sm">请从左侧导航选择一个工具</p>
      </div>
    );
  }

  return (
    <ToolPageLayout toolId={toolId}>
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4">
        <div className="w-12 h-12 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
        <p className="text-sm">工具加载中...</p>
        <p className="text-xs text-gray-500">此工具将在后续批次中实现</p>
      </div>
    </ToolPageLayout>
  );
}
