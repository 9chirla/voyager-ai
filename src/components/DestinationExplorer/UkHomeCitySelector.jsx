import { Bike, Bus, Car, Footprints, MapPin, Train } from 'lucide-react';
import { UK_HOME_CITIES } from '../../data/ukHomeCities';
import { UK_TRANSPORT_MODES } from '../../data/ukTransportModes';
import { useUkHomeCity } from '../../context/UkHomeCityContext';

/** @type {Record<string, React.ComponentType<{ size?: number }>>} */
const MODE_ICONS = {
  train: Train,
  car: Car,
  coach: Bus,
  bicycle: Bike,
  walk: Footprints,
};

/**
 * Pick home city and preferred transport for UK travel suggestions.
 */
export default function UkHomeCitySelector() {
  const {
    homeCityId,
    setHomeCityId,
    transportMode,
    setTransportMode,
    transportModeMeta,
    homeCity,
  } = useUkHomeCity();

  return (
    <div className="dest-uk-home">
      <div className="dest-uk-home__header">
        <MapPin size={14} aria-hidden="true" />
        <span className="dest-uk-home__label">Travelling from</span>
      </div>
      <div className="dest-uk-home__chips" role="group" aria-label="Home city">
        {UK_HOME_CITIES.map((city) => (
          <button
            key={city.id}
            type="button"
            className={`dest-uk-home-chip ${homeCityId === city.id ? 'dest-uk-home-chip--active' : ''}`}
            onClick={() => setHomeCityId(city.id)}
            aria-pressed={homeCityId === city.id}
          >
            {city.label}
          </button>
        ))}
      </div>

      <div className="dest-uk-home__header dest-uk-home__header--mode">
        <Train size={14} aria-hidden="true" />
        <span className="dest-uk-home__label">Preferred transport</span>
      </div>
      <div className="dest-uk-home__chips" role="group" aria-label="Preferred transport mode">
        {UK_TRANSPORT_MODES.map((mode) => {
          const Icon = MODE_ICONS[mode.id] ?? Train;
          return (
            <button
              key={mode.id}
              type="button"
              className={`dest-uk-home-chip dest-uk-home-chip--mode ${transportMode === mode.id ? 'dest-uk-home-chip--active' : ''}`}
              onClick={() => setTransportMode(mode.id)}
              aria-pressed={transportMode === mode.id}
            >
              <Icon size={12} aria-hidden="true" />
              {mode.shortLabel}
            </button>
          );
        })}
      </div>

      <p className="dest-uk-home__hint">
        {transportModeMeta.label}
        {' '}
        suggestions from
        {' '}
        {homeCity.label}
        .
        {' '}
        Open your home city for local
        {' '}
        {transportModeMeta.label.toLowerCase()}
        {' '}
        ideas.
        {' '}
        Fares shown where relevant · Jun 2026 typical.
      </p>
    </div>
  );
}
