import { memo } from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  /** Markdown content to render */
  content: string;
  /** Optional className for the container */
  className?: string;
}

/**
 * Renders markdown content with GitHub Flavored Markdown support
 * and syntax-highlighted code blocks using highlight.js.
 */
export const MarkdownRenderer = memo(function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </Markdown>
    </div>
  );
});
