import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Track normalized mouse position for parallax effects.
 * @returns {{ x: number, y: number }} Values in [-1, 1]
 */
export default function useMouseParallax() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const pendingRef = useRef({ x: 0, y: 0 });

  const handleMove = useCallback((event) => {
    pendingRef.current = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1,
    };

    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      setMouse({ ...pendingRef.current });
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMove]);

  return mouse;
}
