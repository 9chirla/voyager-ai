import { useTravelScope } from '../../context/TravelScopeContext';

/**
 * One-click UK vs worldwide scope switch — drives globe zoom and landing content.
 */
export default function ScopeToggle() {
  const { scope, setScope } = useTravelScope();

  return (
    <div
      className="scope-toggle pointer-events-auto"
      role="group"
      aria-label="Travel scope"
    >
      <button
        type="button"
        className={`scope-toggle__btn ${scope === 'uk' ? 'scope-toggle__btn--active' : ''}`}
        aria-pressed={scope === 'uk'}
        onClick={() => setScope('uk')}
      >
        In the UK
      </button>
      <button
        type="button"
        className={`scope-toggle__btn ${scope === 'international' ? 'scope-toggle__btn--active' : ''}`}
        aria-pressed={scope === 'international'}
        onClick={() => setScope('international')}
      >
        Worldwide
      </button>
    </div>
  );
}
