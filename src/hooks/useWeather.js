import { useEffect, useState } from 'react';

/** @type {Map<string, { monthly: { month: number, tempC: number, precipMm: number }[] }>} */
const climateCache = new Map();

/**
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{ monthly: { month: number, tempC: number, precipMm: number }[] }|null>}
 */
export async function fetchClimate(lat, lng) {
  const key = `${lat},${lng}`;
  if (climateCache.has(key)) return climateCache.get(key);

  try {
    const url = new URL('https://climate-api.open-meteo.com/v1/climate');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lng));
    url.searchParams.set('start_date', '1991-01-01');
    url.searchParams.set('end_date', '2020-12-31');
    url.searchParams.set('models', 'EC_Earth3P');
    url.searchParams.set('monthly', 'temperature_2m_mean,precipitation_sum');

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = await res.json();
    const monthly = (data.monthly?.time ?? []).map((_, i) => ({
      month: i + 1,
      tempC: Math.round(data.monthly.temperature_2m_mean[i]),
      precipMm: Math.round(data.monthly.precipitation_sum[i]),
    }));

    const result = { monthly };
    climateCache.set(key, result);
    return result;
  } catch {
    return null;
  }
}

/**
 * Lazy climate fetch — only when enabled (card expanded).
 * @param {number} lat
 * @param {number} lng
 * @param {boolean} enabled
 */
export function useWeather(lat, lng, enabled) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!enabled || !lat || !lng) return undefined;

    let cancelled = false;
    fetchClimate(lat, lng).then((result) => {
      if (!cancelled) setData(result);
    });

    return () => {
      cancelled = true;
    };
  }, [lat, lng, enabled]);

  return data;
}
