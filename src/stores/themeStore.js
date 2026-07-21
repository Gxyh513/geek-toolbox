/**
 * 主题状态管理
 * theme: 'light' | 'dark' | 'system'
 * 用户手动选择后写入 localStorage
 * 未选择时始终跟随系统
 */
import { create } from 'zustand';

const THEME_KEY = 'geek-toolbox-theme';

function getStoredTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'light' || t === 'dark' || t === 'system') return t;
  } catch {}
  return null;
}

function getSystemDark() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(theme) {
  const isDark = theme === 'dark' || (theme === 'system' && getSystemDark());
  document.documentElement.classList.toggle('dark', isDark);
}

function getEffectiveTheme(theme) {
  if (theme === 'system') return getSystemDark() ? 'dark' : 'light';
  return theme;
}

export const useThemeStore = create((set, get) => {
  const stored = getStoredTheme();
  const initial = stored || 'system';
  // 初始应用（首次 FOUC 脚本已处理，这里补充同步）
  applyTheme(initial);

  // 如果用户未手动选择，监听系统主题变化
  let mediaListener = null;
  if (!stored) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mediaListener = (e) => {
      // 仅在 system 模式下响应系统变化
      if (get().theme === 'system') {
        applyTheme('system');
      }
    };
    mq.addEventListener('change', mediaListener);
  }

  return {
    theme: initial,
    effectiveTheme: getEffectiveTheme(initial),
    mediaListener,

    setTheme: (theme) => {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {}
      applyTheme(theme);

      // 如果之前没监听，且现在选择了 system，添加监听
      const state = get();
      if (!state.mediaListener && theme === 'system') {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (e) => {
          if (get().theme === 'system') {
            applyTheme('system');
          }
        };
        mq.addEventListener('change', listener);
        set({ mediaListener: listener });
      }
      // 如果用户切换到了明确模式，移除监听
      if (state.mediaListener && theme !== 'system') {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.removeEventListener('change', state.mediaListener);
        set({ mediaListener: null });
      }

      set({ theme, effectiveTheme: getEffectiveTheme(theme) });
    },

    cycleTheme: () => {
      const { theme } = get();
      const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
      get().setTheme(next);
    },
  };
});
