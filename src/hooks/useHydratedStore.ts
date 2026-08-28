import { useEffect, useState } from 'react';

type SelectorFn<T, F> = (state: T) => F;

interface PersistableStore {
  persist?: {
    hasHydrated: () => boolean;
    rehydrate: () => unknown;
  };
}

export function useHydratedStore<T, F>(
  store: ((selector: SelectorFn<T, F>) => F) & PersistableStore,
  selector: SelectorFn<T, F>
): F | undefined {
  const storeState = store(selector);
  const [hydratedState, setHydratedState] = useState<F | undefined>(undefined);

  useEffect(() => {
    const hasPersist = store.persist;
    if (hasPersist && !hasPersist.hasHydrated()) {
      hasPersist.rehydrate();
    }
  }, [store]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setHydratedState(storeState);
    }, 0);
    return () => clearTimeout(handle);
  }, [storeState]);

  return hydratedState;
}
