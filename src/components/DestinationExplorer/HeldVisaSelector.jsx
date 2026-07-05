import { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import CountryFlag from '../CountryFlag';
import { HELD_VISA_OPTIONS } from '../../data/heldVisaData';

const MAX_HELD_VISAS = 3;

/**
 * @param {{
 *   selected: string[],
 *   onChange: (ids: string[]) => void,
 *   onLimitHit?: () => void,
 *   enabled: boolean,
 *   onEnabledChange: (enabled: boolean) => void,
 * }} props
 */
export default function HeldVisaSelector({
  selected,
  onChange,
  onLimitHit,
  enabled,
  onEnabledChange,
}) {
  const [shake, setShake] = useState(false);
  const [showLimit, setShowLimit] = useState(false);

  const toggleVisa = (id) => {
    if (!enabled) onEnabledChange(true);

    if (selected.includes(id)) {
      onChange(selected.filter((v) => v !== id));
      setShowLimit(false);
      return;
    }
    if (selected.length >= MAX_HELD_VISAS) {
      setShake(true);
      setShowLimit(true);
      onLimitHit?.();
      window.setTimeout(() => setShake(false), 400);
      return;
    }
    onChange([...selected, id]);
    setShowLimit(false);
  };

  const handleToggleSection = () => {
    const next = !enabled;
    onEnabledChange(next);
    if (!next) {
      onChange([]);
      setShowLimit(false);
    }
  };

  return (
    <div className="dest-held-visa-selector">
      <button
        type="button"
        className="dest-held-visa-selector__toggle"
        onClick={handleToggleSection}
        aria-expanded={enabled}
      >
        <span>I also hold a visa or residence permit</span>
        {enabled ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {enabled && (
        <>
          <p className="dest-held-visa-selector__hint">
            Add valid visas you already have — access is calculated from your
            passports <em>and</em> these permits together.
          </p>
          <div className="dest-held-visa-selector__chips">
            {HELD_VISA_OPTIONS.map((visa) => {
              const isSelected = selected.includes(visa.id);
              return (
                <button
                  key={visa.id}
                  type="button"
                  className={`dest-passport-chip dest-held-visa-chip ${isSelected ? 'dest-passport-chip--selected' : ''} ${shake && !isSelected ? 'dest-passport-chip--shake' : ''}`}
                  onClick={() => toggleVisa(visa.id)}
                  aria-pressed={isSelected}
                  title={visa.hint}
                >
                  <CountryFlag iso={visa.flagIso} className="country-flag--chip" />
                  <span>{visa.label}</span>
                  {isSelected && <Check size={12} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          {showLimit && (
            <p className="dest-passport-selector__tooltip" role="status">
              Max 3 held visas
            </p>
          )}
        </>
      )}
    </div>
  );
}
