import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { CATEGORIES, getToolsByCategory } from '../../data/toolRegistry';

/**
 * 左侧可折叠分类导航栏
 */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedCats, setExpandedCats] = useState(() =>
    CATEGORIES.map((c) => c.id)
  );
  const navigate = useNavigate();
  const location = useLocation();
  const currentToolId = location.pathname.split('/tool/')[1];

  const toggleCat = (catId) => {
    setExpandedCats((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId]
    );
  };

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
                   hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        title={collapsed ? '展开导航' : '折叠导航'}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* 分类列表 */}
      <div className="flex-1 overflow-y-auto py-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const tools = getToolsByCategory(cat.id);
          const isExpanded = expandedCats.includes(cat.id);

          return (
            <div key={cat.id}>
              {/* 分类标题 */}
              <button
                onClick={() => (collapsed ? null : toggleCat(cat.id))}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider
                           text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
                           transition-colors ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? cat.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{cat.label}</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                    />
                  </>
                )}
              </button>

              {/* 工具列表 */}
              {!collapsed && isExpanded && (
                <div className="mb-1">
                  {tools.map((tool) => {
                    const ToolIcon = tool.icon;
                    const isActive = currentToolId === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => {
                          navigate(`/tool/${tool.id}`);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors
                          ${
                            isActive
                              ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900'
                          }`}
                      >
                        <ToolIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{tool.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
