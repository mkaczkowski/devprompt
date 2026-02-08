import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

// Register languages with their aliases
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('css', css);

/**
 * Supported languages for syntax highlighting.
 * Includes both canonical names and common aliases.
 */
export const SUPPORTED_LANGUAGES = [
  'xml',
  'html',
  'markdown',
  'md',
  'javascript',
  'js',
  'typescript',
  'ts',
  'python',
  'py',
  'bash',
  'shell',
  'sh',
  'json',
  'css',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Maximum code size for syntax highlighting (100KB) */
const MAX_HIGHLIGHT_SIZE = 100_000;

/** DOMPurify configuration - only allow highlight.js output */
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['span'] as string[],
  ALLOWED_ATTR: ['class'] as string[],
};

/**
 * Escapes HTML special characters to prevent XSS.
 * Used as fallback when highlighting fails.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Checks if a language is supported for syntax highlighting.
 */
export function isSupportedLanguage(language: string): language is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
}

/**
 * Highlights code using highlight.js with security sanitization.
 *
 * Security measures:
 * - Validates language against allowlist
 * - Limits input size to prevent DoS
 * - Sanitizes output with DOMPurify
 * - Falls back to escaped HTML on error
 *
 * @param code - The code to highlight
 * @param language - The language to use for highlighting
 * @returns Sanitized HTML string with syntax highlighting spans
 */
export function highlightCode(code: string, language: SupportedLanguage): string {
  // Security: Validate language against allowlist
  if (!isSupportedLanguage(language)) {
    console.warn(`Unsupported language for highlighting: ${language}`);
    return escapeHtml(code);
  }

  // Security: Limit input size to prevent DoS/ReDoS
  if (code.length > MAX_HIGHLIGHT_SIZE) {
    console.warn(`Code exceeds maximum size for highlighting (${MAX_HIGHLIGHT_SIZE} chars)`);
    return escapeHtml(code);
  }

  try {
    const result = hljs.highlight(code, { language });
    // Security: Sanitize output as defense-in-depth
    return DOMPurify.sanitize(result.value, PURIFY_CONFIG);
  } catch {
    // If highlighting fails, return safely escaped code
    return escapeHtml(code);
  }
}
