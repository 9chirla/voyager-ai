import { getCrossOrbitPosition } from './GlobeAirplane';

/** Swallow body — faces +X (flight direction). */
export const BIRD_BODY_PATH = `
  M -7 0.4
  C -4.5 -2.2, -0.5 -2.4, 4.5 -1
  L 8.5 -0.35
  L 10.5 0
  L 8.5 0.35
  L 4.5 1
  C -0.5 2.2, -4.5 2, -7 0.4
  Z
  M -7 0.4
  L -10 -1.8
  L -8.2 0.4
  L -10 2.2
  Z
`;

/** Wing pivots at (3, -0.6). */
export const BIRD_WING_PATH = `
  M 3 -0.6
  L -1.5 -6.2
  L 9 -1.8
  Z
`;

export const BIRD_WING_PIVOT = { x: 3, y: -0.6 };

const BIRD_ORBIT_OFFSET = Math.PI * 0.72;
const BIRD_ORBIT_SPEED = 0.58;

/**
 * Same cross-orbit as the plane, phase-shifted and slightly slower.
 */
export function getBirdOrbitPosition(t, cx, cy, globeRadius) {
  return getCrossOrbitPosition(t * BIRD_ORBIT_SPEED + BIRD_ORBIT_OFFSET, cx, cy, globeRadius);
}

/**
 * Wing flap in degrees — faster when orbit speed is higher.
 */
export function getWingFlapAngle(t, activity = 1) {
  const flap = Math.sin(t * 13 * activity) * 16 + Math.sin(t * 26 * activity) * 5;
  return Math.max(-28, Math.min(8, flap));
}
