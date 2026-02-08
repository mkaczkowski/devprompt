/**
 * Section within a prompt document.
 */
export interface Section {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
  collapsed: boolean;
}

/**
 * Author information for shared prompts.
 */
export interface SharedAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
}

/**
 * Metadata for a prompt in the library listing.
 */
export interface PromptMetadata {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  /** Number of sections in the prompt */
  sectionCount?: number;
  /** Estimated token count (cached from PromptData) */
  tokenCount?: number;
  /** Unique token for public sharing (if shared) */
  shareToken?: string;
  /** Timestamp when prompt was shared */
  sharedAt?: number;
  /** Author info for shared prompts */
  sharedBy?: SharedAuthor;
}

/**
 * Full prompt data including sections.
 */
export interface PromptData {
  title?: string;
  sections: Section[];
  /** Fixed instructions content (appears at top of prompt output) */
  instructions?: string;
  /** Whether the instructions card is collapsed in the UI */
  instructionsCollapsed?: boolean;
  /** Cached token count (calculated on save) */
  tokenCount?: number;
}

/**
 * Initial data when creating a new section.
 */
export interface SectionInitialData {
  title?: string;
  content?: string;
}

/**
 * Result from removing a section (for undo support).
 */
export interface RemovedSectionResult {
  section: Section;
  index: number;
}

/**
 * Result from deleting a prompt (for undo support).
 */
export interface DeletedPromptResult {
  id: string;
  data: PromptData;
}

/**
 * Shared prompt data returned from get_shared_prompt_by_token RPC.
 * Includes full prompt data plus author information.
 */
export interface SharedPromptData {
  id: string;
  title: string;
  description?: string;
  sectionCount: number;
  tokenCount: number;
  data: PromptData;
  sharedAt: number;
  author: SharedAuthor;
}
