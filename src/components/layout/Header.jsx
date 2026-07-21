import { Search, Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useSearchStore } from '../../stores/searchStore';

/**
 * 顶部导航栏
 * 包含：Logo、全局搜索入口、主题切换按钮
 */
export default function Header() {
  const { theme, cycleTheme } = useThemeStore();
  const { open } = useSearchStore();

  const themeIcon = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };
  const ThemeIcon = themeIcon[theme];

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4">
        {/* 左侧 Logo */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
            <span className="text-blue-500">G</span>eek
            <span className="text-blue-500">T</span>oolbox
          </span>
        </div>

        {/* 中部搜索 */}
        <button
          onClick={open}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 
                     bg-gray-50 dark:bg-[#161b22] text-gray-400 dark:text-gray-500 text-sm
                     hover:border-gray-300 dark:hover:border-gray-600 transition-colors
                     w-64 sm:w-80"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">搜索工具...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-xs font-mono text-gray-500 dark:text-gray-400">
            Ctrl+K
          </kbd>
        </button>

        {/* 右侧主题切换 */}
        <button
          onClick={cycleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={`当前: ${theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '跟随系统'}`}
        >
          <ThemeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </header>
  );
}
