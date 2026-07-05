import ukTravelMatrix from '../data/ukTravelMatrix';
import { DEFAULT_UK_HOME_CITY_ID } from '../data/ukHomeCities';
import { getUkLocalModeTips } from '../data/ukLocalModeTips';
import { DEFAULT_UK_TRANSPORT_MODE } from '../data/ukTransportModes';

const BIKE_DAY_TRIP_MILES = 45;
const BIKE_TOUR_MILES = 90;
const BIKE_SPEED_MPH = 10;
const WALK_PRACTICAL_MILES = 4;
const WALK_SPEED_MPH = 3;

/**
 * @typedef {import('../data/ukTravelMatrix.js').UkTravelInfo & {
 *   preferredMode?: string,
 *   feasible?: boolean,
 *   localTips?: import('../data/ukLocalModeTips.js').UkLocalModeTips,
 *   destinationTips?: import('../data/ukLocalModeTips.js').UkLocalModeTips,
 *   suggestions?: string[],
 * }} UkTravelView
 */

/**
 * @param {string} homeCityId
 * @param {string} destinationId
 * @returns {import('../data/ukTravelMatrix.js').UkTravelInfo|null}
 */
export function getUkTravelFromHome(homeCityId, destinationId) {
  const home = homeCityId || DEFAULT_UK_HOME_CITY_ID;
  return ukTravelMatrix[home]?.[destinationId] ?? null;
}

/**
 * @param {number} miles
 * @returns {number}
 */
export function estimateFuelCostGbp(miles) {
  return Math.round(12 + miles * 0.22);
}

/**
 * @param {number} miles
 * @param {number} [speedMph]
 * @returns {number}
 */
export function estimateCycleMinutes(miles, speedMph = BIKE_SPEED_MPH) {
  if (miles <= 0) return 0;
  return Math.round((miles / speedMph) * 60);
}

/**
 * @param {number} miles
 * @returns {number}
 */
export function estimateWalkMinutes(miles) {
  if (miles <= 0) return 0;
  return Math.round((miles / WALK_SPEED_MPH) * 60);
}

/**
 * @param {import('../data/ukTravelMatrix.js').UkTravelInfo} base
 * @returns {UkTravelView}
 */
function applyTrainMode(base) {
  if (base.mode === 'local') return { ...base, preferredMode: 'train' };

  const trainModes = new Set(['train', 'mixed', 'ferry', 'flight']);
  if (trainModes.has(base.mode)) {
    return {
      ...base,
      preferredMode: 'train',
      feasible: true,
      priceNote: base.priceNote,
    };
  }

  if (base.mode === 'coach') {
    return {
      ...base,
      preferredMode: 'train',
      feasible: false,
      summary: `No direct train · coach ~${formatUkTravelDuration(base.journeyMinutes)} · from £${base.priceFromGbp}`,
      detail: `${base.detail} · nearest rail alternative may need a change`,
      suggestions: ['Switch to coach mode for this route', 'Or drive if you need a direct link'],
    };
  }

  return {
    ...base,
    preferredMode: 'train',
    feasible: false,
    summary: `Drive only · ~${formatUkTravelDuration(base.driveMinutes)} · public transport limited`,
    detail: base.detail,
    journeyMinutes: base.driveMinutes,
    suggestions: ['Try car mode for this destination', 'Check coach services for shorter hops'],
  };
}

/**
 * @param {import('../data/ukTravelMatrix.js').UkTravelInfo} base
 * @returns {UkTravelView}
 */
function applyCarMode(base) {
  if (base.mode === 'local') {
    return {
      ...base,
      preferredMode: 'car',
      mode: 'drive',
      feasible: true,
      journeyMinutes: base.driveMinutes,
      priceFromGbp: 0,
      priceNote: 'Parking & fuel vary by zone',
      summary: 'Explore by car — see local parking tips below',
      detail: 'Short hops within the city — consider park & ride',
    };
  }

  const fuel = estimateFuelCostGbp(base.distanceMiles);
  return {
    ...base,
    preferredMode: 'car',
    mode: 'drive',
    feasible: true,
    publicTransport: false,
    journeyMinutes: base.driveMinutes,
    priceFromGbp: fuel,
    priceNote: 'Fuel + wear estimate',
    summary: `Drive · ~${formatUkTravelDuration(base.driveMinutes)} · ~£${fuel} fuel`,
    detail: base.publicTransport
      ? `${base.distanceMiles} mi via A-roads/motorway · parking at destination`
      : base.detail,
  };
}

/**
 * @param {import('../data/ukTravelMatrix.js').UkTravelInfo} base
 * @returns {UkTravelView}
 */
function applyCoachMode(base) {
  if (base.mode === 'local') {
    return {
      ...base,
      preferredMode: 'coach',
      feasible: true,
      summary: 'Day coaches from local stations — see ideas below',
      detail: 'Victoria-style hubs or regional coach stations',
    };
  }

  if (base.mode === 'coach' || (base.distanceMiles > 0 && base.distanceMiles <= 180)) {
    const coachMins = base.mode === 'coach'
      ? base.journeyMinutes
      : Math.round(base.driveMinutes * 1.2);
    const coachPrice = base.mode === 'coach'
      ? base.priceFromGbp
      : Math.min(42, Math.round(8 + base.distanceMiles * 0.11));

    return {
      ...base,
      preferredMode: 'coach',
      mode: 'coach',
      feasible: true,
      publicTransport: true,
      journeyMinutes: coachMins,
      priceFromGbp: coachPrice,
      priceNote: 'Advance single · typical Jun 2026',
      summary: `Coach · ~${formatUkTravelDuration(coachMins)} · from £${coachPrice}`,
      detail: base.mode === 'coach' ? base.detail : 'National Express / Megabus · check operator timetables',
    };
  }

  return {
    ...base,
    preferredMode: 'coach',
    feasible: false,
    summary: `Coach unlikely · ${base.distanceMiles} mi — train or car better`,
    detail: 'No regular coach link · consider train or driving',
    suggestions: ['Train is usually faster for this distance', 'Car mode shows drive time and fuel'],
  };
}

/**
 * @param {import('../data/ukTravelMatrix.js').UkTravelInfo} base
 * @param {string} destinationId
 * @returns {UkTravelView}
 */
function applyBicycleMode(base, destinationId) {
  const miles = base.distanceMiles;
  const cycleMins = estimateCycleMinutes(miles);
  const destTips = getUkLocalModeTips(destinationId, 'bicycle');

  if (miles === 0) {
    return {
      ...base,
      preferredMode: 'bicycle',
      mode: 'bicycle',
      feasible: true,
      publicTransport: false,
      journeyMinutes: 0,
      priceFromGbp: 0,
      priceNote: 'Own bike or hire',
      summary: 'Explore your city by bike',
      detail: 'Local routes and hire below',
      localTips: destTips ?? undefined,
    };
  }

  if (miles <= BIKE_DAY_TRIP_MILES) {
    return {
      ...base,
      preferredMode: 'bicycle',
      mode: 'bicycle',
      feasible: true,
      publicTransport: false,
      journeyMinutes: cycleMins,
      priceFromGbp: 0,
      priceNote: 'Own bike · no fare',
      summary: `Cycle · ~${formatUkTravelDuration(cycleMins)} · ${miles} mi day ride`,
      detail: 'National Cycle Network · pack lights, repair kit, and water',
      destinationTips: destTips ?? undefined,
      suggestions: destTips
        ? ['See local cycling ideas when you arrive']
        : ['Hire a bike locally if you came by train'],
    };
  }

  if (miles <= BIKE_TOUR_MILES) {
    const days = Math.max(2, Math.ceil(miles / 40));
    return {
      ...base,
      preferredMode: 'bicycle',
      mode: 'bicycle',
      feasible: true,
      publicTransport: false,
      journeyMinutes: cycleMins,
      priceFromGbp: 0,
      priceNote: 'Multi-day tour',
      summary: `Cycle tour · ~${days} days · ${miles} mi`,
      detail: 'Plan B&B stops · NCN or quieter A-road alternatives',
      destinationTips: destTips ?? undefined,
      suggestions: [
        'Consider train part-way and cycle the last leg',
        'Book accommodation en route before you leave',
      ],
    };
  }

  return {
    ...base,
    preferredMode: 'bicycle',
    mode: 'bicycle',
    feasible: false,
    publicTransport: false,
    journeyMinutes: cycleMins,
    priceFromGbp: 0,
    priceNote: 'Not a practical day ride',
    summary: `Cycle · ${miles} mi — too far for most riders`,
    detail: 'Train or coach most of the way · hire a bike at destination',
    destinationTips: destTips ?? undefined,
    suggestions: [
      'Switch to train mode for journey times and fares',
      destTips ? 'Local bike ideas below for when you arrive' : 'Look for bike hire near the station',
    ],
  };
}

/**
 * @param {import('../data/ukTravelMatrix.js').UkTravelInfo} base
 * @param {string} destinationId
 * @returns {UkTravelView}
 */
function applyWalkMode(base, destinationId) {
  const tips = getUkLocalModeTips(destinationId, 'walk');

  if (base.distanceMiles === 0) {
    return {
      ...base,
      preferredMode: 'walk',
      mode: 'walk',
      feasible: true,
      publicTransport: true,
      journeyMinutes: 0,
      priceFromGbp: 0,
      priceNote: 'Free',
      summary: 'Explore on foot',
      detail: 'Walking routes and neighbourhoods below',
      localTips: tips ?? undefined,
    };
  }

  if (base.distanceMiles <= WALK_PRACTICAL_MILES) {
    const walkMins = estimateWalkMinutes(base.distanceMiles);
    return {
      ...base,
      preferredMode: 'walk',
      mode: 'walk',
      feasible: true,
      publicTransport: false,
      journeyMinutes: walkMins,
      priceFromGbp: 0,
      priceNote: 'Free',
      summary: `Walk · ~${formatUkTravelDuration(walkMins)} · ${base.distanceMiles} mi`,
      detail: 'Short urban walk — check pavements and crossings',
      destinationTips: tips ?? undefined,
    };
  }

  return {
    ...base,
    preferredMode: 'walk',
    mode: 'walk',
    feasible: false,
    publicTransport: false,
    journeyMinutes: estimateWalkMinutes(base.distanceMiles),
    priceFromGbp: 0,
    priceNote: 'Not practical on foot',
    summary: `${base.distanceMiles} mi — too far to walk from home`,
    detail: 'Pick train, coach, or car for this trip',
    destinationTips: tips ?? undefined,
    suggestions: [
      'Walking tips below apply once you arrive',
      'Use train or coach to get there first',
    ],
  };
}

/**
 * @param {string} homeCityId
 * @param {string} destinationId
 * @param {string} [transportMode]
 * @returns {UkTravelView|null}
 */
export function getUkTravelForMode(homeCityId, destinationId, transportMode) {
  const base = getUkTravelFromHome(homeCityId, destinationId);
  if (!base) return null;

  const mode = transportMode || DEFAULT_UK_TRANSPORT_MODE;
  const isLocal = homeCityId === destinationId;

  if (isLocal) {
    const localTips = getUkLocalModeTips(homeCityId, mode);
    const localView = (() => {
      switch (mode) {
        case 'car':
          return applyCarMode(base);
        case 'coach':
          return applyCoachMode(base);
        case 'bicycle':
          return applyBicycleMode(base, destinationId);
        case 'walk':
          return applyWalkMode(base, destinationId);
        case 'train':
        default:
          return {
            ...base,
            preferredMode: 'train',
            mode: 'local',
            feasible: true,
            summary: localTips?.headline ?? 'Explore by Tube, tram, bus, or rail',
            detail: localTips?.hire ?? base.detail,
          };
      }
    })();

    return {
      ...localView,
      localTips: localTips ?? undefined,
      distanceMiles: 0,
      driveMinutes: 0,
    };
  }

  switch (mode) {
    case 'car':
      return applyCarMode(base);
    case 'coach':
      return applyCoachMode(base);
    case 'bicycle':
      return applyBicycleMode(base, destinationId);
    case 'walk':
      return applyWalkMode(base, destinationId);
    case 'train':
    default:
      return applyTrainMode(base);
  }
}

/**
 * Journey minutes for sorting/filtering by preferred mode.
 * @param {string} homeCityId
 * @param {string} destinationId
 * @param {string} transportMode
 * @returns {number}
 */
export function getUkModeJourneyMinutes(homeCityId, destinationId, transportMode) {
  const travel = getUkTravelForMode(homeCityId, destinationId, transportMode);
  if (!travel) return 99999;
  if (travel.distanceMiles === 0) return 0;
  if (transportMode === 'car') return travel.driveMinutes;
  if (transportMode === 'bicycle') return travel.journeyMinutes;
  if (transportMode === 'walk') return travel.journeyMinutes;
  return travel.journeyMinutes || travel.driveMinutes;
}

/**
 * @param {string} homeCityId
 * @param {string} destinationId
 * @param {string} transportMode
 * @returns {boolean}
 */
export function isUkDestinationReachableByMode(homeCityId, destinationId, transportMode) {
  const travel = getUkTravelForMode(homeCityId, destinationId, transportMode);
  if (!travel) return false;
  if (travel.distanceMiles === 0) return true;
  if (travel.feasible === false) return false;
  if (transportMode === 'walk' && travel.distanceMiles > WALK_PRACTICAL_MILES) return false;
  if (transportMode === 'bicycle' && travel.distanceMiles > BIKE_TOUR_MILES) return false;
  return true;
}

/**
 * @param {number} mins
 * @returns {string}
 */
export function formatUkTravelDuration(mins) {
  if (mins <= 0) return '—';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
