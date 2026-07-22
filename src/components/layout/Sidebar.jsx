import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES, getToolsByCategory } from '../../data/toolRegistry';

/**
 * 左侧导航栏 - 直接列出工具标签（非下拉菜单）
 */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentToolId = location.pathname.split('/tool/')[1];

  return (
    <nav
      className={`relative border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d1117] 
                  transition-all duration-200 flex flex-col overflow-hidden
                  ${collapsed ? 'w-14' : 'w-56'}`}
    >
      {/* 折叠切换按钮 */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-b border-gray-200 dark:border-gray-800 
                   hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        title={collapsed ? '展开导航' : '折叠导航'}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* 分类及工具列表（直接展示，无需下拉） */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4">
        {CATEGORIES.map((cat) => {
          const CatIcon = cat.icon;
          const tools = getToolsByCategory(cat.id);

          return (
            <div key={cat.id} className="px-2">
              {/* 分类标题 */}
              {!collapsed ? (
                <div className="px-2 py-1 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CatIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span>{cat.label}</span>
                </div>
              ) : (
                <div
                  className="flex justify-center py-1 text-gray-400 dark:text-gray-500"
                  title={cat.label}
                >
                  <CatIcon className="w-4 h-4 text-blue-500" />
                </div>
              )}

              {/* 工具列表直接平铺列出 */}
              <div className="mt-1 space-y-0.5">
                {tools.map((tool) => {
                  const ToolIcon = tool.icon;
                  const isActive = currentToolId === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => navigate(`/tool/${tool.id}`)}
                      title={collapsed ? tool.name : undefined}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all duration-150
                        ${collapsed ? 'justify-center' : ''}
                        ${
                          isActive
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                        }`}
                    >
                      <ToolIcon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                      {!collapsed && <span className="truncate">{tool.name}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
