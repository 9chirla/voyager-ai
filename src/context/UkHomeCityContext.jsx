import { createContext, useContext, useMemo, useState } from 'react';
import { DEFAULT_UK_HOME_CITY_ID, UK_HOME_CITY_BY_ID } from '../data/ukHomeCities';
import {
  DEFAULT_UK_TRANSPORT_MODE,
  UK_TRANSPORT_MODE_BY_ID,
} from '../data/ukTransportModes';

const STORAGE_KEY = 'voyager-uk-home-city';
const MODE_STORAGE_KEY = 'voyager-uk-transport-mode';

const UkHomeCityContext = createContext(null);

function readStoredHomeCity() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && UK_HOME_CITY_BY_ID[stored]) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_UK_HOME_CITY_ID;
}

function readStoredTransportMode() {
  try {
    const stored = sessionStorage.getItem(MODE_STORAGE_KEY);
    if (stored && UK_TRANSPORT_MODE_BY_ID[stored]) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_UK_TRANSPORT_MODE;
}

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function UkHomeCityProvider({ children }) {
  const [homeCityId, setHomeCityIdState] = useState(readStoredHomeCity);
  const [transportMode, setTransportModeState] = useState(readStoredTransportMode);

  const setHomeCityId = (id) => {
    if (!UK_HOME_CITY_BY_ID[id]) return;
    setHomeCityIdState(id);
    try {
      sessionStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  };

  const setTransportMode = (mode) => {
    if (!UK_TRANSPORT_MODE_BY_ID[mode]) return;
    setTransportModeState(mode);
    try {
      sessionStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo(
    () => ({
      homeCityId,
      homeCity: UK_HOME_CITY_BY_ID[homeCityId],
      setHomeCityId,
      transportMode,
      transportModeMeta: UK_TRANSPORT_MODE_BY_ID[transportMode],
      setTransportMode,
    }),
    [homeCityId, transportMode],
  );

  return (
    <UkHomeCityContext.Provider value={value}>
      {children}
    </UkHomeCityContext.Provider>
  );
}

/** @returns {{
 *   homeCityId: string,
 *   homeCity: import('../data/ukHomeCities.js').UkHomeCity,
 *   setHomeCityId: (id: string) => void,
 *   transportMode: string,
 *   transportModeMeta: import('../data/ukTransportModes.js').UkTransportMode,
 *   setTransportMode: (mode: string) => void,
 * }} */
export function useUkHomeCity() {
  const ctx = useContext(UkHomeCityContext);
  if (!ctx) throw new Error('useUkHomeCity must be used within UkHomeCityProvider');
  return ctx;
}
