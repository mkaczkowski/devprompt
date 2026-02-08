import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  extractPromptTitleFromContent,
  formatSectionsForCopy,
  parsePromptToSections,
  parseRawTextToPromptData,
  titleToXmlTag,
} from './parsePrompt';

// Mock crypto.randomUUID for predictable IDs
beforeEach(() => {
  let counter = 0;
  vi.spyOn(crypto, 'randomUUID').mockImplementation(
    () => `00000000-0000-0000-0000-00000000000${++counter}` as ReturnType<typeof crypto.randomUUID>,
  );
});

describe('extractPromptTitleFromContent', () => {
  it('extracts title from H1 heading', () => {
    const result = extractPromptTitleFromContent('# My Title\n\nSome content');
    expect(result.title).toBe('My Title');
    expect(result.content).toBe('Some content');
  });

  it('returns undefined title when no H1', () => {
    const result = extractPromptTitleFromContent('No heading here\nJust content');
    expect(result.title).toBeUndefined();
    expect(result.content).toBe('No heading here\nJust content');
  });

  it('returns undefined title for empty H1', () => {
    const result = extractPromptTitleFromContent('#\nContent after empty heading');
    expect(result.title).toBeUndefined();
  });

  it('handles H1 with extra whitespace', () => {
    const result = extractPromptTitleFromContent('#   Spaced Title   \n\nContent');
    expect(result.title).toBe('Spaced Title');
  });

  it('handles empty content', () => {
    const result = extractPromptTitleFromContent('');
    expect(result.title).toBeUndefined();
    expect(result.content).toBe('');
  });

  it('trims remaining content after title extraction', () => {
    const result = extractPromptTitleFromContent('# Title\n\n\nContent with space');
    expect(result.content).toBe('Content with space');
  });
});

describe('parsePromptToSections', () => {
  it('parses multiple H2 sections', () => {
    const content = '## Section 1\nContent 1\n\n## Section 2\nContent 2';
    const sections = parsePromptToSections(content);

    expect(sections).toHaveLength(2);
    expect(sections[0].title).toBe('Section 1');
    expect(sections[0].content).toBe('Content 1');
    expect(sections[1].title).toBe('Section 2');
    expect(sections[1].content).toBe('Content 2');
  });

  it('creates Introduction section for content before first H2', () => {
    const content = 'Intro text\n\n## First Section\nSection content';
    const sections = parsePromptToSections(content);

    expect(sections[0].title).toBe('Introduction');
    expect(sections[0].content).toBe('Intro text');
    expect(sections[1].title).toBe('First Section');
  });

  it('sets enabled and collapsed defaults', () => {
    const sections = parsePromptToSections('## Test\nContent');

    expect(sections[0].enabled).toBe(true);
    expect(sections[0].collapsed).toBe(false);
  });

  it('returns empty array for empty content', () => {
    expect(parsePromptToSections('')).toEqual([]);
    expect(parsePromptToSections('   ')).toEqual([]);
  });

  it('handles H2 with empty content', () => {
    const sections = parsePromptToSections('## Empty Section\n## Next Section\nContent');

    expect(sections[0].title).toBe('Empty Section');
    expect(sections[0].content).toBe('');
    expect(sections[1].title).toBe('Next Section');
  });

  it('handles single-line section without trailing content', () => {
    const sections = parsePromptToSections('## Only Title');

    expect(sections[0].title).toBe('Only Title');
    expect(sections[0].content).toBe('');
  });

  it('assigns unique IDs to sections', () => {
    const sections = parsePromptToSections('## A\nContent A\n## B\nContent B');

    expect(sections[0].id).toBe('00000000-0000-0000-0000-000000000001');
    expect(sections[1].id).toBe('00000000-0000-0000-0000-000000000002');
  });
});

describe('parseRawTextToPromptData', () => {
  it('parses full prompt with H1 title and H2 sections', () => {
    const raw = '# Main Title\n\n## Section A\nContent A\n\n## Section B\nContent B';
    const data = parseRawTextToPromptData(raw);

    expect(data.title).toBe('Main Title');
    expect(data.sections).toHaveLength(2);
    expect(data.sections[0].title).toBe('Section A');
  });

  it('handles prompt without H1 title', () => {
    const data = parseRawTextToPromptData('## Only Section\nContent');

    expect(data.title).toBeUndefined();
    expect(data.sections).toHaveLength(1);
  });
});

describe('titleToXmlTag', () => {
  it('converts title to lowercase with hyphens', () => {
    expect(titleToXmlTag('My Section Title')).toBe('my-section-title');
  });

  it('removes special characters', () => {
    expect(titleToXmlTag('Section (1): Test!')).toBe('section-1-test');
  });

  it('handles numeric-starting titles', () => {
    expect(titleToXmlTag('123 Numbers First')).toBe('section-123-numbers-first');
  });

  it('returns section for empty title', () => {
    expect(titleToXmlTag('')).toBe('section');
    expect(titleToXmlTag('   ')).toBe('section');
  });

  it('removes leading and trailing hyphens', () => {
    expect(titleToXmlTag('---Test---')).toBe('test');
  });
});

describe('formatSectionsForCopy', () => {
  const sections = [
    { id: '1', title: 'First', content: 'Content 1', enabled: true, collapsed: false },
    { id: '2', title: 'Second', content: 'Content 2', enabled: false, collapsed: false },
    { id: '3', title: 'Third', content: 'Content 3', enabled: true, collapsed: false },
  ];

  it('formats as markdown with H2 headings', () => {
    const result = formatSectionsForCopy(sections, 'markdown');

    expect(result).toBe('## First\n\nContent 1\n\n## Third\n\nContent 3');
  });

  it('formats as XML with tags', () => {
    const result = formatSectionsForCopy(sections, 'xml');

    expect(result).toBe('<first>\nContent 1\n</first>\n\n<third>\nContent 3\n</third>');
  });

  it('formats preview same as markdown', () => {
    const result = formatSectionsForCopy(sections, 'preview');

    expect(result).toBe('## First\n\nContent 1\n\n## Third\n\nContent 3');
  });

  it('filters out disabled sections', () => {
    const result = formatSectionsForCopy(sections);

    expect(result).not.toContain('Second');
    expect(result).not.toContain('Content 2');
  });

  it('filters out sections with empty content', () => {
    const sectionsWithEmpty = [
      { id: '1', title: 'Has Content', content: 'Content', enabled: true, collapsed: false },
      { id: '2', title: 'Empty', content: '   ', enabled: true, collapsed: false },
    ];
    const result = formatSectionsForCopy(sectionsWithEmpty);

    expect(result).not.toContain('Empty');
  });

  it('defaults to markdown format', () => {
    const result = formatSectionsForCopy(sections);

    expect(result).toContain('## First');
  });

  it('omits heading for sections with empty title in markdown', () => {
    const sectionsWithEmptyTitle = [
      { id: '1', title: '', content: 'No heading content', enabled: true, collapsed: false },
      { id: '2', title: 'Named', content: 'Named content', enabled: true, collapsed: false },
    ];
    const result = formatSectionsForCopy(sectionsWithEmptyTitle, 'markdown');

    expect(result).toBe('No heading content\n\n## Named\n\nNamed content');
  });

  it('omits heading for sections with whitespace-only title in markdown', () => {
    const sectionsWithBlankTitle = [
      { id: '1', title: '   ', content: 'Blank title content', enabled: true, collapsed: false },
    ];
    const result = formatSectionsForCopy(sectionsWithBlankTitle, 'markdown');

    expect(result).toBe('Blank title content');
  });

  describe('with instructions', () => {
    it('prepends instructions to output without heading', () => {
      const result = formatSectionsForCopy(sections, 'markdown', 'These are instructions');

      expect(result).toBe('These are instructions\n\n## First\n\nContent 1\n\n## Third\n\nContent 3');
    });

    it('handles instructions-only output when no sections', () => {
      const result = formatSectionsForCopy([], 'markdown', 'Instructions only');

      expect(result).toBe('Instructions only');
    });

    it('handles empty instructions', () => {
      const result = formatSectionsForCopy(sections, 'markdown', '');

      expect(result).toBe('## First\n\nContent 1\n\n## Third\n\nContent 3');
    });

    it('handles whitespace-only instructions', () => {
      const result = formatSectionsForCopy(sections, 'markdown', '   ');

      expect(result).toBe('## First\n\nContent 1\n\n## Third\n\nContent 3');
    });

    it('trims instructions before prepending', () => {
      const result = formatSectionsForCopy(sections, 'markdown', '  Instructions with spaces  ');

      expect(result.startsWith('Instructions with spaces\n\n## First')).toBe(true);
    });

    it('works with XML format', () => {
      const result = formatSectionsForCopy(sections, 'xml', 'XML instructions');

      expect(result).toBe('XML instructions\n\n<first>\nContent 1\n</first>\n\n<third>\nContent 3\n</third>');
    });
  });
});
