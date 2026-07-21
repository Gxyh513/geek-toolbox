import { useState, useEffect } from 'react';

/**
 * 防抖 hook
 * @param {any} value - 需要防抖的值
 * @param {number} delay - 延迟毫秒数，默认 300ms
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
