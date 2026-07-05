import { useEffect, useRef, useState } from 'react';
import { useTravelScope } from '../../context/TravelScopeContext';
import ukDomesticDestinations from '../../data/ukDomesticDestinations';
import HeldVisaSelector from './HeldVisaSelector';
import PassportSelector from './PassportSelector';
import PassportStrengthMeter from './PassportStrengthMeter';
import DestinationGrid from './DestinationGrid';
import UkHomeCitySelector from './UkHomeCitySelector';
import VisaStatusLegend from './VisaStatusLegend';
import './DestinationExplorer.css';

/**
 * Section 03 — Destination Intelligence Explorer
 */
export default function DestinationExplorer() {
  const { scope } = useTravelScope();
  const isUk = scope === 'uk';
  const [passports, setPassports] = useState(['GB']);
  const [heldVisas, setHeldVisas] = useState([]);
  const [heldVisasEnabled, setHeldVisasEnabled] = useState(false);
  const [meterPulse, setMeterPulse] = useState(0);
  const sectionRef = useRef(null);
  const revealRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const revealTarget = revealRef.current;
    if (!section || !revealTarget) return undefined;

    const reveal = () => section.classList.add('is-visible');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      reveal();
      return undefined;
    }

    // Observe the header sentinel — not the full article (194-country grid is too tall
    // for a 10% intersection threshold on the parent).
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal();
        });
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(revealTarget);
    return () => observer.disconnect();
  }, []);

  const bumpMeter = () => setMeterPulse((n) => n + 1);

  const handlePassportChange = (next) => {
    setPassports(next);
    bumpMeter();
  };

  const handleHeldVisaChange = (next) => {
    setHeldVisas(next);
    bumpMeter();
  };

  return (
    <article
      id="section-03"
      ref={sectionRef}
      className="dest-explorer landing-scroll-section landing-scroll-section--over-globe py-16 min-h-[80vh] pointer-events-auto scroll-mt-6"
      aria-label="Destination intelligence"
    >
      <div className="dest-explorer__inner">
        <header ref={revealRef} className="dest-explorer__header landing-section-content px-0">
          <p className="landing-section-num mb-4">03</p>
          <h2 className="landing-section-head mb-5">
            {isUk
              ? 'Discover what Britain has on your doorstep.'
              : 'Every trip starts with knowing where you can go.'}
          </h2>
          <p className="landing-section-body max-w-xl">
            {isUk
              ? 'Pick your home city to see distance, journey time, public transport access, and typical fares to every destination across Britain.'
              : 'Add your passport — and any visas you already hold — to explore visa access across every country. Costs and processing times shown where we have verified data — always confirm on official sources before you travel.'}
          </p>
          {!isUk && <VisaStatusLegend />}
        </header>

        <div className="dest-explorer__sticky-bar">
          {isUk ? (
            <UkHomeCitySelector />
          ) : (
            <>
              <PassportStrengthMeter
                passports={passports}
                heldVisas={heldVisasEnabled ? heldVisas : []}
                pulseKey={meterPulse}
              />
              <PassportSelector
                selected={passports}
                onChange={handlePassportChange}
                onLimitHit={bumpMeter}
              />
              <HeldVisaSelector
                selected={heldVisas}
                onChange={handleHeldVisaChange}
                onLimitHit={bumpMeter}
                enabled={heldVisasEnabled}
                onEnabledChange={setHeldVisasEnabled}
              />
            </>
          )}
        </div>

        <DestinationGrid
          passports={passports}
          heldVisas={heldVisasEnabled ? heldVisas : []}
          scope={scope}
          destinationList={isUk ? ukDomesticDestinations : undefined}
        />
      </div>
    </article>
  );
}
