import { useState } from 'react';
import { Check } from 'lucide-react';
import CountryFlag from '../CountryFlag';
import { QUICK_PASSPORTS, searchPassports } from '../../data/passportData';

const MAX_PASSPORTS = 3;

/**
 * @param {{ selected: string[], onChange: (isos: string[]) => void, onLimitHit: () => void }} props
 */
export default function PassportSelector({ selected, onChange, onLimitHit }) {
  const [search, setSearch] = useState('');
  const [shake, setShake] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  const results = searchPassports(search, selected);

  const toggle = (iso) => {
    if (selected.includes(iso)) {
      onChange(selected.filter((p) => p !== iso));
      setShowLimit(false);
      return;
    }
    if (selected.length >= MAX_PASSPORTS) {
      setShake(true);
      setShowLimit(true);
      onLimitHit();
      window.setTimeout(() => setShake(false), 400);
      return;
    }
    onChange([...selected, iso]);
    setSearch('');
    setShowLimit(false);
  };

  const addFromSearch = (iso) => {
    toggle(iso);
  };

  return (
    <div className={`dest-passport-selector ${shake ? 'dest-passport-selector--shake' : ''}`}>
      <div className="dest-passport-selector__chips">
        {QUICK_PASSPORTS.map((p) => {
          const isSelected = selected.includes(p.iso);
          return (
            <button
              key={p.iso}
              type="button"
              className={`dest-passport-chip ${isSelected ? 'dest-passport-chip--selected' : ''} ${shake && !isSelected ? 'dest-passport-chip--shake' : ''}`}
              onClick={() => toggle(p.iso)}
              aria-pressed={isSelected}
            >
              <CountryFlag iso={p.iso} className="country-flag--chip" />
              <span>{p.label}</span>
              {isSelected && <Check size={12} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="dest-passport-selector__search-wrap">
        <input
          type="text"
          className="dest-passport-selector__search"
          placeholder="Add another passport..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search passports"
        />
        {results.length > 0 && (
          <div className="dest-passport-selector__dropdown" role="listbox">
            {results.map((p) => (
              <button
                key={p.iso}
                type="button"
                className="dest-passport-selector__dropdown-item"
                onClick={() => addFromSearch(p.iso)}
                role="option"
              >
                <CountryFlag iso={p.iso} className="country-flag--chip" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {showLimit && (
        <p className="dest-passport-selector__tooltip" role="status">
          Max 3 passports
        </p>
      )}
    </div>
  );
}
