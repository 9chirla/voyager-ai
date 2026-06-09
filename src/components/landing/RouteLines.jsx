import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ROUTE_PAIRS = [
  [[1.1, 0.4, 0.8], [-0.6, 0.9, 1.0]],
  [[-0.9, 0.2, 1.0], [0.5, -0.7, 1.1]],
  [[0.2, 1.1, 0.5], [1.0, -0.3, 0.7]],
  [[-1.0, -0.4, 0.6], [0.8, 0.6, -0.9]],
];

const packetVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const packetFragmentShader = `
  uniform float uProgress;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    float dash = fract(vUv.x * 14.0 - uProgress * 6.0);
    float alpha = smoothstep(0.85, 0.95, dash) * uOpacity;
    float packet = smoothstep(0.48, 0.52, fract(vUv.x - uProgress));
    vec3 color = vec3(0.788, 0.659, 0.298);
    gl_FragColor = vec4(color + packet * 0.35, alpha + packet * 0.8);
  }
`;

/**
 * Build a curved arc between two surface points.
 * @param {THREE.Vector3} start
 * @param {THREE.Vector3} end
 * @returns {THREE.QuadraticBezierCurve3}
 */
function buildArc(start, end) {
  const mid = start.clone().add(end).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(start.length() * 1.55);
  return new THREE.QuadraticBezierCurve3(start, mid, end);
}

/**
 * Animated golden flight-path arcs on the globe surface.
 * @param {{ globeRadius?: number, onInteraction?: () => void }} props
 */
export default function RouteLines({ globeRadius = 0.85, onInteraction }) {
  const materialRefs = useRef([]);
  const notifiedRef = useRef(false);
  const surfaceRadius = globeRadius * 1.04;

  const arcs = useMemo(
    () => ROUTE_PAIRS.map(([a, b], index) => {
      const start = new THREE.Vector3(...a).normalize().multiplyScalar(surfaceRadius);
      const end = new THREE.Vector3(...b).normalize().multiplyScalar(surfaceRadius);
      const curve = buildArc(start, end);
      const geometry = new THREE.TubeGeometry(curve, 64, 0.008, 8, false);
      return { geometry, delay: index * 0.35 };
    }),
    [surfaceRadius],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!notifiedRef.current && t > 0.05) {
      notifiedRef.current = true;
      onInteraction?.();
    }

    arcs.forEach((arc, index) => {
      const mat = materialRefs.current[index];
      if (!mat) return;
      mat.uniforms.uProgress.value = t * 0.35;
      mat.uniforms.uOpacity.value = Math.min(1, Math.max(0, (t - arc.delay) * 1.5));
    });
  });

  return (
    <group>
      {arcs.map(({ geometry }, index) => (
        <mesh key={geometry.uuid} geometry={geometry}>
          <shaderMaterial
            ref={(el) => {
              materialRefs.current[index] = el;
            }}
            vertexShader={packetVertexShader}
            fragmentShader={packetFragmentShader}
            uniforms={{
              uProgress: { value: 0 },
              uOpacity: { value: 0 },
            }}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
