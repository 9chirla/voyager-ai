import { useEffect, useRef } from 'react';
import CountryFlag from '../CountryFlag';
import { getPassportByIso } from '../../data/passportData';
import {
  countVisaFreeAccess,
  getHeldVisaBoostLabel,
  getStrongestPassport,
} from '../../hooks/useVisaStatus';
import destinations from '../../data/destinations';

/**
 * @param {{ passports: string[], heldVisas?: string[], pulseKey: number }} props
 */
export default function PassportStrengthMeter({ passports, heldVisas = [], pulseKey }) {
  const fillRef = useRef(null);
  const count = countVisaFreeAccess(passports, destinations, heldVisas);
  const total = destinations.length;
  const pct = (count / total) * 100;

  const ratio = count / total;
  const colourClass = ratio <= 0.25
    ? 'dest-strength-meter__fill--coral'
    : ratio <= 0.5
      ? 'dest-strength-meter__fill--amber'
      : 'dest-strength-meter__fill--teal';

  const strongest = getStrongestPassport(passports, destinations, heldVisas);
  const strongestPassport = strongest ? getPassportByIso(strongest.iso) : null;
  const visaBoost = getHeldVisaBoostLabel(passports, heldVisas, destinations);

  useEffect(() => {
    if (!fillRef.current || pulseKey === 0) return;
    fillRef.current.classList.add('dest-strength-meter__fill--pulse');
    const t = window.setTimeout(() => {
      fillRef.current?.classList.remove('dest-strength-meter__fill--pulse');
    }, 300);
    return () => window.clearTimeout(t);
  }, [pulseKey]);

  return (
    <div className="dest-strength-meter" aria-live="polite">
      <div className="dest-strength-meter__label">
        <span>Visa-free access</span>
        <span>
          {count}
          {' '}
          /
          {' '}
          {total}
          {' '}
          countries
        </span>
      </div>
      <div className="dest-strength-meter__track">
        <div
          ref={fillRef}
          className={`dest-strength-meter__fill ${colourClass}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={count}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
      {strongestPassport && (
        <p className="dest-strength-meter__strongest">
          Strongest passport in your selection:
          {' '}
          <CountryFlag iso={strongest.iso} className="country-flag--inline" />
          {' '}
          {strongestPassport.label}
        </p>
      )}
      {visaBoost && (
        <p className="dest-strength-meter__boost">{visaBoost}</p>
      )}
    </div>
  );
}
