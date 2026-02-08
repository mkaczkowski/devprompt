const PREFIX = 'devprompt';

export const STORAGE_KEYS = {
  preferences: `${PREFIX}-preferences`,
  library: `${PREFIX}-library`,
  prompt: (promptId: string) => `${PREFIX}-prompt-${promptId}`,
  panelLayout: `${PREFIX}-panel-layout`,
} as const;

/**
 * Check if a localStorage key belongs to this app.
 */
export function isAppKey(key: string): boolean {
  return key.startsWith(`${PREFIX}-`);
}

/**
 * Get all localStorage keys that belong to this app.
 */
export function getAllAppKeys(): string[] {
  if (typeof window === 'undefined') return [];

  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isAppKey(key)) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Extract prompt ID from a storage key.
 * Returns null if the key is not a prompt key.
 */
export function extractPromptId(key: string): string | null {
  const prefix = `${PREFIX}-prompt-`;
  if (!key.startsWith(prefix)) return null;
  return key.slice(prefix.length) || null;
}
