import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSeasonalFact } from '../hooks/useSeasonalFact';
import { buildSeasonalContext } from '../utils/plannerContext';
import { sendToPlanner } from '../utils/sendToPlanner';
import './SeasonalCard.css';

const ROTATE_MS = 20000;
const FADE_MS = 350;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * @param {{ variant?: 'landing' | 'sidebar', onCtaClick?: (destination: string) => void, dimmed?: boolean, isCollecting?: boolean }} props
 */
export default function SeasonalCard({
  variant = 'landing',
  onCtaClick,
  dimmed = false,
  isCollecting = false,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const phenomena = useSeasonalFact();
  const currentIndexRef = useRef(0);
  const [renderTick, setRenderTick] = useState(0);
  const [contentVisible, setContentVisible] = useState(true);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const rotate = useCallback(() => {
    if (!phenomena.length || prefersReducedMotion.current) return;

    setContentVisible(false);
    window.setTimeout(() => {
      currentIndexRef.current = (currentIndexRef.current + 1) % phenomena.length;
      setRenderTick((n) => n + 1);
      setContentVisible(true);
    }, FADE_MS);
  }, [phenomena.length]);

  useEffect(() => {
    if (!phenomena.length || prefersReducedMotion.current) return undefined;

    const id = window.setInterval(rotate, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [phenomena.length, rotate]);

  if (!phenomena.length) return null;

  const item = phenomena[currentIndexRef.current % phenomena.length];
  void renderTick;

  const handleCta = () => {
    const context = buildSeasonalContext(item);

    if (onCtaClick) {
      onCtaClick(context.destination);
      return;
    }

    sendToPlanner(context, {
      pathname,
      isCollecting,
      navigate,
    });
  };

  const categoryLabel = item.category.replace(/-/g, ' ');

  const urgencyLabel = (() => {
    if (item.urgency === 'fleeting') {
      return (
        <>
          <span className="seasonal-card__dot seasonal-card__dot--pulse" aria-hidden="true" />
          NOW
        </>
      );
    }
    if (item.urgency === 'seasonal') {
      return (
        <>
          <span className="seasonal-card__dot" aria-hidden="true" />
          {MONTH_NAMES[item.peakMonth - 1]}
        </>
      );
    }
    return null;
  })();

  const className = [
    'seasonal-card',
    `seasonal-card--${variant}`,
    dimmed ? 'seasonal-card--dimmed' : '',
    contentVisible ? '' : 'seasonal-card--hidden-content',
  ].filter(Boolean).join(' ');

  return (
    <article className={className} aria-live="polite" aria-atomic="true">
      <div className="seasonal-card__eyebrow">
        <p className="seasonal-card__category">{categoryLabel}</p>
        {urgencyLabel && (
          <span className="seasonal-card__urgency">{urgencyLabel}</span>
        )}
      </div>

      <h3 className="seasonal-card__title">{item.title}</h3>

      <p className="seasonal-card__location">
        <svg
          className="seasonal-card__pin"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 1C4.07 1 2.5 2.57 2.5 4.5 2.5 7.25 6 11 6 11s3.5-3.75 3.5-6.5C9.5 2.57 7.93 1 6 1Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="4.5" r="1.2" fill="currentColor" />
        </svg>
        <span>{item.location}</span>
      </p>

      <p className="seasonal-card__description">{item.description}</p>

      <button type="button" className="seasonal-card__cta" onClick={handleCta}>
        → Plan this trip
      </button>
    </article>
  );
}
