/**
 * 易语言全能开发工具箱 — 多主题调色盘 Engine
 * 完全适配参考项目 D:\Antigravity项目\E 的商业级 UI 风格
 * 支持主题：system | dark | emerald | purple | amber | light
 */
import { create } from 'zustand';

const THEME_KEY = 'user-theme';

export const THEME_OPTIONS = [
  { value: 'system', label: '💻 跟随系统主题' },
  { value: 'dark', label: '🌙 深空夜蓝 (默认玻璃)' },
  { value: 'emerald', label: '🌲 极客翡翠 (暗黑绿晶)' },
  { value: 'purple', label: '🍇 炫彩紫晶 (梦幻紫金)' },
  { value: 'amber', label: '🍊 暖阳琥珀 (暖光黑金)' },
  { value: 'light', label: '☀️ 极简纯白 (明亮白)' },
];

function getStoredTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t && ['system', 'dark', 'emerald', 'purple', 'amber', 'light'].includes(t)) {
      return t;
    }
  } catch {}
  return 'system';
}

function getSystemDark() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(mode) {
  const root = document.documentElement;
  let appliedMode = mode;

  if (mode === 'system') {
    appliedMode = getSystemDark() ? 'dark' : 'light';
  }

  // 挂载 data-applied-theme 供组件与 CSS 变量响应
  root.setAttribute('data-applied-theme', appliedMode);

  // 针对 Tailwind dark 模式类名
  const isDark = appliedMode !== 'light';
  root.classList.toggle('dark', isDark);
}

export const useThemeStore = create((set, get) => {
  const initialTheme = getStoredTheme();

  // 初始化 DOM 主题挂载
  applyTheme(initialTheme);

  // 监听系统主题变化
  if (typeof window !== 'undefined') {
    const mediaQueryDark = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQueryDark.addEventListener('change', () => {
      if (get().theme === 'system') {
        applyTheme('system');
      }
    });
  }

  return {
    theme: initialTheme,

    setTheme: (mode) => {
      try {
        localStorage.setItem(THEME_KEY, mode);
      } catch {}
      applyTheme(mode);
      set({ theme: mode });
    },
  };
});
