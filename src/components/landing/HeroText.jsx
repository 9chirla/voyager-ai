import { useNavigate } from 'react-router-dom';
import { useTravelScope } from '../../context/TravelScopeContext';

const COPY = {
  uk: {
    headline: ['Your next break', 'shouldn\'t take', 'a week to plan.'],
    subhead: 'Weekends in Britain, school-holiday road trips, or a long staycation — tell us what you want and get a day-by-day plan with trains, stays, and things worth booking early.',
    explore: 'Explore Britain',
  },
  international: {
    headline: ['Your next trip', 'shouldn\'t take', 'a week to plan.'],
    subhead: 'Tell us where you\'re going and what you care about. You\'ll get a day-by-day plan, a packing list, and a few things worth booking early. About a minute, start to finish.',
    explore: 'See where you can go',
  },
};

/**
 * Hero headline, subhead, and primary CTA overlay.
 * @param {{ scrollProgress?: number }} props
 */
export default function HeroText({ scrollProgress = 0 }) {
  const navigate = useNavigate();
  const { scope } = useTravelScope();
  const copy = COPY[scope];
  const fade = 1 - Math.min(1, scrollProgress * 1.4);

  const scrollToVisaExplorer = () => {
    const section = document.getElementById('section-03');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    section?.classList.add('is-visible');
  };

  return (
    <div
      className="landing-hero-text pointer-events-none relative z-10"
      style={{
        opacity: fade,
        transform: `translateY(${scrollProgress * -40}px)`,
        transition: 'opacity 0.1s linear, transform 0.1s linear',
      }}
    >
      <div className="landing-hero-copy pointer-events-none">
        <h1 className="hero-headline">
          {copy.headline[0]}
          <br />
          {copy.headline[1]}
          <br />
          {copy.headline[2]}
        </h1>
        <p className="hero-subhead">{copy.subhead}</p>
        <div className="hero-cta-group hero-cta pointer-events-auto">
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="hero-cta-btn"
          >
            Start planning
          </button>
          <button
            type="button"
            onClick={scrollToVisaExplorer}
            className="hero-cta-secondary"
          >
            {copy.explore}
          </button>
        </div>
      </div>
    </div>
  );
}
