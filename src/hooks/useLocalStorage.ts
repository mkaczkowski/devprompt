import { useCallback, useEffect, useState } from 'react';

/**
 * useState-like hook with localStorage persistence.
 * Syncs state across tabs via storage events.
 *
 * @param key - localStorage key
 * @param initialValue - Default value when key doesn't exist
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Lazy initialization reads from localStorage on first render
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      console.warn(`Failed to parse localStorage key "${key}"`);
      return initialValue;
    }
  });

  // Track the previous key to detect changes
  const [prevKey, setPrevKey] = useState(key);

  // Re-read from localStorage when key changes
  if (key !== prevKey) {
    setPrevKey(key);
    try {
      const item = localStorage.getItem(key);
      const newValue = item ? (JSON.parse(item) as T) : initialValue;
      setStoredValue(newValue);
    } catch (error) {
      console.warn(`Failed to read localStorage key "${key}":`, error);
      setStoredValue(initialValue);
    }
  }

  // Sync to localStorage whenever value changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Failed to write localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Setter that supports both direct values and updater functions
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value;
      return nextValue;
    });
  }, []);

  // Sync across tabs via storage events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch (error) {
          console.warn(`Failed to sync localStorage key "${key}" from other tab:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  return [storedValue, setValue];
}
