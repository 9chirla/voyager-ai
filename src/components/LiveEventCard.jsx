import { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatEventDateChip, useLiveEvents } from '../hooks/useLiveEvents';
import { buildLiveEventContext } from '../utils/plannerContext';
import { sendToPlanner } from '../utils/sendToPlanner';
import './LiveEventCard.css';

const ROTATE_MS = 20000;
const FADE_MS = 350;

/**
 * @param {{ variant?: 'landing' | 'sidebar', onCtaClick?: (cityName: string) => void, isCollecting?: boolean, pauseRotation?: boolean, dimmed?: boolean, countryFilter?: 'uk' }} props
 */
export default function LiveEventCard({
  variant = 'landing',
  onCtaClick,
  isCollecting = false,
  pauseRotation = false,
  dimmed = false,
  countryFilter,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { events: allEvents, loading } = useLiveEvents();
  const events = countryFilter === 'uk'
    ? allEvents.filter((e) => {
      const c = (e.country ?? '').toLowerCase();
      return c.includes('united kingdom') || c.includes('great britain') || c === 'gb';
    })
    : allEvents;
  const currentIndexRef = useRef(0);
  const [renderTick, setRenderTick] = useState(0);
  const [contentVisible, setContentVisible] = useState(true);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const rotate = useCallback(() => {
    if (!events.length || prefersReducedMotion.current || pauseRotation) return;

    setContentVisible(false);
    window.setTimeout(() => {
      currentIndexRef.current = (currentIndexRef.current + 1) % events.length;
      setRenderTick((n) => n + 1);
      setContentVisible(true);
    }, FADE_MS);
  }, [events.length, pauseRotation]);

  useEffect(() => {
    if (!events.length || prefersReducedMotion.current || pauseRotation) return undefined;

    const id = window.setInterval(rotate, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [events.length, pauseRotation, rotate]);

  if (loading) {
    return (
      <div
        className={`live-event-card-skeleton live-event-card-skeleton--${variant}`}
        aria-hidden="true"
      >
        <div className="live-event-card-skeleton__row">
          <div className="live-event-card-skeleton__block live-event-card-skeleton__block--eyebrow" />
          <div className="live-event-card-skeleton__block live-event-card-skeleton__block--chip" />
        </div>
        <div className="live-event-card-skeleton__block live-event-card-skeleton__block--title" />
        <div className="live-event-card-skeleton__block live-event-card-skeleton__block--title-short" />
        <div className="live-event-card-skeleton__block live-event-card-skeleton__block--location" />
        <div className="live-event-card-skeleton__block live-event-card-skeleton__block--image" />
      </div>
    );
  }

  if (!events.length) return null;

  const event = events[currentIndexRef.current % events.length];
  void renderTick;

  const handleCta = () => {
    const context = buildLiveEventContext(event, formatEventDateChip);

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

  const className = [
    'live-event-card',
    `live-event-card--${variant}`,
    dimmed ? 'live-event-card--dimmed' : '',
    contentVisible ? '' : 'live-event-card--hidden-content',
  ].filter(Boolean).join(' ');

  return (
    <article className={className} aria-live="polite" aria-atomic="true">
      <div className="live-event-card__eyebrow">
        <p className="live-event-card__label">{countryFilter === 'uk' ? 'UK Event' : 'Live Event'}</p>
        <span className="live-event-card__date-chip">
          {formatEventDateChip(event.localDate)}
        </span>
      </div>

      <h3 className="live-event-card__name">{event.name}</h3>

      <p className="live-event-card__location">
        <MapPin className="live-event-card__pin" aria-hidden="true" />
        <span>
          {event.city}
          ,
          {' '}
          {event.country}
        </span>
      </p>

      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt=""
          className="live-event-card__image"
          loading="lazy"
        />
      )}

      <button type="button" className="live-event-card__cta" onClick={handleCta}>
        → Plan this trip
      </button>
    </article>
  );
}
