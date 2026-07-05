#!/usr/bin/env node
/** Build full world destinations list from world-countries + curated overrides. */
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import wc from 'world-countries';
import curated from '../src/data/curatedDestinations.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const REGION_MAP = {
  Europe: 'europe',
  Americas: 'americas',
  Asia: 'asia',
  Africa: 'africa',
  Oceania: 'oceania',
};

const XLSX_ALIASES = {
  'United Kingdom': 'GB',
  'United States': 'US',
  'Dominican Rep.': 'DO',
  'Czech Republic': 'CZ',
  UAE: 'AE',
  'South Korea': 'KR',
  'North Macedonia': 'MK',
  'Hong Kong': 'HK',
  'Sri Lanka': 'LK',
  'Costa Rica': 'CR',
  'New Zealand': 'NZ',
  'South Africa': 'ZA',
};

function hueFromIso(iso) {
  let h = 0;
  for (let i = 0; i < iso.length; i += 1) {
    h = (h * 31 + iso.charCodeAt(i)) % 360;
  }
  return `${h},55%,38%`;
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const countries = wc
  .filter((c) => c.independent && c.cca2 !== 'AQ')
  .map((c) => {
    const iso = c.cca2;
    const override = curated[iso];
    if (override) {
      const { visaNote: _legacyVisaNote, ...rest } = override;
      return {
        ...rest,
        iso,
        country: override.country ?? c.name.common,
        curated: true,
        visaNote: '',
      };
    }
    const [lat, lng] = c.latlng;
    return {
      id: slugify(c.name.common),
      country: c.name.common,
      iso,
      region: c.subregion || c.region,
      filterRegion: REGION_MAP[c.region] ?? 'asia',
      heroHue: hueFromIso(iso),
      tagline: `Check visa access and plan a trip to ${c.name.common}`,
      duration: { min: 7, max: 14, label: '7–14 days' },
      flightHours: { from: 'UK', min: 3, max: 12 },
      bestMonths: [4, 5, 6, 9, 10],
      coords: { lat, lng },
      attractions: [],
      visaNote: '',
      curated: false,
    };
  })
  .sort((a, b) => a.country.localeCompare(b.country));

const nameToIso = {};
for (const c of wc) {
  if (c.cca2) {
    nameToIso[c.name.common] = c.cca2;
    if (c.name.official) nameToIso[c.name.official] = c.cca2;
  }
}
Object.assign(nameToIso, XLSX_ALIASES);

const destinationsJs = `// AUTO-GENERATED — ${countries.length} independent countries
// Run: npm run generate:destinations

/** @typedef {'europe'|'asia'|'americas'|'africa'|'oceania'} FilterRegion */

/**
 * @typedef {object} Destination
 * @property {string} id
 * @property {string} country
 * @property {string} iso
 * @property {string} region
 * @property {FilterRegion} filterRegion
 * @property {string} heroHue
 * @property {string} tagline
 * @property {{ min: number, max: number, label: string }} duration
 * @property {{ from: string, min: number, max: number }} flightHours
 * @property {number[]} bestMonths
 * @property {{ name: string, detail: string, icon: string }[]} attractions
 * @property {string} visaNote
 * @property {{ lat: number, lng: number }} coords
 * @property {boolean} [curated]
 */

/** @type {Destination[]} */
const destinations = ${JSON.stringify(countries, null, 2)};

export default destinations;
`;

writeFileSync(join(ROOT, 'src/data/destinations.js'), destinationsJs);
writeFileSync(
  join(ROOT, 'scripts/country_name_to_iso.json'),
  JSON.stringify(nameToIso, null, 2),
);

console.log(`Generated ${countries.length} destinations (${Object.keys(curated).length} curated)`);
