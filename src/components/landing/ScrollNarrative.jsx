import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
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
  {
    num: '03',
    headline: 'Change what you want.',
    body: 'Download it, edit the days, swap things around. It\'s your trip. Take the plan and use it however you like.',
  },
];

/**
 * Scroll-driven feature narrative below the hero canvas.
 */
export default function ScrollNarrative() {
  const navigate = useNavigate();
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.2 },
    );

    sectionRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative z-30 bg-void" aria-label="Features">
      <div className="max-w-[860px] mx-auto px-6">
        {SECTIONS.map((section, index) => (
          <article
            key={section.num}
            ref={(el) => {
              sectionRefs.current[index] = el;
            }}
            className="landing-scroll-section min-h-[80vh] flex flex-col justify-center py-16"
          >
            <p className="landing-section-num mb-4">{section.num}</p>
            <h2 className="landing-section-head mb-5">{section.headline}</h2>
            <p className="landing-section-body max-w-xl">{section.body}</p>
          </article>
        ))}

        <div className="landing-scroll-section pb-24 pt-8 flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="cta-primary"
          >
            Start planning
          </button>
        </div>
      </div>
    </section>
  );
}
