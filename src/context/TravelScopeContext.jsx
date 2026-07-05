import { createContext, useContext, useMemo, useState } from 'react';

/** @typedef {'uk' | 'international'} TravelScope */

const STORAGE_KEY = 'voyager-travel-scope';

const TravelScopeContext = createContext(null);

function readStoredScope() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'uk' || stored === 'international') return stored;
  } catch {
    /* ignore */
  }
  return 'international';
}

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function TravelScopeProvider({ children }) {
  const [scope, setScopeState] = useState(readStoredScope);

  const setScope = (next) => {
    setScopeState(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo(() => ({ scope, setScope }), [scope]);

  return (
    <TravelScopeContext.Provider value={value}>
      {children}
    </TravelScopeContext.Provider>
  );
}

/** @returns {{ scope: TravelScope, setScope: (s: TravelScope) => void }} */
export function useTravelScope() {
  const ctx = useContext(TravelScopeContext);
  if (!ctx) throw new Error('useTravelScope must be used within TravelScopeProvider');
  return ctx;
}
