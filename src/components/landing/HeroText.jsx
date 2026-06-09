import { useNavigate } from 'react-router-dom';

/**
 * Hero headline, subhead, and primary CTA overlay.
 * @param {{ scrollProgress?: number }} props
 */
export default function HeroText({ scrollProgress = 0 }) {
  const navigate = useNavigate();
  const fade = 1 - Math.min(1, scrollProgress * 1.4);

  return (
    <div
      className="landing-hero-text pointer-events-none absolute inset-0 z-10 flex"
      style={{
        opacity: fade,
        transform: `translateY(${scrollProgress * -40}px)`,
        transition: 'opacity 0.1s linear, transform 0.1s linear',
      }}
    >
      <div className="landing-hero-copy pointer-events-none">
        <h1 className="hero-headline">
          Your next trip
          <br />
          shouldn&apos;t take
          <br />
          a week to plan.
        </h1>
        <p className="hero-subhead">
          Tell us where you&apos;re going and what you care about. You&apos;ll get
          a day-by-day plan, a packing list, and a few things worth booking early.
          About a minute, start to finish.
        </p>
        <button
          type="button"
          onClick={() => navigate('/app')}
          className="hero-cta hero-cta-btn pointer-events-auto"
        >
          Start planning
        </button>
      </div>
    </div>
  );
}
