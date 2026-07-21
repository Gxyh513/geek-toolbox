/**
 * 全局搜索状态
 */
import { create } from 'zustand';

export const useSearchStore = create((set) => ({
  isOpen: false,
  query: '',
  open: () => set({ isOpen: true, query: '' }),
  close: () => set({ isOpen: false, query: '' }),
  setQuery: (query) => set({ query }),
}));
