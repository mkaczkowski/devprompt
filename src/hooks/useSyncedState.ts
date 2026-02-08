import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react';

/**
 * Syncs local state with an external value, but only when not actively editing.
 * Prevents external updates from overwriting user input mid-edit.
 *
 * @param externalValue - The external/server value to sync from
 * @param isActive - Whether the user is currently editing (blocks sync)
 */
export function useSyncedState<T>(externalValue: T, isActive: boolean): [T, Dispatch<SetStateAction<T>>] {
  const [localValue, setLocalValue] = useState<T>(externalValue);
  const prevIsActiveRef = useRef(isActive);

  // Sync when:
  // 1. Not active (external value changed while inactive)
  // 2. Just switched from active to inactive (sync to latest external value)
  // 3. Just switched from inactive to active (populate with initial value, e.g., opening drawer)
  // This is an intentional pattern for synchronizing external props to local state
  useEffect(() => {
    const justBecameInactive = prevIsActiveRef.current && !isActive;
    const justBecameActive = !prevIsActiveRef.current && isActive;

    if (!isActive || justBecameInactive || justBecameActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional sync pattern
      setLocalValue(externalValue);
    }

    prevIsActiveRef.current = isActive;
  }, [externalValue, isActive]);

  return [localValue, setLocalValue];
}
