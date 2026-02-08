import type { Section } from '@/types';

/**
 * Pure utility functions for section validation and state queries.
 * These functions are used across multiple components for consistent behavior.
 */

/**
 * Checks if any section has enabled content (non-empty after trimming).
 * Used to determine if copy/preview actions are available.
 */
export function hasEnabledContent(sections: Section[]): boolean {
  return sections.some((s) => s.enabled && s.content.trim().length > 0);
}

/**
 * Checks if copying is allowed based on sections state.
 * Requires at least one section with enabled, non-empty content.
 */
export function canCopySections(sections: Section[]): boolean {
  return sections.length > 0 && hasEnabledContent(sections);
}

/**
 * Checks if all sections are collapsed.
 * Returns false if there are no sections.
 */
export function areAllCollapsed(sections: Section[]): boolean {
  return sections.length > 0 && sections.every((s) => s.collapsed);
}

/**
 * Finds a section by its ID.
 */
export function findSectionById(sections: Section[], id: string): Section | undefined {
  return sections.find((s) => s.id === id);
}

/**
 * Gets only enabled sections.
 */
export function getEnabledSections(sections: Section[]): Section[] {
  return sections.filter((s) => s.enabled);
}

/**
 * Gets sections with non-empty content.
 */
export function getSectionsWithContent(sections: Section[]): Section[] {
  return sections.filter((s) => s.content.trim().length > 0);
}

/**
 * Calculates total content length across all enabled sections.
 */
export function getTotalContentLength(sections: Section[]): number {
  return sections.reduce((total, s) => (s.enabled ? total + s.content.length : total), 0);
}
