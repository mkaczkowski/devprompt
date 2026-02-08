import { describe, expect, it, vi } from 'vitest';

import { highlightCode, isSupportedLanguage, type SupportedLanguage } from './highlight';

describe('highlight', () => {
  describe('isSupportedLanguage', () => {
    it('validates supported and unsupported languages', () => {
      // Supported languages
      expect(isSupportedLanguage('xml')).toBe(true);
      expect(isSupportedLanguage('javascript')).toBe(true);
      expect(isSupportedLanguage('js')).toBe(true); // alias

      // Unsupported languages
      expect(isSupportedLanguage('ruby')).toBe(false);
      expect(isSupportedLanguage('')).toBe(false);
      expect(isSupportedLanguage('invalid')).toBe(false);
    });
  });

  describe('highlightCode', () => {
    it('highlights XML with proper class names', () => {
      const result = highlightCode('<div class="test">content</div>', 'xml');

      expect(result).toContain('hljs-tag');
      expect(result).toContain('hljs-name');
      expect(result).toContain('hljs-attr');
    });

    it('highlights Markdown headers', () => {
      const result = highlightCode('## Header', 'markdown');
      expect(result).toContain('hljs-section');
    });

    it('highlights JavaScript syntax', () => {
      const result = highlightCode('const str = "hello";', 'javascript');

      expect(result).toContain('hljs-keyword');
      expect(result).toContain('hljs-string');
    });

    describe('Security', () => {
      it('escapes HTML when language is not supported', () => {
        const code = '<script>alert("xss")</script>';
        const result = highlightCode(code, 'unsupported' as SupportedLanguage);

        expect(result).not.toContain('<script>');
        expect(result).toContain('&lt;script&gt;');
      });

      it('sanitizes output to only allow span tags', () => {
        const result = highlightCode('const x = 1;', 'javascript');
        // Result should only contain span tags (allowed by DOMPurify config)
        expect(result).not.toMatch(/<(?!span|\/span)[^>]+>/);
      });

      it('prevents XSS in XML code', () => {
        const result = highlightCode('<img src=x onerror=alert(1)>', 'xml');
        expect(result).not.toContain('onerror=');
      });

      it('escapes all HTML special characters in fallback', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const result = highlightCode('& < > " \'', 'unsupported' as SupportedLanguage);

        expect(result).toContain('&amp;');
        expect(result).toContain('&lt;');
        expect(result).toContain('&gt;');
        expect(result).toContain('&quot;');
        expect(result).toContain('&#39;');

        warnSpy.mockRestore();
      });

      it('rejects oversized input to prevent DoS', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const largeCode = 'x'.repeat(100_001);
        const result = highlightCode(largeCode, 'javascript');

        expect(result).not.toContain('hljs-');
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('exceeds maximum size'));

        warnSpy.mockRestore();
      });

      it('warns and escapes for unsupported language', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const result = highlightCode('some code', 'unsupported' as SupportedLanguage);

        expect(result).toBe('some code');
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Unsupported language'));

        warnSpy.mockRestore();
      });
    });

    describe('Edge cases', () => {
      it('handles empty and whitespace-only input', () => {
        expect(highlightCode('', 'javascript')).toBe('');
        expect(highlightCode('   \n\t  ', 'javascript')).toBe('   \n\t  ');
      });

      it('preserves unicode characters', () => {
        const result = highlightCode('const emoji = "🎉";', 'javascript');

        expect(result).toContain('🎉');
        expect(result).toContain('hljs-string');
      });
    });
  });
});
