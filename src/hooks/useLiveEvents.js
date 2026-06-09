import { useEffect, useState } from 'react';

const CACHE_KEY = 'voyager-live-events';
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;
const API_BASE = 'https://app.ticketmaster.com/discovery/v2/events.json';

const COUNTRY_POOLS = [
  'JP', 'MX', 'BR', 'ES', 'AU', 'ZA', 'IN', 'IT', 'NL', 'TH',
  'CO', 'PT', 'SE', 'NO', 'PL', 'AR', 'NZ', 'DE', 'FR', 'IE',
];

/** @type {Promise<import('../hooks/useLiveEvents').NormalizedEvent[]>|null} */
let inflightFetch = null;

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
  return Boolean(
    event?.name
    && event?._embedded?.venues?.[0]?.city?.name
    && event?._embedded?.venues?.[0]?.country?.name
    && event?.dates?.start?.localDate
    && event?.images?.length,
  );
}

/**
 * @param {object} event
 * @returns {import('../hooks/useLiveEvents').NormalizedEvent}
 */
function normalizeEvent(event) {
  const venue = event._embedded.venues[0];
  return {
    id: event.id,
    name: event.name,
    localDate: event.dates.start.localDate,
    city: venue.city.name,
    country: venue.country.name,
    imageUrl: pickImageUrl(event.images),
  };
}

/**
 * @param {string} apiKey
 * @returns {Promise<import('../hooks/useLiveEvents').NormalizedEvent[]>}
 */
async function fetchLiveEvents(apiKey) {
  const countries = shuffle(COUNTRY_POOLS).slice(0, 2);
  const startDateTime = todayISO();
  const endDateTime = ninetyDaysISO();

  const requests = countries.map(async (countryCode) => {
    const params = new URLSearchParams({
      apikey: apiKey,
      classificationName: 'music,festival,arts,theatre',
      countryCode,
      size: '8',
      sort: 'relevance,desc',
      startDateTime,
      endDateTime,
    });

    const res = await fetch(`${API_BASE}?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data._embedded?.events ?? [];
  });

  const batches = await Promise.all(requests);
  const merged = batches.flat();
  return shuffle(merged.filter(isValidEvent))
    .slice(0, 12)
    .map(normalizeEvent);
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

/**
 * Fetch Ticketmaster events once per session (4h sessionStorage cache).
 * @returns {{ events: NormalizedEvent[], loading: boolean }}
 */
export function useLiveEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TICKETMASTER_KEY;
    if (!apiKey) {
      console.warn('VITE_TICKETMASTER_KEY is not set — LiveEventCard disabled');
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function load() {
      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw);
          if (
            cached?.fetchedAt
            && Date.now() - cached.fetchedAt < CACHE_TTL_MS
            && Array.isArray(cached.events)
            && cached.events.length > 0
          ) {
            if (!cancelled) {
              setEvents(cached.events);
              setLoading(false);
            }
            return;
          }
        }

        if (!inflightFetch) {
          inflightFetch = fetchLiveEvents(apiKey).finally(() => {
            inflightFetch = null;
          });
        }

        const fetched = await inflightFetch;
        if (cancelled) return;

        if (fetched.length > 0) {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ fetchedAt: Date.now(), events: fetched }),
          );
          setEvents(fetched);
        }
      } catch {
        // Ambient feature — fail silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
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
