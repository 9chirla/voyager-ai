/**
 * UK home cities for domestic travel planning.
 * @typedef {{ id: string, label: string, station: string, coords: { lat: number, lng: number }, nation: string }} UkHomeCity
 */

/** @type {UkHomeCity[]} */
export const UK_HOME_CITIES = [
  { id: 'london', label: 'London', station: 'London terminals', coords: { lat: 51.5074, lng: -0.1278 }, nation: 'england' },
  { id: 'manchester', label: 'Manchester', station: 'Manchester Piccadilly', coords: { lat: 53.4808, lng: -2.2426 }, nation: 'england' },
  { id: 'birmingham', label: 'Birmingham', station: 'Birmingham New Street', coords: { lat: 52.4862, lng: -1.8904 }, nation: 'england' },
  { id: 'leeds', label: 'Leeds', station: 'Leeds', coords: { lat: 53.8008, lng: -1.5491 }, nation: 'england' },
  { id: 'bristol', label: 'Bristol', station: 'Bristol Temple Meads', coords: { lat: 51.4545, lng: -2.5879 }, nation: 'england' },
  { id: 'liverpool', label: 'Liverpool', station: 'Liverpool Lime Street', coords: { lat: 53.4084, lng: -2.9916 }, nation: 'england' },
  { id: 'newcastle', label: 'Newcastle', station: 'Newcastle Central', coords: { lat: 54.9783, lng: -1.6178 }, nation: 'england' },
  { id: 'sheffield', label: 'Sheffield', station: 'Sheffield', coords: { lat: 53.3811, lng: -1.4701 }, nation: 'england' },
  { id: 'edinburgh', label: 'Edinburgh', station: 'Edinburgh Waverley', coords: { lat: 55.9533, lng: -3.1883 }, nation: 'scotland' },
  { id: 'glasgow', label: 'Glasgow', station: 'Glasgow Central', coords: { lat: 55.8642, lng: -4.2518 }, nation: 'scotland' },
  { id: 'cardiff', label: 'Cardiff', station: 'Cardiff Central', coords: { lat: 51.4816, lng: -3.1791 }, nation: 'wales' },
  { id: 'belfast', label: 'Belfast', station: 'Belfast stations', coords: { lat: 54.5973, lng: -5.9301 }, nation: 'northern-ireland' },
];

/** @type {Record<string, UkHomeCity>} */
export const UK_HOME_CITY_BY_ID = Object.fromEntries(
  UK_HOME_CITIES.map((c) => [c.id, c]),
);

export const DEFAULT_UK_HOME_CITY_ID = 'london';
