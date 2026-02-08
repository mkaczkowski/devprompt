/**
 * Type-safe localStorage abstraction with error handling.
 */

import { STORAGE_KEYS } from './storageKeys';

// Extract only string keys (exclude functions like prompt())
type StorageKey = Extract<(typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS], string>;

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Get a value from localStorage with type safety
 */
export function getStorageItem<T>(key: StorageKey, defaultValue: T): T {
  if (!isBrowser()) {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch {
    // If parsing fails, try returning the raw string if T is string
    const item = localStorage.getItem(key);
    if (item !== null) {
      return item as unknown as T;
    }
    return defaultValue;
  }
}

/**
 * Set a value in localStorage with error handling
 */
export function setStorageItem<T>(key: StorageKey, value: T): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to set localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Remove a value from localStorage
 */
export function removeStorageItem(key: StorageKey): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all app-related storage keys
 */
export function clearAppStorage(): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      // Skip function keys (like prompt())
      if (typeof key === 'string') {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Failed to clear app storage:', error);
    return false;
  }
}
