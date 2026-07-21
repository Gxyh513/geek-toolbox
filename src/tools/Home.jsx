import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../stores/searchStore';
import { CATEGORIES, getToolsByCategory, getRecentTools } from '../data/toolRegistry';

/**
 * 首页仪表盘
 * 显示：最近使用 + 全部分类工具网格
 */
export default function Home() {
  const navigate = useNavigate();
  const { open } = useSearchStore();
  const recentTools = getRecentTools(6);

  const goToTool = (toolId) => {
    navigate(`/tool/${toolId}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* 欢迎区域 */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/5 border border-gray-200 dark:border-gray-800 p-6">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            极客工具箱
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            纯前端 · 无广告 · 本地计算 · 20+ 专业工具
          </p>
          <button
            onClick={open}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 
                       text-white text-sm font-medium transition-colors"
          >
            搜索工具 (Ctrl+K)
          </button>
        </div>
      </div>

      {/* 最近使用 */}
      {recentTools.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-3">
            最近使用
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => goToTool(tool.id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-800
                             bg-white dark:bg-[#161b22] hover:border-blue-500 dark:hover:border-blue-400
                             hover:shadow-md transition-all duration-200"
                >
                  <Icon className="w-6 h-6 text-blue-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center leading-tight">
                    {tool.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 全部分类 */}
      {CATEGORIES.map((cat) => {
        const CatIcon = cat.icon;
        const tools = getToolsByCategory(cat.id);
        return (
          <section key={cat.id}>
            <div className="flex items-center gap-2 mb-3">
              <CatIcon className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                {cat.label}
              </h2>
              <span className="text-xs text-gray-400">({tools.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {tools.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => goToTool(tool.id)}
                    className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-200 dark:border-gray-800
                               bg-white dark:bg-[#161b22] hover:border-blue-500 dark:hover:border-blue-400
                               hover:shadow-md dark:hover:shadow-blue-500/5 transition-all duration-200"
                  >
                    <ToolIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{tool.name}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
