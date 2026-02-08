import type { DateGroupKey, PromptMetadata, SortDirection } from '@/types';

/** Fixed display order for date groups. */
export const DATE_GROUP_ORDER: readonly DateGroupKey[] = [
  'today',
  'yesterday',
  'thisWeek',
  'lastWeek',
  'thisMonth',
  'lastMonth',
  'thisYear',
  'older',
] as const;

interface DateGroup {
  key: DateGroupKey;
  label: string;
  prompts: PromptMetadata[];
}

/**
 * Classify a timestamp into a date group key relative to now.
 */
export function getDateGroupKey(timestamp: number, now = Date.now()): DateGroupKey {
  const date = new Date(timestamp);
  const today = new Date(now);

  // Reset to start of day
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfYesterday = startOfToday - 86_400_000;

  // Start of this week (Monday)
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfThisWeek = startOfToday - mondayOffset * 86_400_000;
  const startOfLastWeek = startOfThisWeek - 7 * 86_400_000;

  // Start of this month and last month
  const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).getTime();

  // Start of this year
  const startOfThisYear = new Date(today.getFullYear(), 0, 1).getTime();

  const ts = date.getTime();

  if (ts >= startOfToday) return 'today';
  if (ts >= startOfYesterday) return 'yesterday';
  if (ts >= startOfThisWeek) return 'thisWeek';
  if (ts >= startOfLastWeek) return 'lastWeek';
  if (ts >= startOfThisMonth) return 'thisMonth';
  if (ts >= startOfLastMonth) return 'lastMonth';
  if (ts >= startOfThisYear) return 'thisYear';
  return 'older';
}

/** Map of date group keys to display labels. */
const DATE_GROUP_LABELS: Record<DateGroupKey, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  lastWeek: 'Last Week',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  thisYear: 'This Year',
  older: 'Older',
};

/**
 * Get the display label for a date group key.
 * Accepts an optional translation function for i18n support.
 */
export function getDateGroupLabel(key: DateGroupKey, t?: (label: string) => string): string {
  const label = DATE_GROUP_LABELS[key];
  return t ? t(label) : label;
}

/**
 * Group prompts by date and return ordered groups.
 * Only returns groups that contain at least one prompt.
 */
export function groupPromptsByDate(prompts: PromptMetadata[], direction: SortDirection): DateGroup[] {
  const grouped = new Map<DateGroupKey, PromptMetadata[]>();
  const now = Date.now();

  for (const prompt of prompts) {
    const key = getDateGroupKey(prompt.updatedAt, now);
    const existing = grouped.get(key);
    if (existing) {
      existing.push(prompt);
    } else {
      grouped.set(key, [prompt]);
    }
  }

  // Sort prompts within each group by updatedAt
  for (const items of grouped.values()) {
    items.sort((a, b) => (direction === 'desc' ? b.updatedAt - a.updatedAt : a.updatedAt - b.updatedAt));
  }

  // Build ordered result, applying direction to group ordering
  const order = direction === 'desc' ? DATE_GROUP_ORDER : [...DATE_GROUP_ORDER].reverse();

  return order.reduce<DateGroup[]>((result, key) => {
    const prompts = grouped.get(key);
    if (prompts) {
      result.push({ key, label: getDateGroupLabel(key), prompts });
    }
    return result;
  }, []);
}

export type { DateGroup };
