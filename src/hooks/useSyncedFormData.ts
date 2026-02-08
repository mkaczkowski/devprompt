import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

/**
 * Syncs form data when a trigger condition changes (e.g., dialog opens, ID changes).
 * Similar to useSyncedState but trigger-based rather than active-state-based.
 *
 * @param sourceData - The source data to sync from
 * @param syncTrigger - Value that triggers a re-sync when changed (e.g., item ID, dialog open state)
 */
export function useSyncedFormData<T>(sourceData: T, syncTrigger: unknown): [T, Dispatch<SetStateAction<T>>] {
  const [formData, setFormData] = useState<T>(sourceData);

  // Sync form data when trigger changes
  // This is an intentional pattern for synchronizing external props to local state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional sync pattern
    setFormData(sourceData);
  }, [syncTrigger, sourceData]);

  return [formData, setFormData];
}
