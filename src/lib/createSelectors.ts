import type { StoreApi, UseBoundStore } from 'zustand';

/**
 * Type that extends a Zustand store with auto-generated selectors.
 * Adds a `use` namespace with selector functions for each store property.
 */
type WithSelectors<S> = S extends { getState: () => infer T } ? S & { use: { [K in keyof T]: () => T[K] } } : never;

/**
 * Wraps a Zustand store and automatically generates selector hooks for all properties.
 *
 * @example
 * ```tsx
 * const useStoreBase = create<State>()((set) => ({ count: 0 }));
 * export const useStore = createSelectors(useStoreBase);
 *
 * // Usage in components:
 * const count = useStore.use.count();
 * const increment = useStore.use.increment();
 * ```
 */
export function createSelectors<S extends UseBoundStore<StoreApi<object>>>(_store: S): WithSelectors<S> {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {} as WithSelectors<S>['use'];

  for (const key of Object.keys(store.getState())) {
    (store.use as Record<string, () => unknown>)[key] = () => store((state) => state[key as keyof typeof state]);
  }

  return store;
}
