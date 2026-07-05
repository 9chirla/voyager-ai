import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DestinationExplorer from '../components/DestinationExplorer';
import HeroText from '../components/landing/HeroText';
import ScopeToggle from '../components/landing/ScopeToggle';
import ScrollNarrative from '../components/landing/ScrollNarrative';
import { UkHomeCityProvider } from '../context/UkHomeCityContext';
import { TravelScopeProvider, useTravelScope } from '../context/TravelScopeContext';

const HeroCanvas = lazy(() => import('../components/landing/HeroCanvas'));

function LandingPageContent() {
  const navigate = useNavigate();
  const { scope } = useTravelScope();
  const ctaRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [scope]);
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reveal = (node) => {
      if (node) node.classList.add('is-visible');
    };

    if (prefersReducedMotion) {
      reveal(ctaRef.current);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0, rootMargin: '0px 0px -5% 0px' },
    );

    if (ctaRef.current) observer.observe(ctaRef.current);
    return () => observer.disconnect();
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
            <HeroCanvas scrollProgress={scrollProgress} focusScope={scope} />
          </Suspense>
        ) : (
          <div className="absolute inset-0 bg-void" aria-hidden="true" />
        )}
      </div>

      <div className="scope-toggle-fixed pointer-events-auto">
        <ScopeToggle />
      </div>

      <section className="scroll-narrative relative z-30" aria-label="Landing content">
        <HeroText scrollProgress={scrollProgress} />
        <ScrollNarrative />
        <DestinationExplorer />
        <div
          ref={ctaRef}
          className="landing-scroll-section landing-scroll-section--over-globe pb-24 pt-8 flex justify-center px-6 pointer-events-auto"
        >
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="cta-primary"
          >
            Start planning
          </button>
        </div>
      </section>
    </div>
  );
}

/**
 * Landing page — D3 halftone globe with hero copy overlay.
 */
export default function LandingPage() {
  return (
    <TravelScopeProvider>
      <UkHomeCityProvider>
        <LandingPageContent />
      </UkHomeCityProvider>
    </TravelScopeProvider>
  );
}
