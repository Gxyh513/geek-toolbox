/**
 * 工具输入状态持久化
 * 每个工具的输入内容自动保存到 localStorage
 */
import { create } from 'zustand';

const STORAGE_KEY = 'geek-toolbox-tool-inputs';

function loadInputs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveInputs(inputs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {}
}

export const useToolStore = create((set, get) => ({
  inputs: loadInputs(),

  setInput: (toolId, value) => {
    const inputs = { ...get().inputs, [toolId]: value };
    saveInputs(inputs);
    set({ inputs });
  },

  getInput: (toolId) => {
    return get().inputs[toolId] || '';
  },

  clearInput: (toolId) => {
    const inputs = { ...get().inputs };
    delete inputs[toolId];
    saveInputs(inputs);
    set({ inputs });
  },
}));
