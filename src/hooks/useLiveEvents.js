import { useEffect, useState } from 'react';

const CACHE_KEY = 'voyager-live-events';
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;
const API_BASE = 'https://app.ticketmaster.com/discovery/v2/events.json';

const COUNTRY_POOLS = [
  'GB', 'US', 'MX', 'ES', 'AU', 'DE', 'FR', 'IT', 'NL', 'IE',
  'JP', 'BR', 'ZA', 'IN', 'TH', 'CO', 'PT', 'SE', 'NO', 'PL', 'AR', 'NZ',
];

/** @type {import('./useLiveEvents').NormalizedEvent[]|null} */
let memoryCache = null;

/** @type {Promise<void>|null} */
let inflightFetch = null;

/** @type {Set<() => void>} */
const listeners = new Set();

/**
 * @param {unknown[]} arr
 */
function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function todayISO() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return `${d.toISOString().slice(0, 19)}Z`;
}

function ninetyDaysISO() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 90);
  d.setUTCHours(23, 59, 59, 0);
  return `${d.toISOString().slice(0, 19)}Z`;
}

/**
 * @param {object} venue
 */
function getCountryLabel(venue) {
  return venue?.country?.name || venue?.country?.countryCode || null;
}

/**
 * @param {Array<{ ratio?: string, url?: string }>} images
 * @returns {string|undefined}
 */
function pickImageUrl(images) {
  if (!images?.length) return undefined;
  const preferred = images.find((img) => img.ratio === '3_2');
  return (preferred || images[0])?.url;
}

/**
 * @param {object} event
 */
function isValidEvent(event) {
  const venue = event?._embedded?.venues?.[0];
  return Boolean(
    event?.name
    && venue?.city?.name
    && getCountryLabel(venue)
    && event?.dates?.start?.localDate
    && event?.images?.length,
  );
}

/**
 * @param {object} event
 * @returns {import('./useLiveEvents').NormalizedEvent}
 */
function normalizeEvent(event) {
  const venue = event._embedded.venues[0];
  return {
    id: event.id,
    name: event.name,
    localDate: event.dates.start.localDate,
    city: venue.city.name,
    country: getCountryLabel(venue),
    imageUrl: pickImageUrl(event.images),
  };
}

/**
 * @param {string} apiKey
 * @param {string} countryCode
 */
async function fetchCountryEvents(apiKey, countryCode) {
  const params = new URLSearchParams({
    apikey: apiKey,
    countryCode,
    size: '10',
    sort: 'relevance,desc',
    startDateTime: todayISO(),
    endDateTime: ninetyDaysISO(),
  });

  ['music', 'festival', 'arts', 'theatre'].forEach((name) => {
    params.append('classificationName', name);
  });

  const res = await fetch(`${API_BASE}?${params.toString()}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data._embedded?.events ?? [];
}

/**
 * @param {string} apiKey
 * @returns {Promise<import('./useLiveEvents').NormalizedEvent[]>}
 */
async function fetchLiveEvents(apiKey) {
  const countries = shuffle(COUNTRY_POOLS);
  const merged = [];
  const seen = new Set();

  for (const countryCode of countries) {
    if (merged.length >= 12) break;

    const batch = await fetchCountryEvents(apiKey, countryCode);
    for (const event of batch) {
      if (!isValidEvent(event) || seen.has(event.id)) continue;
      seen.add(event.id);
      merged.push(normalizeEvent(event));
      if (merged.length >= 12) break;
    }

    if (merged.length >= 8) break;
  }

  return shuffle(merged).slice(0, 12);
}

/**
 * @typedef {object} NormalizedEvent
 * @property {string} id
 * @property {string} name
 * @property {string} localDate
 * @property {string} city
 * @property {string} country
 * @property {string} [imageUrl]
 */

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

/**
 * @returns {import('./useLiveEvents').NormalizedEvent[]|null}
 */
function readSessionCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (
      cached?.fetchedAt
      && Date.now() - cached.fetchedAt < CACHE_TTL_MS
      && Array.isArray(cached.events)
      && cached.events.length > 0
    ) {
      return cached.events;
    }
  } catch {
    // ignore corrupt cache
  }
  return null;
}

function ensureLoaded() {
  const apiKey = import.meta.env.VITE_TICKETMASTER_KEY;
  if (!apiKey) {
    console.warn('VITE_TICKETMASTER_KEY is not set — LiveEventCard disabled');
    return Promise.resolve();
  }

  if (memoryCache?.length) return Promise.resolve();

  const sessionCached = readSessionCache();
  if (sessionCached) {
    memoryCache = sessionCached;
    notifyListeners();
    return Promise.resolve();
  }

  if (!inflightFetch) {
    inflightFetch = fetchLiveEvents(apiKey)
      .then((fetched) => {
        if (fetched.length > 0) {
          memoryCache = fetched;
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ fetchedAt: Date.now(), events: fetched }),
          );
        }
      })
      .catch(() => {
        // Ambient feature — fail silently
      })
      .finally(() => {
        inflightFetch = null;
        notifyListeners();
      });
  }

  return inflightFetch;
}

/**
 * Fetch Ticketmaster events once per session (4h sessionStorage cache).
 * @returns {{ events: NormalizedEvent[], loading: boolean }}
 */
export function useLiveEvents() {
  const [events, setEvents] = useState(memoryCache ?? []);
  const [loading, setLoading] = useState(!memoryCache?.length);

  useEffect(() => {
    const sync = () => {
      setEvents(memoryCache ?? []);
      setLoading(false);
    };

    listeners.add(sync);
    ensureLoaded().then(sync);

    return () => {
      listeners.delete(sync);
    };
  }, []);

  return { events, loading };
}

/**
 * @param {string} localDate YYYY-MM-DD
 */
export function formatEventDateChip(localDate) {
  const d = new Date(`${localDate}T12:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
