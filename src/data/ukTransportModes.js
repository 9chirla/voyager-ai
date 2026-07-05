/**
 * Preferred transport modes for UK domestic travel.
 * @typedef {{ id: string, label: string, shortLabel: string }} UkTransportMode
 */

/** @type {UkTransportMode[]} */
export const UK_TRANSPORT_MODES = [
  { id: 'train', label: 'Train', shortLabel: 'Train' },
  { id: 'car', label: 'Car', shortLabel: 'Car' },
  { id: 'coach', label: 'Coach', shortLabel: 'Coach' },
  { id: 'bicycle', label: 'Bicycle', shortLabel: 'Bike' },
  { id: 'walk', label: 'On foot', shortLabel: 'Walk' },
];

/** @type {Record<string, UkTransportMode>} */
export const UK_TRANSPORT_MODE_BY_ID = Object.fromEntries(
  UK_TRANSPORT_MODES.map((m) => [m.id, m]),
);

export const DEFAULT_UK_TRANSPORT_MODE = 'train';
