let markdownLoaded = false;

/**
 * Prefetch markdown rendering dependencies.
 * Call this when user hovers over content that will need markdown,
 * or after initial page load on editor routes.
 */
export function prefetchMarkdownChunk(): void {
  if (markdownLoaded) return;
  markdownLoaded = true;

  // Dynamically import to trigger chunk loading
  void Promise.all([import('react-markdown'), import('remark-gfm')]);
}

/**
 * Schedule markdown prefetching after the browser is idle.
 * Should be called on routes that will likely need markdown rendering.
 */
export function scheduleMarkdownPrefetch(): void {
  const prefetch = () => prefetchMarkdownChunk();

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(prefetch, { timeout: 5000 });
  } else {
    setTimeout(prefetch, 3000);
  }
}
