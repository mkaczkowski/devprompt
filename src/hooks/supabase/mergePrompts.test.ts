import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cloudToLocalData, cloudToLocalMetadata, mergePrompts } from './mergePrompts';

import type { CloudPrompt } from '@/types/database';
import type { PromptData, PromptMetadata } from '@/types/prompt';

// Helper to create mock local prompt metadata
function createLocalPrompt(overrides: Partial<PromptMetadata> = {}): PromptMetadata {
  return {
    id: 'test-id',
    title: 'Test Prompt',
    createdAt: 1000,
    updatedAt: 1000,
    sectionCount: 1,
    tokenCount: 100,
    ...overrides,
  };
}

// Helper to create mock cloud prompt
function createCloudPrompt(overrides: Partial<CloudPrompt> = {}): CloudPrompt {
  return {
    id: 'test-id',
    user_id: 'user-1',
    title: 'Test Prompt',
    description: null,
    section_count: 1,
    token_count: 100,
    data: { title: 'Test Prompt', sections: [], tokenCount: 100 },
    client_created_at: 1000,
    client_updated_at: 1000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  } as CloudPrompt;
}

// Helper to create mock prompt data
function createPromptData(overrides: Partial<PromptData> = {}): PromptData {
  return {
    title: 'Test Prompt',
    sections: [
      {
        id: 'section-1',
        title: 'Section 1',
        content: 'Content 1',
        enabled: true,
        collapsed: false,
      },
    ],
    tokenCount: 100,
    ...overrides,
  };
}

describe('mergePrompts', () => {
  const mockLoadLocalData = vi.fn();

  beforeEach(() => {
    mockLoadLocalData.mockReset();
  });

  it('identifies local-only prompts for upload', () => {
    const local = [createLocalPrompt({ id: 'local-1' })];
    const cloud: CloudPrompt[] = [];
    const localData = createPromptData();

    mockLoadLocalData.mockReturnValue(localData);

    const result = mergePrompts(local, cloud, mockLoadLocalData);

    expect(result.uploadToCloud).toHaveLength(1);
    expect(result.uploadToCloud[0].meta.id).toBe('local-1');
    expect(result.uploadToCloud[0].data).toEqual(localData);
    expect(result.stats.localOnly).toBe(1);
    expect(result.stats.cloudOnly).toBe(0);
    expect(result.stats.conflictsLocalWins).toBe(0);
    expect(result.stats.conflictsCloudWins).toBe(0);
  });

  it('identifies cloud-only prompts for local addition', () => {
    const local: PromptMetadata[] = [];
    const cloud = [createCloudPrompt({ id: 'cloud-1' })];

    const result = mergePrompts(local, cloud, mockLoadLocalData);

    expect(result.addToLocal).toHaveLength(1);
    expect(result.addToLocal[0].id).toBe('cloud-1');
    expect(result.stats.cloudOnly).toBe(1);
    expect(result.stats.localOnly).toBe(0);
  });

  it('resolves conflict in favor of newer local prompt', () => {
    const local = [createLocalPrompt({ id: 'shared-1', updatedAt: 2000 })];
    const cloud = [createCloudPrompt({ id: 'shared-1', client_updated_at: 1000 })];
    const localData = createPromptData();

    mockLoadLocalData.mockReturnValue(localData);

    const result = mergePrompts(local, cloud, mockLoadLocalData);

    expect(result.uploadToCloud).toHaveLength(1);
    expect(result.uploadToCloud[0].meta.id).toBe('shared-1');
    expect(result.updateLocal).toHaveLength(0);
    expect(result.stats.conflictsLocalWins).toBe(1);
    expect(result.stats.conflictsCloudWins).toBe(0);
  });

  it('resolves conflict in favor of newer cloud prompt', () => {
    const local = [createLocalPrompt({ id: 'shared-1', updatedAt: 1000 })];
    const cloud = [createCloudPrompt({ id: 'shared-1', client_updated_at: 2000 })];

    const result = mergePrompts(local, cloud, mockLoadLocalData);

    expect(result.updateLocal).toHaveLength(1);
    expect(result.updateLocal[0].id).toBe('shared-1');
    expect(result.uploadToCloud).toHaveLength(0);
    expect(result.stats.conflictsCloudWins).toBe(1);
    expect(result.stats.conflictsLocalWins).toBe(0);
  });

  it('marks prompts with identical timestamps as unchanged', () => {
    const local = [createLocalPrompt({ id: 'shared-1', updatedAt: 1000 })];
    const cloud = [createCloudPrompt({ id: 'shared-1', client_updated_at: 1000 })];

    const result = mergePrompts(local, cloud, mockLoadLocalData);

    expect(result.uploadToCloud).toHaveLength(0);
    expect(result.updateLocal).toHaveLength(0);
    expect(result.addToLocal).toHaveLength(0);
    expect(result.stats.unchanged).toBe(1);
  });

  it('handles mixed scenarios correctly', () => {
    const local = [
      createLocalPrompt({ id: 'local-only', updatedAt: 1000 }),
      createLocalPrompt({ id: 'local-newer', updatedAt: 2000 }),
      createLocalPrompt({ id: 'cloud-newer', updatedAt: 1000 }),
      createLocalPrompt({ id: 'same-time', updatedAt: 1500 }),
    ];
    const cloud = [
      createCloudPrompt({ id: 'cloud-only', client_updated_at: 1000 }),
      createCloudPrompt({ id: 'local-newer', client_updated_at: 1000 }),
      createCloudPrompt({ id: 'cloud-newer', client_updated_at: 2000 }),
      createCloudPrompt({ id: 'same-time', client_updated_at: 1500 }),
    ];
    const localData = createPromptData();

    mockLoadLocalData.mockReturnValue(localData);

    const result = mergePrompts(local, cloud, mockLoadLocalData);

    expect(result.stats.localOnly).toBe(1); // local-only
    expect(result.stats.cloudOnly).toBe(1); // cloud-only
    expect(result.stats.conflictsLocalWins).toBe(1); // local-newer
    expect(result.stats.conflictsCloudWins).toBe(1); // cloud-newer
    expect(result.stats.unchanged).toBe(1); // same-time

    expect(result.uploadToCloud).toHaveLength(2); // local-only + local-newer
    expect(result.addToLocal).toHaveLength(1); // cloud-only
    expect(result.updateLocal).toHaveLength(1); // cloud-newer
  });

  it('skips conflict upload when local data is missing', () => {
    const local = [createLocalPrompt({ id: 'shared-1', updatedAt: 2000 })];
    const cloud = [createCloudPrompt({ id: 'shared-1', client_updated_at: 1000 })];

    mockLoadLocalData.mockReturnValue(null);

    const result = mergePrompts(local, cloud, mockLoadLocalData);

    // Local is newer but data is missing — should not upload
    expect(result.uploadToCloud).toHaveLength(0);
    expect(result.stats.conflictsLocalWins).toBe(0);
  });

  it('skips local prompts without data', () => {
    const local = [createLocalPrompt({ id: 'no-data' })];
    const cloud: CloudPrompt[] = [];

    mockLoadLocalData.mockReturnValue(null);

    const result = mergePrompts(local, cloud, mockLoadLocalData);

    expect(result.uploadToCloud).toHaveLength(0);
    expect(result.stats.localOnly).toBe(0);
  });

  it('handles empty arrays gracefully', () => {
    const result = mergePrompts([], [], mockLoadLocalData);

    expect(result.uploadToCloud).toHaveLength(0);
    expect(result.updateLocal).toHaveLength(0);
    expect(result.addToLocal).toHaveLength(0);
    expect(result.stats.localOnly).toBe(0);
    expect(result.stats.cloudOnly).toBe(0);
    expect(result.stats.conflictsLocalWins).toBe(0);
    expect(result.stats.conflictsCloudWins).toBe(0);
    expect(result.stats.unchanged).toBe(0);
  });
});

describe('cloudToLocalMetadata', () => {
  it('converts cloud prompt to local metadata format', () => {
    const cloud = createCloudPrompt({
      id: 'test-id',
      title: 'Cloud Title',
      description: 'Cloud Description',
      client_created_at: 1000,
      client_updated_at: 2000,
      section_count: 5,
      token_count: 500,
    });

    const result = cloudToLocalMetadata(cloud);

    expect(result).toEqual({
      id: 'test-id',
      title: 'Cloud Title',
      description: 'Cloud Description',
      createdAt: 1000,
      updatedAt: 2000,
      sectionCount: 5,
      tokenCount: 500,
    });
  });

  it('handles null description', () => {
    const cloud = createCloudPrompt({ description: null });

    const result = cloudToLocalMetadata(cloud);

    expect(result.description).toBeUndefined();
  });

  it('handles null section_count and token_count', () => {
    const cloud = createCloudPrompt({
      section_count: null,
      token_count: null,
    });

    const result = cloudToLocalMetadata(cloud);

    expect(result.sectionCount).toBeUndefined();
    expect(result.tokenCount).toBeUndefined();
  });
});

describe('cloudToLocalData', () => {
  it('extracts prompt data from cloud prompt', () => {
    const promptData: PromptData = {
      title: 'Test Title',
      sections: [
        {
          id: 'section-1',
          title: 'Section 1',
          content: 'Content 1',
          enabled: true,
          collapsed: false,
        },
      ],
      tokenCount: 100,
    };

    const cloud = createCloudPrompt({ data: promptData as unknown as CloudPrompt['data'] });

    const result = cloudToLocalData(cloud);

    expect(result).toEqual(promptData);
  });

  it('handles missing sections array', () => {
    const cloud = createCloudPrompt({
      data: { title: 'Test' } as unknown as CloudPrompt['data'],
    });

    const result = cloudToLocalData(cloud);

    expect(result.sections).toEqual([]);
  });
});
