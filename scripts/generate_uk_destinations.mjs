#!/usr/bin/env node
/** Generate src/data/ukDomesticDestinations.js from scripts/uk_destinations_seed.mjs */
import { writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { UK_DESTINATIONS_SEED } from './uk_destinations_seed.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/data/ukDomesticDestinations.js');

const NATION_REGION = {
  england: 'England',
  scotland: 'Scotland',
  wales: 'Wales',
  'northern-ireland': 'Northern Ireland',
};

/** @param {typeof UK_DESTINATIONS_SEED[number]} seed */
function expand(seed) {
  const { imageQuery: _imageQuery, ...rest } = seed;
  return {
    ...rest,
    iso: 'GB',
    region: NATION_REGION[seed.ukNation],
    filterRegion: 'europe',
    flightHours: { from: 'UK', min: 0, max: 0 },
    visaNote: '',
    curated: true,
  };
}

const destinations = UK_DESTINATIONS_SEED.map(expand);

const file = `/**
 * UK domestic trip destinations — shown in "In the UK" scope.
 * AUTO-GENERATED — ${destinations.length} destinations
 * Run: npm run generate:uk-destinations
 * @typedef {import('./destinations.js').Destination & {
 *   ukNation: string,
 *   tripType: string,
 *   gettingThere: string,
 *   stayIdea: string,
 * }} UkDestination
 */

/** @type {UkDestination[]} */
const ukDomesticDestinations = ${JSON.stringify(destinations, null, 2)};

export default ukDomesticDestinations;
`;

await writeFile(OUT, file);
console.log(`Wrote ${destinations.length} UK destinations to src/data/ukDomesticDestinations.js`);
