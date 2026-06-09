import { lazy, Suspense, useEffect, useState } from 'react';
import HeroText from '../components/landing/HeroText';
import ScrollNarrative from '../components/landing/ScrollNarrative';
import ToucanMascot from '../components/ToucanMascot';

const HeroCanvas = lazy(() => import('../components/landing/HeroCanvas'));

/**
 * Landing page — D3 halftone globe with hero copy overlay.
 */
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const range = window.innerHeight;
      const progress = Math.min(1, Math.max(0, window.scrollY / range));
      setScrollProgress(progress);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-void text-star-white font-landing transition-colors duration-300">
      <div className="fixed inset-0 z-0">
        {mounted ? (
          <Suspense fallback={<div className="absolute inset-0 bg-void" aria-hidden="true" />}>
            <HeroCanvas scrollProgress={scrollProgress} />
          </Suspense>
        ) : (
          <div className="absolute inset-0 bg-void" aria-hidden="true" />
        )}
      </div>

      <section className="relative z-10 min-h-screen pointer-events-none">
        <HeroText scrollProgress={scrollProgress} />
      </section>

      <ScrollNarrative />

      <ToucanMascot />
    </div>
  );
}
