import { useEffect, useState } from "react";

export const DEFAULT_DEBOUNCE_MS = 300;

/** Returns `value` once it has stopped changing for `delay` ms. */
export const useDebounce = <T>(value: T, delay = DEFAULT_DEBOUNCE_MS): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
};
