import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getToolById, recordToolUsage } from '../../data/toolRegistry';

/**
 * 工具页面的通用布局容器
 * 自动读取工具注册表元数据（标题、图标、描述）
 * 所有工具页面只需在 children 中渲染输入/输出区
 */
export default function ToolPageLayout({ children, toolId: forceToolId }) {
  const params = useParams();
  const navigate = useNavigate();
  const toolId = forceToolId || params.toolId;
  const tool = getToolById(toolId);

  // 记录工具使用
  useEffect(() => {
    if (tool) {
      recordToolUsage(tool.id);
    }
  }, [tool?.id]);

  if (!tool) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p className="text-lg">工具未找到</p>
        <p className="text-sm mt-2">请从左侧导航选择一个工具</p>
      </div>
    );
  }

  const Icon = tool.icon;

  return (
    <div className="h-full flex flex-col">
      {/* 工具头部 */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="返回首页"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </button>
        <Icon className="w-5 h-5 text-blue-500" />
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{tool.name}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{tool.desc}</p>
        </div>
      </div>

      {/* 工具内容区域 (自适应窗口宽高) */}
      <div className="flex-1 overflow-auto p-4 md:p-6 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
}
