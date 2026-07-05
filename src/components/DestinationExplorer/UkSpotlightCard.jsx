import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUkHomeCity } from '../../context/UkHomeCityContext';
import ukDomesticDestinations from '../../data/ukDomesticDestinations';
import { getUkDestinationImage } from '../../data/ukDomesticImages';
import { buildDestinationExplorerContext } from '../../utils/plannerContext';
import { sendToPlanner } from '../../utils/sendToPlanner';
import UkNationBadge from './UkNationBadge';
import UkTravelPanel from './UkTravelPanel';
import './UkSpotlightCard.css';

const ROTATE_MS = 20000;
const FADE_MS = 350;

/**
 * Rotating UK destination spotlight for landing narrative gutters.
 * @param {{ variant?: 'landing' | 'sidebar' }} props
 */
export default function UkSpotlightCard({ variant = 'landing' }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { homeCityId } = useUkHomeCity();
  const currentIndexRef = useRef(0);
  const [renderTick, setRenderTick] = useState(0);
  const [contentVisible, setContentVisible] = useState(true);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const rotate = useCallback(() => {
    if (!ukDomesticDestinations.length || prefersReducedMotion.current) return;

    setContentVisible(false);
    window.setTimeout(() => {
      currentIndexRef.current = (currentIndexRef.current + 1) % ukDomesticDestinations.length;
      setRenderTick((n) => n + 1);
      setContentVisible(true);
    }, FADE_MS);
  }, []);

  useEffect(() => {
    if (!ukDomesticDestinations.length || prefersReducedMotion.current) return undefined;
    const id = window.setInterval(rotate, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [rotate]);

  const dest = ukDomesticDestinations[currentIndexRef.current % ukDomesticDestinations.length];
  void renderTick;

  const image = getUkDestinationImage(dest.id);
  const className = [
    'uk-spotlight-card',
    `uk-spotlight-card--${variant}`,
    contentVisible ? '' : 'uk-spotlight-card--hidden-content',
  ].filter(Boolean).join(' ');

  const handleCta = () => {
    const context = buildDestinationExplorerContext(dest);
    sendToPlanner(context, { pathname, isCollecting: false, navigate });
  };

  return (
    <article className={className} aria-live="polite">
      {image && (
        <img src={image.url} alt="" className="uk-spotlight-card__image" loading="lazy" />
      )}
      <div className="uk-spotlight-card__body">
        <div className="uk-spotlight-card__eyebrow">
          <p className="uk-spotlight-card__label">UK break idea</p>
          <UkNationBadge nation={dest.ukNation} />
        </div>
        <h3 className="uk-spotlight-card__title">{dest.country}</h3>
        <p className="uk-spotlight-card__tagline">{dest.tagline}</p>
        <p className="uk-spotlight-card__trip-type">{dest.tripType}</p>
        <UkTravelPanel
          homeCityId={homeCityId}
          destinationId={dest.id}
          compact
        />
        <button type="button" className="uk-spotlight-card__cta" onClick={handleCta}>
          → Plan this trip
        </button>
      </div>
    </article>
  );
}
