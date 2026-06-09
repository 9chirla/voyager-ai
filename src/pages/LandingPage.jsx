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

      {/* NOTE: hero + scroll-narrative share one flex row so the sticky LiveEventCard gutter
          is visible on first paint (hero) and travels through narrative sections */}
      <section className="scroll-narrative relative z-30" aria-label="Landing content">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row md:items-start gap-10">
          <div className="flex-1 min-w-0 max-w-[860px]">
            <section className="relative z-10 min-h-screen pointer-events-none">
              <HeroText scrollProgress={scrollProgress} />
            </section>
            <ScrollNarrative />
          </div>
          <aside className="w-full max-w-[420px] shrink-0 pointer-events-auto md:sticky md:top-[120px] md:self-start max-md:max-w-[860px] max-md:mx-auto max-md:pb-8">
            <LiveEventCard variant="landing" />
          </aside>
        </div>
      </section>
    </div>
  );
}
