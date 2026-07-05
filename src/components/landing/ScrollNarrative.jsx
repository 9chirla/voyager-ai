import { useEffect, useRef } from 'react';
import UkSpotlightCard from '../DestinationExplorer/UkSpotlightCard';
import LiveEventCard from '../LiveEventCard';
import SeasonalCard from '../SeasonalCard';
import { useTravelScope } from '../../context/TravelScopeContext';
import '../SeasonalCard.css';

const SECTIONS = {
  uk: [
    {
      num: '01',
      headline: 'Start with a sentence.',
      body: 'A long weekend in Cornwall, half-term in the Lakes, or trains to Edinburgh — when, who\'s going, and what you care about. You talk, we ask follow-ups if something\'s missing.',
    },
    {
      num: '02',
      headline: 'One plan, all of it.',
      body: 'Days mapped out, train times, a packing list, and a booking checklist for stays and things that sell out. The full trip in one go — no spreadsheet.',
    },
  ],
  international: [
    {
      num: '01',
      headline: 'Start with a sentence.',
      body: 'Where you want to go, when, what kind of trip you want, and roughly what you can spend. You talk, we ask follow-ups if something\'s missing. No long form to fill out.',
    },
    {
      num: '02',
      headline: 'One plan, all of it.',
      body: 'Days mapped out, a packing list, a booking checklist, and notes on things that are easy to miss. You get the full thing in one go, not piece by piece.',
    },
  ],
};

/**
 * Scroll-driven feature narrative below the hero canvas.
 */
export default function ScrollNarrative() {
  const { scope } = useTravelScope();
  const sections = SECTIONS[scope];
  const sectionRefs = useRef([]);
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const reveal = (node) => {
      if (node) node.classList.add('is-visible');
    };

    if (prefersReducedMotion) {
      sectionRefs.current.forEach(reveal);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    );

    sectionRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pointer-events-none">
        {sections.map((section, index) => (
          <article
            key={section.num}
            ref={(el) => {
              sectionRefs.current[index] = el;
            }}
            className="landing-scroll-section landing-scroll-section--over-globe min-h-[80vh] py-16"
          >
            <div className="landing-section-row">
              <div className="landing-section-content flex flex-col justify-center min-h-[60vh] px-6">
                <p className="landing-section-num mb-4">{section.num}</p>
                <h2 className="landing-section-head mb-5">{section.headline}</h2>
                <p className="landing-section-body max-w-xl">{section.body}</p>
              </div>

              {index === 0 && (
                <aside className="landing-section-card-gutter" aria-label={scope === 'uk' ? 'UK break ideas' : 'Seasonal phenomena'}>
                  {scope === 'uk' ? (
                    <UkSpotlightCard variant="landing" />
                  ) : (
                    <SeasonalCard variant="landing" />
                  )}
                </aside>
              )}
              {index === 1 && (
                <aside className="landing-section-card-gutter" aria-label={scope === 'uk' ? 'UK events' : 'Live events'}>
                  <LiveEventCard variant="landing" countryFilter={scope === 'uk' ? 'uk' : undefined} />
                </aside>
              )}
            </div>
          </article>
        ))}

    </div>
  );
}
