import { VISA_STATUS_META } from '../../hooks/useVisaStatus';

const ORDER = ['visa-free', 'visa-on-arrival', 'e-visa', 'visa-required'];

export default function VisaStatusLegend() {
  return (
    <div className="dest-visa-legend" aria-label="Visa status legend">
      {ORDER.map((key) => {
        const meta = VISA_STATUS_META[key];
        return (
          <span key={key} className="dest-visa-legend__item" title={meta.description}>
            <span className={`dest-visa-pill dest-visa-pill--compact ${meta.className}`}>
              {meta.label}
            </span>
            <span className="dest-visa-legend__hint">{meta.short}</span>
          </span>
        );
      })}
    </div>
  );
}
