#!/usr/bin/env node
/** Generate src/data/ukTravelMatrix.js — travel from each home city to each destination. */
import { writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { UK_DESTINATIONS_SEED } from './uk_destinations_seed.mjs';
import { UK_HOME_CITIES } from '../src/data/ukHomeCities.js';
import { DIRECT_LEGS, FLIGHT_LEGS, REMOTE_FLIGHTS } from './uk_travel_routes.mjs';
import {
  DESTINATION_HUBS, HOME_HUBS, NI_HUBS,
} from './uk_station_hubs.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/data/ukTravelMatrix.js');
const PRICE_NOTE = 'Advance single · typical Jun 2026';

/** @param {{ lat: number, lng: number }} a @param {{ lat: number, lng: number }} b */
function haversineMiles(a, b) {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

/** @param {string} a @param {string} b */
function legKey(a, b) {
  return [a, b].sort().join('|');
}

/** @param {string} from @param {string} to */
function lookupLeg(from, to) {
  if (from === to) {
    return { minutes: 0, priceFrom: 0, operator: 'Local', detail: 'Already here' };
  }
  const direct = DIRECT_LEGS[legKey(from, to)];
  if (direct) return direct;

  const flight = FLIGHT_LEGS[legKey(from, to)];
  if (flight) return flight;

  return null;
}

const ROUTING_VIAS = [
  'london', 'birmingham', 'manchester', 'leeds', 'edinburgh', 'glasgow',
  'newcastle', 'cardiff', 'bristol', 'liverpool', 'sheffield', 'norwich',
  'southampton', 'exeter', 'york', 'inverness', 'aberdeen', 'belfast',
];

/** @param {Array<{ minutes: number, priceFrom: number, operator: string, detail?: string }>} legs @param {number} [changeMins] */
function combineLegs(legs, changeMins = 20) {
  const changes = Math.max(0, legs.length - 1);
  return {
    minutes: legs.reduce((s, l) => s + l.minutes, 0) + changes * changeMins,
    priceFrom: legs.reduce((s, l) => s + l.priceFrom, 0),
    operator: legs.map((l) => l.operator).join(' → '),
    detail: changes ? `${changes} change${changes > 1 ? 's' : ''}` : legs[0]?.detail,
    legs: legs.length,
  };
}

/** @param {string} fromHub @param {string} toHub */
function findRoute(fromHub, toHub) {
  if (fromHub === toHub) {
    return combineLegs([{ minutes: 0, priceFrom: 0, operator: 'Local', detail: 'Walk / local bus' }], 0);
  }

  const direct = lookupLeg(fromHub, toHub);
  if (direct) return combineLegs([direct]);

  let best = null;
  for (const via of ROUTING_VIAS) {
    if (via === fromHub || via === toHub) continue;
    const leg1 = lookupLeg(fromHub, via);
    const leg2 = lookupLeg(via, toHub);
    if (!leg1 || !leg2) continue;
    const combined = combineLegs([leg1, leg2]);
    if (!best || combined.minutes < best.minutes) best = combined;
  }

  return best;
}

/** @param {number} miles */
function driveMinutes(miles) {
  return Math.round((miles / 48) * 60);
}

/** @param {string} homeId @param {string} destId @param {typeof UK_DESTINATIONS_SEED[number]} dest */
function buildTravel(homeId, destId, dest) {
  const home = UK_HOME_CITIES.find((c) => c.id === homeId);
  if (!home) return null;

  const roadMiles = Math.round(haversineMiles(home.coords, dest.coords) * 1.28);
  const driveMins = driveMinutes(roadMiles);

  if (homeId === destId) {
    return {
      distanceMiles: 0,
      driveMinutes: 0,
      publicTransport: true,
      mode: 'local',
      journeyMinutes: 0,
      priceFromGbp: 0,
      priceNote: PRICE_NOTE,
      summary: 'Explore on foot, Tube, tram, or local buses',
      detail: 'You\'re already here',
    };
  }

  const homeHub = HOME_HUBS[homeId];
  const destHub = DESTINATION_HUBS[destId];
  const homeNI = NI_HUBS.has(homeHub);
  const destNI = NI_HUBS.has(destHub);
  const crossSea = homeNI !== destNI;

  if (destHub === 'kirkwall') {
    const flightKey = `kirkwall_${homeHub}`;
    const remote = REMOTE_FLIGHTS[flightKey] || REMOTE_FLIGHTS.kirkwall;
    if (remote && (homeHub === remote.fromHub || lookupLeg(homeHub, remote.fromHub))) {
      const toAirport = homeHub === remote.fromHub
        ? { minutes: 0, priceFrom: 0 }
        : lookupLeg(homeHub, remote.fromHub);
      const airportMins = toAirport?.minutes ?? 0;
      const airportPrice = toAirport?.priceFrom ?? 0;
      return {
        distanceMiles: roadMiles,
        driveMinutes: driveMins,
        publicTransport: true,
        mode: 'flight',
        journeyMinutes: airportMins + remote.minutes + 60,
        priceFromGbp: airportPrice + remote.priceFrom,
        priceNote: PRICE_NOTE,
        summary: `Fly · ~${formatDuration(airportMins + remote.minutes + 60)} · from £${airportPrice + remote.priceFrom}`,
        detail: `${remote.operator} · ${remote.detail}`,
      };
    }
  }

  if (crossSea) {
    const flight = lookupLeg(homeHub, destHub);
    if (flight) {
      return {
        distanceMiles: roadMiles,
        driveMinutes: driveMins,
        publicTransport: true,
        mode: 'flight',
        journeyMinutes: flight.minutes + 90,
        priceFromGbp: flight.priceFrom,
        priceNote: PRICE_NOTE,
        summary: `Fly · ~${formatDuration(flight.minutes + 90)} · from £${flight.priceFrom}`,
        detail: `${flight.operator} · ${flight.detail} (+ airport time)`,
      };
    }
  }

  const leg = findRoute(homeHub, destHub);
  if (leg) {
    const mode = crossSea ? 'flight' : 'train';
    const journeyMinutes = leg.minutes || 0;
    return {
      distanceMiles: roadMiles,
      driveMinutes: driveMins,
      publicTransport: true,
      mode,
      journeyMinutes,
      priceFromGbp: leg.priceFrom,
      priceNote: PRICE_NOTE,
      summary: `${mode === 'flight' ? 'Fly' : 'Train'} · ~${formatDuration(journeyMinutes)} · from £${leg.priceFrom}`,
      detail: `${leg.operator}${leg.detail ? ` · ${leg.detail}` : ''}`,
    };
  }

  if (destHub === 'kyle' || destId === 'isle-of-skye') {
    const toInverness = findRoute(homeHub, 'inverness');
    if (toInverness) {
      const total = toInverness.minutes + 150 + 45;
      return {
        distanceMiles: roadMiles,
        driveMinutes: driveMins,
        publicTransport: true,
        mode: 'mixed',
        journeyMinutes: total,
        priceFromGbp: toInverness.priceFrom + 12,
        priceNote: PRICE_NOTE,
        summary: `Train + bus · ~${formatDuration(total)} · from £${toInverness.priceFrom + 12}`,
        detail: 'ScotRail to Inverness · Citylink bus to Skye',
      };
    }
  }

  if (destHub === 'whitby') {
    const toYork = findRoute(homeHub, 'york');
    if (toYork) {
      const total = toYork.minutes + 95;
      return {
        distanceMiles: roadMiles,
        driveMinutes: driveMins,
        publicTransport: true,
        mode: 'mixed',
        journeyMinutes: total,
        priceFromGbp: toYork.priceFrom + 12,
        priceNote: PRICE_NOTE,
        summary: `Train + bus · ~${formatDuration(total)} · from £${toYork.priceFrom + 12}`,
        detail: 'Train to York · Coastliner 840 to Whitby',
      };
    }
  }

  if (destHub === 'ryde') {
    const toSouthampton = findRoute(homeHub, 'southampton');
    if (toSouthampton) {
      const ferry = lookupLeg('ryde', 'southampton');
      const total = toSouthampton.minutes + (ferry?.minutes ?? 75) + 30;
      return {
        distanceMiles: roadMiles,
        driveMinutes: driveMins,
        publicTransport: true,
        mode: 'ferry',
        journeyMinutes: total,
        priceFromGbp: toSouthampton.priceFrom + (ferry?.priceFrom ?? 18),
        priceNote: PRICE_NOTE,
        summary: `Train + ferry · ~${formatDuration(total)} · from £${toSouthampton.priceFrom + (ferry?.priceFrom ?? 18)}`,
        detail: 'Rail to Southampton · Wightlink foot ferry',
      };
    }
  }

  if (roadMiles <= 180 && !crossSea) {
    const coachMins = Math.round(driveMins * 1.2);
    const coachPrice = Math.min(42, Math.round(8 + roadMiles * 0.11));
    return {
      distanceMiles: roadMiles,
      driveMinutes: driveMins,
      publicTransport: true,
      mode: 'coach',
      journeyMinutes: coachMins,
      priceFromGbp: coachPrice,
      priceNote: PRICE_NOTE,
      summary: `Coach · ~${formatDuration(coachMins)} · from £${coachPrice}`,
      detail: 'National Express / Megabus · no direct train',
    };
  }

  return {
    distanceMiles: roadMiles,
    driveMinutes: driveMins,
    publicTransport: false,
    mode: 'drive',
    journeyMinutes: driveMins,
    priceFromGbp: Math.round(12 + roadMiles * 0.22),
    priceNote: 'Fuel + wear estimate',
    summary: `Drive · ~${formatDuration(driveMins)} · ~£${Math.round(12 + roadMiles * 0.22)} fuel`,
    detail: 'No practical direct public transport · car recommended',
  };
}

/** @param {number} mins */
function formatDuration(mins) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** @type {Record<string, Record<string, object>>} */
const matrix = {};

for (const home of UK_HOME_CITIES) {
  matrix[home.id] = {};
  for (const dest of UK_DESTINATIONS_SEED) {
    matrix[home.id][dest.id] = buildTravel(home.id, dest.id, dest);
  }
}

const file = `/**
 * Travel times & fares from each UK home city to each destination.
 * AUTO-GENERATED — run: npm run generate:uk-travel
 * @typedef {{
 *   distanceMiles: number,
 *   driveMinutes: number,
 *   publicTransport: boolean,
 *   mode: 'local'|'train'|'coach'|'flight'|'ferry'|'mixed'|'drive',
 *   journeyMinutes: number,
 *   priceFromGbp: number,
 *   priceNote: string,
 *   summary: string,
 *   detail: string,
 * }} UkTravelInfo
 */

/** @type {Record<string, Record<string, UkTravelInfo>>} */
const ukTravelMatrix = ${JSON.stringify(matrix, null, 2)};

export default ukTravelMatrix;
`;

await writeFile(OUT, file);
console.log(`Wrote travel matrix for ${UK_HOME_CITIES.length} home cities × ${UK_DESTINATIONS_SEED.length} destinations`);
