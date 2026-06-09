const ORBIT_SCALE = 1.16;
const RING_TILT = Math.PI / 4;

function shellRadius(globeRadius) {
  return globeRadius * ORBIT_SCALE;
}

/**
 * Point on a 3D great-circle ring, projected with depth so the path wraps crossly
 * around the globe rather than sitting flat on screen.
 * @param {number} angle
 * @param {number} cx
 * @param {number} cy
 * @param {number} R
 * @param {number} ringTilt — axis tilt of this ring in 3D (±45° for X cross)
 */
function greatCirclePoint(angle, cx, cy, R, ringTilt) {
  // Circle in XZ plane, then tilt axis for diagonal cross on screen
  const x3 = Math.cos(angle) * R;
  const z3 = Math.sin(angle) * R;
  const y3 = Math.sin(angle * 2 + ringTilt) * R * 0.22;

  // Yaw the ring so the cross sits diagonally (X not +)
  const yaw = Math.PI / 4;
  const x2 = x3 * Math.cos(yaw) - y3 * Math.sin(yaw);
  const y2 = x3 * Math.sin(yaw) + y3 * Math.cos(yaw);
  const z2 = z3;

  // Pitch for subtle globe wrap
  const pitch = 0.55;
  const y1 = y2 * Math.cos(pitch) - z2 * Math.sin(pitch);
  const z1 = y2 * Math.sin(pitch) + z2 * Math.cos(pitch);

  return {
    x: cx + x2 + z1 * 0.36,
    y: cy + y1 * 0.92 - z1 * 0.06,
    depth: z1,
  };
}

/**
 * Clear side-view airplane silhouette — white line-art style.
 */
export const AIRPLANE_PATH = `
  M 16 0
  L 6 -1.2
  L 1 -5.5
  L -2 -5
  L 2 -1.2
  L -10 -0.8
  L -10 0.8
  L 2 1.2
  L -2 5
  L 1 5.5
  L 6 1.2
  Z
`;

/**
 * @param {number} t
 * @param {number} cx
 * @param {number} cy
 * @param {number} globeRadius
 * @param {number} ringTilt
 */
function positionOnRing(t, cx, cy, globeRadius, ringTilt) {
  const R = shellRadius(globeRadius);
  const dt = 0.045;
  const p = greatCirclePoint(t, cx, cy, R, ringTilt);
  const p2 = greatCirclePoint(t + dt, cx, cy, R, ringTilt);
  const angle = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
  const turn = Math.atan2(p2.y - p.y, p2.x - p.x) - Math.atan2(p.y - greatCirclePoint(t - dt, cx, cy, R, ringTilt).y, p.x - greatCirclePoint(t - dt, cx, cy, R, ringTilt).x);
  const bank = Math.max(-20, Math.min(20, turn * 180));

  return { ...p, angle, bank };
}

/**
 * Cross orbit: diagonal ring (+45° tilt) then opposing ring (−45° tilt).
 * @param {number} t
 * @param {number} cx
 * @param {number} cy
 * @param {number} globeRadius
 */
export function getCrossOrbitPosition(t, cx, cy, globeRadius) {
  const ringPeriod = Math.PI * 2;
  const cycle = ringPeriod * 2;
  const phase = ((t % cycle) + cycle) % cycle;

  let pos;
  if (phase < ringPeriod) {
    pos = positionOnRing(phase, cx, cy, globeRadius, RING_TILT);
  } else {
    const a = phase - ringPeriod + Math.PI / 2;
    pos = positionOnRing(a, cx, cy, globeRadius, -RING_TILT);
  }

  const opacity = pos.depth < -globeRadius * 0.35 ? 0.32 : 1;
  const scale = pos.depth < -globeRadius * 0.35 ? 0.72 : 1;

  return {
    x: pos.x,
    y: pos.y,
    angle: pos.angle,
    bank: pos.bank,
    opacity,
    scale,
    depth: pos.depth,
  };
}

/**
 * @param {number} cx
 * @param {number} cy
 * @param {number} globeRadius
 * @param {number} ringTilt
 * @param {number} [steps]
 */
function buildRingPath(cx, cy, globeRadius, ringTilt, steps = 80) {
  const R = shellRadius(globeRadius);
  const parts = [];

  for (let i = 0; i <= steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    const p = greatCirclePoint(a, cx, cy, R, ringTilt);
    parts.push(i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  }

  return parts.join(' ');
}

/**
 * Both diagonal cross rings for the visible flight path.
 */
export function buildCrossOrbitPath(cx, cy, globeRadius) {
  return [
    buildRingPath(cx, cy, globeRadius, RING_TILT),
    buildRingPath(cx, cy, globeRadius, -RING_TILT),
  ].join(' ');
}

/**
 * Recent trail along the active ring.
 */
export function buildFlightTrailPath(t, cx, cy, globeRadius, trailLength = 0.6) {
  const ringPeriod = Math.PI * 2;
  const cycle = ringPeriod * 2;
  const R = shellRadius(globeRadius);
  const steps = 26;
  const parts = [];

  for (let i = 0; i <= steps; i += 1) {
    const phase = t - (i / steps) * trailLength;
    const wrapped = ((phase % cycle) + cycle) % cycle;

    let p;
    if (wrapped < ringPeriod) {
      p = greatCirclePoint(wrapped, cx, cy, R, RING_TILT);
    } else {
      const a = wrapped - ringPeriod + Math.PI / 2;
      p = greatCirclePoint(a, cx, cy, R, -RING_TILT);
    }

    parts.push(i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  }

  return parts.join(' ');
}
