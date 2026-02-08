import type { PromptData, Section } from '@/types';
import type { PreviewFormat } from '@/types/preferences';

/**
 * Extract a prompt title from content (looks for H1 heading at the start).
 */
export function extractPromptTitleFromContent(content: string): { title: string | undefined; content: string } {
  const lines = content.split('\n');
  const firstLine = lines[0]?.trim() ?? '';

  // Check if first line is an H1 heading
  if (firstLine.startsWith('# ')) {
    const title = firstLine.slice(2).trim();
    const remainingContent = lines.slice(1).join('\n').trim();
    return { title: title || undefined, content: remainingContent };
  }

  return { title: undefined, content };
}

/**
 * Parse markdown content with H2 headings into sections.
 */
export function parsePromptToSections(content: string): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];
  let currentSection: Partial<Section> | null = null;
  let contentLines: string[] = [];

  for (const line of lines) {
    // Check for H2 heading (new section)
    if (line.trim().startsWith('## ')) {
      // Save previous section if exists
      if (currentSection) {
        sections.push({
          id: crypto.randomUUID(),
          title: currentSection.title ?? 'Untitled Section',
          content: contentLines.join('\n').trim(),
          enabled: true,
          collapsed: false,
        });
      }

      // Start new section
      const title = line.trim().slice(3).trim();
      currentSection = { title };
      contentLines = [];
    } else if (currentSection) {
      // Add line to current section content
      contentLines.push(line);
    } else {
      // Content before any H2 heading - create an initial section
      if (line.trim()) {
        currentSection = { title: 'Introduction' };
        contentLines = [line];
      }
    }
  }

  // Save last section
  if (currentSection) {
    sections.push({
      id: crypto.randomUUID(),
      title: currentSection.title ?? 'Untitled Section',
      content: contentLines.join('\n').trim(),
      enabled: true,
      collapsed: false,
    });
  }

  return sections;
}

/**
 * Parse raw markdown text into PromptData.
 * Extracts H1 as title, H2s as section headers.
 */
export function parseRawTextToPromptData(rawText: string): PromptData {
  const { title, content } = extractPromptTitleFromContent(rawText);
  const sections = parsePromptToSections(content);

  return {
    title,
    sections,
  };
}

/**
 * Convert a section title to a valid XML tag name.
 * Replaces spaces/special chars with hyphens, lowercases, and removes invalid characters.
 */
export function titleToXmlTag(title: string): string {
  const tag = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/^[0-9]/, 'section-$&'); // Ensure tag starts with letter

  return tag || 'section';
}

/**
 * Format sections for export or copy based on preview format.
 * - preview/markdown: Uses ## headers
 * - xml: Uses XML tags
 * Instructions appear at the top without any title/heading.
 */
export function formatSectionsForCopy(
  sections: Section[],
  format: PreviewFormat = 'markdown',
  instructions?: string,
): string {
  const enabledSections = sections.filter((s) => s.enabled && s.content.trim().length > 0);

  const formattedSections = enabledSections
    .map((section) => {
      if (format === 'markdown' || format === 'preview') {
        const trimmedTitle = section.title.trim();
        return trimmedTitle ? `## ${trimmedTitle}\n\n${section.content}` : section.content;
      }

      // XML mode
      const tag = titleToXmlTag(section.title);
      return `<${tag}>\n${section.content}\n</${tag}>`;
    })
    .join('\n\n');

  // Prepend instructions if present (without any title/heading)
  const trimmedInstructions = instructions?.trim();
  if (trimmedInstructions) {
    return formattedSections ? `${trimmedInstructions}\n\n${formattedSections}` : trimmedInstructions;
  }

  return formattedSections;
}
