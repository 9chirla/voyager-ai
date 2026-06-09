import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural star field with inner dust and outer constellation layers.
 * @param {{ mouse: { x: number, y: number }, particleCount?: number }} props
 */
export default function ParticleField({ mouse, particleCount = 4500 }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  const starTexture = useMemo(() => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.4, 'rgba(200, 216, 255, 0.5)');
    gradient.addColorStop(0.7, 'rgba(180, 200, 255, 0.15)');
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const { outerGeometry, innerGeometry } = useMemo(() => {
    const outerPositions = new Float32Array(particleCount * 3);
    const outerColors = new Float32Array(particleCount * 3);
    const innerPositions = new Float32Array(Math.floor(particleCount * 0.45) * 3);
    const innerColors = new Float32Array(Math.floor(particleCount * 0.45) * 3);

    const outerColor = new THREE.Color('#c8d8ff');
    const innerColor = new THREE.Color('#e8eeff');
    const goldColor = new THREE.Color('#c9a84c');

    for (let i = 0; i < particleCount; i += 1) {
      const radius = 6 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      outerPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      outerPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      outerPositions[i * 3 + 2] = radius * Math.cos(phi);

      const useGold = Math.random() < 0.05;
      const color = useGold ? goldColor : outerColor;
      outerColors[i * 3] = color.r;
      outerColors[i * 3 + 1] = color.g;
      outerColors[i * 3 + 2] = color.b;
    }

    const innerCount = innerPositions.length / 3;
    for (let i = 0; i < innerCount; i += 1) {
      const radius = 2.5 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      innerPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      innerPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      innerPositions[i * 3 + 2] = radius * Math.cos(phi);

      const useGold = Math.random() < 0.05;
      const color = useGold ? goldColor : innerColor;
      innerColors[i * 3] = color.r;
      innerColors[i * 3 + 1] = color.g;
      innerColors[i * 3 + 2] = color.b;
    }

    const outerGeo = new THREE.BufferGeometry();
    outerGeo.setAttribute('position', new THREE.BufferAttribute(outerPositions, 3));
    outerGeo.setAttribute('color', new THREE.BufferAttribute(outerColors, 3));

    const innerGeo = new THREE.BufferGeometry();
    innerGeo.setAttribute('position', new THREE.BufferAttribute(innerPositions, 3));
    innerGeo.setAttribute('color', new THREE.BufferAttribute(innerColors, 3));

    return { outerGeometry: outerGeo, innerGeometry: innerGeo };
  }, [particleCount]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.015 + mouse.x * 0.08;
      outerRef.current.rotation.x = mouse.y * 0.04;
      outerRef.current.position.x = mouse.x * 0.15;
      outerRef.current.position.y = mouse.y * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.04 + mouse.x * 0.14;
      innerRef.current.rotation.x = mouse.y * 0.08;
      innerRef.current.position.x = mouse.x * 0.35;
      innerRef.current.position.y = mouse.y * 0.22;
    }
  });

  return (
    <group>
      <points ref={outerRef} geometry={outerGeometry}>
        <pointsMaterial
          map={starTexture}
          size={0.09}
          sizeAttenuation
          vertexColors
          transparent
          alphaTest={0.001}
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points ref={innerRef} geometry={innerGeometry}>
        <pointsMaterial
          map={starTexture}
          size={0.055}
          sizeAttenuation
          vertexColors
          transparent
          alphaTest={0.001}
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
