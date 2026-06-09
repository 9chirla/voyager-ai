import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import D3GlobeScene from './D3GlobeScene';

/**
 * Full-screen D3 halftone globe hero.
 * @param {{ scrollProgress?: number }} props
 */
export default function HeroCanvas({ scrollProgress = 0 }) {
  const { theme } = useTheme();
  const [viewport, setViewport] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const update = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="relative h-full w-full">
      <D3GlobeScene
        width={viewport.width}
        height={viewport.height}
        scrollProgress={scrollProgress}
        theme={theme}
        className="h-full w-full"
      />
    </div>
  );
}
