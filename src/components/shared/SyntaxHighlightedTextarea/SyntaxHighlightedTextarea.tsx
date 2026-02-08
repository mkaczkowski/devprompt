import { memo, useCallback, useMemo, useRef } from 'react';

import { type TextareaProps as BaseTextareaProps, textareaVariants } from '@/components/ui/textarea';
import { highlightCode, type SupportedLanguage } from '@/lib/highlight';
import { cn } from '@/lib/utils';

/** Languages supported by the syntax highlighted textarea */
type TextareaLanguage = Extract<
  SupportedLanguage,
  'xml' | 'markdown' | 'javascript' | 'typescript' | 'python' | 'json' | 'bash' | 'css'
>;

interface SyntaxHighlightedTextareaProps extends Omit<BaseTextareaProps, 'textareaSize'> {
  /** The language to use for syntax highlighting */
  language: TextareaLanguage;
  /** Optional size variant */
  textareaSize?: 'default' | 'touch';
}

/**
 * A textarea with syntax highlighting overlay.
 * Uses a transparent textarea on top of a highlighted pre/code backdrop.
 *
 * The overlay technique works by:
 * 1. Rendering highlighted code in a `<pre><code>` element (backdrop)
 * 2. Placing a transparent textarea on top for user input
 * 3. Synchronizing scroll positions between both elements
 */
export const SyntaxHighlightedTextarea = memo(function SyntaxHighlightedTextarea({
  value,
  language,
  className,
  textareaSize,
  onChange,
  onScroll,
  ...props
}: SyntaxHighlightedTextareaProps) {
  // Ref for native scroll synchronization with backdrop
  const backdropRef = useRef<HTMLPreElement>(null);

  // Memoize the highlighted HTML to avoid re-computation on every render
  const highlightedHtml = useMemo(() => {
    const code = String(value ?? '');
    const html = highlightCode(code, language);
    // Ensure empty content shows at least a space for proper height
    return html || '&nbsp;';
  }, [value, language]);

  // Sync scroll positions between textarea and backdrop via native scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLTextAreaElement>) => {
      const target = e.currentTarget;
      const backdrop = backdropRef.current;
      if (backdrop) {
        backdrop.scrollTop = target.scrollTop;
        backdrop.scrollLeft = target.scrollLeft;
      }
      onScroll?.(e);
    },
    [onScroll],
  );

  return (
    <div className="relative h-full w-full font-mono text-sm">
      {/* Highlighted backdrop - visual only, hidden from screen readers */}
      <pre
        ref={backdropRef}
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 m-0 overflow-auto p-2.5 break-words whitespace-pre-wrap',
          'scrollbar-none bg-transparent',
        )}
      >
        <code className="hljs block min-h-full" dangerouslySetInnerHTML={{ __html: highlightedHtml + '\n' }} />
      </pre>

      {/* Transparent textarea on top for user input */}
      <textarea
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        spellCheck={false}
        className={cn(
          textareaVariants({ textareaSize }),
          // Make text transparent so highlight shows through
          'caret-foreground relative z-10 bg-transparent font-mono text-transparent',
          // Match backdrop styling
          'resize-none break-words whitespace-pre-wrap',
          className,
        )}
        {...props}
      />
    </div>
  );
});
