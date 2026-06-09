import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { travelFacts } from '../data/travelFacts';
import { sendToPlanner } from '../utils/sendToPlanner';
import './FactCard.css';

const FADE_MS = 300;

/**
 * @param {{
 *   variant?: 'landing' | 'sidebar',
 *   autoRotate?: boolean,
 *   intervalMs?: number,
 *   initialFactIndex?: number,
 *   onCtaClick?: (destination: string) => void,
 *   dimmed?: boolean,
 *   isCollecting?: boolean,
 * }} props
 */
export default function FactCard({
  variant = 'landing',
  autoRotate = true,
  intervalMs = 18000,
  initialFactIndex = Math.floor(Math.random() * travelFacts.length),
  onCtaClick,
  dimmed = false,
  isCollecting = false,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [index, setIndex] = useState(initialFactIndex % travelFacts.length);
  const [motionClass, setMotionClass] = useState('fact-card--entering');
  const prefersReducedMotion = useRef(false);

  const fact = travelFacts[index];

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const rotate = useCallback(() => {
    if (prefersReducedMotion.current) return;

    setMotionClass('fact-card--fading-out');

    window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % travelFacts.length);
      setMotionClass('fact-card--fading-in');

      window.setTimeout(() => {
        setMotionClass('');
      }, FADE_MS);
    }, FADE_MS);
  }, []);

  useEffect(() => {
    if (!autoRotate || dimmed || prefersReducedMotion.current) return undefined;

    const id = window.setInterval(rotate, intervalMs);
    return () => window.clearInterval(id);
  }, [autoRotate, dimmed, intervalMs, rotate]);

  const handleCta = useCallback(() => {
    if (onCtaClick) {
      onCtaClick(fact.destination);
      return;
    }

    sendToPlanner(fact.destination, {
      pathname,
      isCollecting,
      navigate,
    });
  }, [onCtaClick, fact.destination, pathname, isCollecting, navigate]);

  const className = useMemo(() => {
    const classes = ['fact-card', `fact-card--${variant}`];
    if (dimmed) classes.push('fact-card--dimmed');
    if (motionClass) classes.push(motionClass);
    return classes.join(' ');
  }, [variant, dimmed, motionClass]);

  return (
    <article className={className} aria-live="polite" aria-atomic="true">
      <p className="fact-card__eyebrow">
        Atlas Dispatch
        <span className="fact-card__badge">{fact.badge}</span>
      </p>
      <h3 className="fact-card__headline">{fact.headline}</h3>
      <p className="fact-card__body">{fact.body}</p>
      <button type="button" className="fact-card__cta" onClick={handleCta}>
        → Add to my trip
      </button>
    </article>
  );
}
