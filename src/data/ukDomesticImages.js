/**
 * Hero photos per UK domestic destination (by id).
 * Files live in /public/destinations/uk/{id}.jpg
 * Run: npm run download:uk-destinations
 */

/** @type {Record<string, string>} Optional alt-text overrides */
const UK_IMAGE_ALT_OVERRIDES = {
  london: 'Tower Bridge and the Thames',
  edinburgh: 'Edinburgh Castle on the skyline',
  'lake-district': 'Derwentwater and the Lake District fells',
  cornwall: 'St Ives harbour, Cornwall',
  snowdonia: 'Snowdonia mountains, Wales',
  'causeway-coast': 'Giant\'s Causeway on the Antrim coast',
  cotswolds: 'Stone cottages in the Cotswolds',
  york: 'York Minster and medieval streets',
  'bath-somerset': 'Royal Crescent, Bath',
  'brighton-coast': 'Brighton Palace Pier',
};

/**
 * @param {string} destinationId
 * @param {string} [countryName]
 * @returns {{ url: string, alt: string }|null}
 */
export function getUkDestinationImage(destinationId, countryName = '') {
  if (!destinationId) return null;
  const alt = UK_IMAGE_ALT_OVERRIDES[destinationId]
    ?? (countryName ? `${countryName}, UK` : 'UK destination');
  return {
    url: `/destinations/uk/${destinationId}.jpg`,
    alt,
  };
}
