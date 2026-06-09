import { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';

const CARD_BASE = {
  background: 'rgba(5, 5, 15, 0.85)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(201, 168, 76, 0.35)',
  borderRadius: '14px',
  padding: '16px 20px',
  minWidth: '120px',
  textAlign: 'center',
  boxShadow: '0 0 24px rgba(201, 168, 76, 0.12), inset 0 1px 0 rgba(201, 168, 76, 0.08)',
  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  cursor: 'default',
  userSelect: 'none',
};

const CARD_HOVER = {
  borderColor: 'rgba(201, 168, 76, 0.6)',
  boxShadow: '0 0 32px rgba(201, 168, 76, 0.2), inset 0 1px 0 rgba(201, 168, 76, 0.12)',
};

const DESTINATIONS = [
  { id: 'marrakech', name: 'Marrakech', country: 'Morocco', icon: '🕌', position: [3.8, 1.2, 0.5], amp: 0.18, freq: 0.9 },
  { id: 'kyoto', name: 'Kyoto', country: 'Japan', icon: '⛩️', position: [-3.5, 2.2, -0.8], amp: 0.14, freq: 1.1 },
  { id: 'santorini', name: 'Santorini', country: 'Greece', icon: '🏛️', position: [4.5, -0.8, 0.2], amp: 0.16, freq: 0.85 },
  { id: 'cappadocia', name: 'Cappadocia', country: 'Turkey', icon: '🎈', position: [-2.2, -2.0, 0.4], amp: 0.19, freq: 0.8 },
  { id: 'patagonia', name: 'Patagonia', country: 'Argentina', icon: '🏔️', position: [3.2, -2.6, -0.5], amp: 0.2, freq: 0.75 },
  { id: 'reykjavik', name: 'Reykjavik', country: 'Iceland', icon: '🌌', position: [-4.2, 0.8, -1.2], amp: 0.15, freq: 1.05 },
  { id: 'bali', name: 'Bali', country: 'Indonesia', icon: '🌺', position: [2.5, 3.0, -0.3], amp: 0.17, freq: 0.95 },
];

/**
 * Single floating destination card in 3D space.
 * @param {{ destination: object, isHovered: boolean, isDimmed: boolean, onHover: (id: string|null) => void, onInteraction?: () => void }} props
 */
function DestinationCard({
  destination,
  isHovered,
  isDimmed,
  onHover,
  onInteraction,
}) {
  const groupRef = useRef(null);
  const phaseRef = useRef(Math.random() * Math.PI * 2);

  const { scale } = useSpring({
    scale: isHovered ? 1.05 : isDimmed ? 0.95 : 1,
    config: { tension: 120, friction: 22 },
  });

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = destination.position[1]
      + Math.sin(t * destination.freq + phaseRef.current) * destination.amp;
  });

  return (
    <animated.group
      ref={groupRef}
      position={destination.position}
      scale={scale}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover(destination.id);
        onInteraction?.();
      }}
      onPointerOut={() => onHover(null)}
    >
      <Html center distanceFactor={6} transform occlude={false} style={{ pointerEvents: 'auto' }}>
        <div
          style={{
            ...CARD_BASE,
            ...(isHovered ? CARD_HOVER : {}),
            opacity: isDimmed ? 0.5 : 1,
          }}
        >
          <span style={{ fontSize: '28px', lineHeight: 1, display: 'block' }} aria-hidden="true">
            {destination.icon}
          </span>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#c9a84c',
              letterSpacing: '0.04em',
              marginTop: '8px',
              marginBottom: 0,
            }}
          >
            {destination.name}
          </p>
          <p
            style={{
              fontSize: '10px',
              color: 'rgba(232, 238, 255, 0.55)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            {destination.country}
          </p>
        </div>
      </Html>
    </animated.group>
  );
}

/**
 * Floating destination cards orbiting the globe.
 * @param {{ hoveredId: string|null, onHover: (id: string|null) => void, onInteraction?: () => void }} props
 */
export default function FloatingCards({ hoveredId, onHover, onInteraction }) {
  return (
    <group>
      {DESTINATIONS.map((destination) => (
        <DestinationCard
          key={destination.id}
          destination={destination}
          isHovered={hoveredId === destination.id}
          isDimmed={hoveredId !== null && hoveredId !== destination.id}
          onHover={onHover}
          onInteraction={onInteraction}
        />
      ))}
    </group>
  );
}
