import { lazy, Suspense, useEffect, useState } from 'react';
import LiveEventCard from '../components/LiveEventCard';
import HeroText from '../components/landing/HeroText';
import ScrollNarrative from '../components/landing/ScrollNarrative';

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
      const range = window.innerHeight * 0.85;
      // Cap early so the globe stays visible behind narrative sections.
      const progress = Math.min(0.55, Math.max(0, window.scrollY / range));
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

      {/* NOTE: adapted from spec — fixed overlay so card is visible on first paint (not buried below narrative) */}
      <div
        className="live-event-card-anchor pointer-events-auto"
        aria-label="Live events"
      >
        <LiveEventCard variant="landing" />
      </div>

      <section className="scroll-narrative relative z-30" aria-label="Landing content">
        <HeroText scrollProgress={scrollProgress} />
        <div className="max-w-[860px] mx-auto px-6">
          <ScrollNarrative />
        </div>
      </section>
    </div>
  );
}
