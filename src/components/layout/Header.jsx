import { Link } from 'react-router-dom';
import { Search, Palette } from 'lucide-react';
import { useThemeStore, THEME_OPTIONS } from '../../stores/themeStore';
import { useSearchStore } from '../../stores/searchStore';

/**
 * 顶部导航栏
 * 包含：Logo、全局搜索入口、界面主题风格下拉框 (与 D:\Antigravity项目\E 完全对齐)
 */
export default function Header() {
  const { theme, setTheme } = useThemeStore();
  const { open } = useSearchStore();

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4">
        {/* 左侧 Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" title="返回首页">
          <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
            <span className="text-blue-500">G</span>eek
            <span className="text-blue-500">T</span>oolbox
          </span>
        </Link>

        {/* 中部搜索 */}
        <button
          onClick={open}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 
                     bg-gray-50 dark:bg-[#161b22] text-gray-400 dark:text-gray-500 text-sm
                     hover:border-gray-300 dark:hover:border-gray-600 transition-colors
                     w-48 sm:w-64 md:w-80"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left truncate">搜索工具...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-xs font-mono text-gray-500 dark:text-gray-400">
            Ctrl+K
          </kbd>
        </button>

        {/* 右侧：界面主题风格下拉框 (与 D:\Antigravity项目\E 对齐) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#161b22] transition-colors">
            <Palette className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-pointer"
              title="切换界面主题风格"
            >
              {THEME_OPTIONS.map((item) => (
                <option key={item.value} value={item.value} className="bg-white dark:bg-[#161b22] text-gray-800 dark:text-gray-200">
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
