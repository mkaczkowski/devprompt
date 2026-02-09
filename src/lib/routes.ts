export const ROUTES = {
  HOME: '/',
  EDITOR: '/prompt/:id',
  SHARED_PROMPT: '/s/:shareToken',
  NOT_FOUND: '*',
} as const;

/**
 * Generate editor route for a specific prompt ID.
 */
export function getEditorRoute(promptId: string): string {
  return `/prompt/${promptId}`;
}

/**
 * Generate full public URL for a shared prompt.
 */
export function getSharedPromptUrl(shareToken: string): string {
  return `${window.location.origin}/s/${shareToken}`;
}
