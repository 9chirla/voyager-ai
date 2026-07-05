import {
  Binoculars, Bike, Building2, Castle, Coffee, Fish, Gem, Home, Landmark,
  Map, Mountain, Palette, Scissors, Ship, ShoppingBasket, Sun, Tent, Train,
  TreePine, Utensils, Waves, Wine, X,
} from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CountryFlag from '../CountryFlag';
import VisaDetailPanel from './VisaDetailPanel';
import UkNationBadge from './UkNationBadge';
import UkTravelPanel from './UkTravelPanel';
import { getVisaAccessVia, useVisaStatus, VISA_STATUS_META } from '../../hooks/useVisaStatus';
import { useWeather } from '../../hooks/useWeather';
import { getDestinationImage } from '../../data/destinationImages';
import { getUkDestinationImage } from '../../data/ukDomesticImages';
import { buildDestinationExplorerContext } from '../../utils/plannerContext';
import { sendToPlanner } from '../../utils/sendToPlanner';

/** @type {Record<string, React.ComponentType<{ size?: number, className?: string }>>} */
const ICON_MAP = {
  landmark: Landmark,
  basket: ShoppingBasket,
  bike: Bike,
  map: Map,
  utensils: Utensils,
  wine: Wine,
  mountain: Mountain,
  castle: Castle,
  droplets: Waves,
  sun: Sun,
  gem: Gem,
  waves: Waves,
  coffee: Coffee,
  ship: Ship,
  scissors: Scissors,
  fish: Fish,
  city: Building2,
  tree: TreePine,
  palette: Palette,
  tent: Tent,
  train: Train,
  binoculars: Binoculars,
  home: Home,
};

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

/**
 * @param {{
 *   destination: import('../../data/destinations.js').Destination,
 *   passports: string[],
 *   heldVisas?: string[],
 *   expanded: boolean,
 *   onToggle: () => void,
 *   hasLiveEvents?: boolean,
 *   visible?: boolean,
 *   staggerMs?: number,
 *   domestic?: boolean,
 *   homeCityId?: string,
 * }} props
 */
export default function DestinationCard({
  destination,
  passports,
  heldVisas = [],
  expanded,
  onToggle,
  hasLiveEvents = false,
  visible = true,
  staggerMs = 0,
  domestic = false,
  homeCityId,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const visaStatus = useVisaStatus(passports, destination.iso, heldVisas);
  const visaMeta = VISA_STATUS_META[visaStatus];
  const accessVia = getVisaAccessVia(passports, heldVisas, destination.iso);
  const visaTooltip = [visaMeta.description, accessVia].filter(Boolean).join(' · ');
  const weather = useWeather(destination.coords.lat, destination.coords.lng, expanded);
  const heroImage = domestic
    ? getUkDestinationImage(destination.id, destination.country)
    : getDestinationImage(destination.iso);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = heroImage && !imageFailed;
  const ukDest = domestic ? /** @type {import('../../data/ukDomesticDestinations.js').default[number]} */ (destination) : null;

  const handlePlan = (e) => {
    e.stopPropagation();
    const context = buildDestinationExplorerContext(destination);
    sendToPlanner(context, { pathname, isCollecting: false, navigate });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <article
      className={`dest-card ${expanded ? 'dest-card--expanded' : ''} ${visible ? 'is-visible' : ''}`}
      style={{ transitionDelay: visible ? `${staggerMs}ms` : '0ms' }}
      onClick={expanded ? undefined : onToggle}
      onKeyDown={expanded ? undefined : handleKeyDown}
      role="button"
      tabIndex={expanded ? -1 : 0}
      aria-expanded={expanded}
    >
      <div
        className="dest-card__media"
        style={{ backgroundColor: `hsl(${destination.heroHue})` }}
      >
        {showImage && (
          <img
            src={heroImage.url}
            alt=""
            className="dest-card__image"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        )}
        <div className="dest-card__scrim" aria-hidden="true" />
        <div className="dest-card__content">
        <div className="dest-card__top-row">
          {domestic ? (
            <UkNationBadge nation={ukDest?.ukNation} className="uk-nation-badge--card" />
          ) : (
            <CountryFlag iso={destination.iso} className="country-flag--card" />
          )}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
            {expanded && (
              <button
                type="button"
                className="dest-card__close"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                aria-label="Collapse card"
              >
                <X size={14} />
              </button>
            )}
            {domestic ? (
              <span className="dest-uk-trip-pill" title="Type of UK break">
                {ukDest?.tripType}
              </span>
            ) : (
              <span
                className={`dest-visa-pill ${visaMeta.className}`}
                title={visaTooltip}
              >
                {visaMeta.label}
                {accessVia && (
                  <span className="dest-visa-pill__via"> · {accessVia}</span>
                )}
              </span>
            )}
          </div>
        </div>

        {!expanded && (
          <div className="dest-card__bottom">
            <h3 className="dest-card__country">{destination.country}</h3>
            {domestic ? (
              <>
                <p className="dest-card__tagline">{destination.tagline}</p>
                {homeCityId && (
                  <UkTravelPanel
                    homeCityId={homeCityId}
                    destinationId={destination.id}
                    compact
                  />
                )}
              </>
            ) : (
              <p className="dest-card__region">{destination.region}</p>
            )}
            {!domestic && (
              <span className="dest-card__duration">
                {destination.duration.label}
                {hasLiveEvents && (
                  <span className="dest-card__live-badge">Live events</span>
                )}
              </span>
            )}
            {domestic && hasLiveEvents && (
              <span className="dest-card__duration">
                <span className="dest-card__live-badge">Live events</span>
              </span>
            )}
          </div>
        )}

        {expanded && (
          <div className="dest-card__expanded-body" onClick={(e) => e.stopPropagation()}>
            <h3 className="dest-card__country">{destination.country}</h3>
            <p className="dest-card__region">{destination.tagline}</p>

            {!domestic && (
              <VisaDetailPanel
                destinationIso={destination.iso}
                passports={passports}
                heldVisas={heldVisas}
              />
            )}

            {domestic && homeCityId && (
              <UkTravelPanel
                homeCityId={homeCityId}
                destinationId={destination.id}
              />
            )}

            {domestic && ukDest && (
              <div className="dest-uk-detail dest-uk-detail--stay-only">
                <p className="dest-uk-detail__row dest-uk-detail__stay">
                  <Home size={14} aria-hidden="true" />
                  <span>
                    Stay:
                    {' '}
                    {ukDest.stayIdea}
                  </span>
                </p>
              </div>
            )}

            {destination.curated && destination.attractions.length > 0 && destination.attractions.map((attr) => {
              const Icon = ICON_MAP[attr.icon] ?? Map;
              return (
                <div key={attr.name} className="dest-card__attraction">
                  <Icon className="dest-card__attraction-icon" size={16} />
                  <div>
                    <p className="dest-card__attraction-name">{attr.name}</p>
                    <p className="dest-card__attraction-detail">{attr.detail}</p>
                  </div>
                </div>
              );
            })}

            {destination.curated && (
              <>
                <div className="dest-card__spark-row" aria-label="Best months">
                  {MONTH_LABELS.map((label, i) => (
                    <span
                      key={label + String(i)}
                      className={`dest-card__spark-dot ${destination.bestMonths.includes(i + 1) ? 'dest-card__spark-dot--active' : ''}`}
                      title={label}
                    />
                  ))}
                </div>

                {weather?.monthly && (
                  <p className="dest-card__weather-tip">
                    Avg
                    {' '}
                    {Math.round(
                      weather.monthly
                        .filter((m) => destination.bestMonths.includes(m.month))
                        .reduce((s, m) => s + m.tempC, 0)
                        / destination.bestMonths.length,
                    )}
                    °C in peak months
                  </p>
                )}

                {!domestic && (
                  <p className="dest-card__flight">
                    {`~${destination.flightHours.min}–${destination.flightHours.max}h from London`}
                  </p>
                )}
              </>
            )}

            <button type="button" className="dest-card__cta" onClick={handlePlan}>
              → Plan this trip
            </button>
          </div>
        )}
        </div>
      </div>
    </article>
  );
}
