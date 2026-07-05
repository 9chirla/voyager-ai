import { Bus, Car, Footprints, Bike, Plane, Ship, Train } from 'lucide-react';
import {
  formatUkTravelDuration,
  getUkTravelForMode,
} from '../../hooks/useUkTravel';
import { useUkHomeCity } from '../../context/UkHomeCityContext';

/** @type {Record<string, React.ComponentType<{ size?: number }>>} */
const MODE_ICONS = {
  local: Train,
  train: Train,
  coach: Bus,
  flight: Plane,
  ferry: Ship,
  mixed: Train,
  drive: Car,
  bicycle: Bike,
  walk: Footprints,
};

/**
 * @param {{ ideas: string[], routes?: string[], hire?: string, headline: string }} tips
 * @param {{ compact?: boolean, arrival?: boolean }} opts
 */
function LocalTipsBlock({ tips, compact = false, arrival = false }) {
  if (!tips) return null;

  return (
    <div className={`dest-uk-local-tips ${compact ? 'dest-uk-local-tips--compact' : ''}`}>
      <p className="dest-uk-local-tips__title">
        {arrival ? 'When you arrive' : tips.headline}
      </p>
      {tips.hire && (
        <p className="dest-uk-local-tips__hire">{tips.hire}</p>
      )}
      <ul className="dest-uk-local-tips__list">
        {tips.ideas.map((idea) => (
          <li key={idea}>{idea}</li>
        ))}
      </ul>
      {tips.routes && tips.routes.length > 0 && (
        <p className="dest-uk-local-tips__routes">
          Routes:
          {' '}
          {tips.routes.join(' · ')}
        </p>
      )}
    </div>
  );
}

/**
 * @param {{ homeCityId: string, destinationId: string, compact?: boolean, transportMode?: string }} props
 */
export default function UkTravelPanel({
  homeCityId,
  destinationId,
  compact = false,
  transportMode: transportModeProp,
}) {
  const { transportMode: contextMode } = useUkHomeCity();
  const transportMode = transportModeProp ?? contextMode;
  const travel = getUkTravelForMode(homeCityId, destinationId, transportMode);
  if (!travel) return null;

  const ModeIcon = MODE_ICONS[travel.mode] ?? Train;
  const isLocal = homeCityId === destinationId;
  const ptLabel = travel.publicTransport ? 'Yes' : 'No';
  const showJourney = travel.journeyMinutes > 0
    || (travel.preferredMode === 'car' && travel.driveMinutes > 0);
  const journeyMins = travel.journeyMinutes > 0
    ? travel.journeyMinutes
    : travel.driveMinutes;

  if (compact) {
    return (
      <div className="dest-uk-travel-panel dest-uk-travel-panel--compact">
        <p className="dest-uk-travel-panel__summary">
          <ModeIcon size={12} aria-hidden="true" />
          <span>{travel.summary}</span>
        </p>
        <p className="dest-uk-travel-panel__meta">
          {travel.distanceMiles > 0 && (
            <span>
              {travel.distanceMiles}
              {' '}
              mi
            </span>
          )}
          {isLocal && (
            <span>Local</span>
          )}
          {!isLocal && travel.preferredMode !== 'car' && travel.preferredMode !== 'bicycle' && (
            <span>
              Public transport:
              {' '}
              {ptLabel}
            </span>
          )}
        </p>
        {travel.localTips && (
          <LocalTipsBlock tips={travel.localTips} compact />
        )}
      </div>
    );
  }

  return (
    <div className="dest-uk-travel-panel">
      <div className="dest-uk-travel-panel__grid">
        <div className="dest-uk-travel-panel__stat">
          <span className="dest-uk-travel-panel__stat-label">Distance</span>
          <span className="dest-uk-travel-panel__stat-value">
            {travel.distanceMiles > 0 ? `${travel.distanceMiles} mi` : 'Local'}
          </span>
        </div>
        {!isLocal && travel.preferredMode !== 'bicycle' && travel.preferredMode !== 'walk' && (
          <div className="dest-uk-travel-panel__stat">
            <span className="dest-uk-travel-panel__stat-label">Public transport</span>
            <span className={`dest-uk-travel-panel__stat-value dest-uk-travel-panel__stat-value--${travel.publicTransport ? 'yes' : 'no'}`}>
              {ptLabel}
            </span>
          </div>
        )}
        {showJourney && (
          <div className="dest-uk-travel-panel__stat">
            <span className="dest-uk-travel-panel__stat-label">
              {travel.preferredMode === 'car' ? 'Drive time' : 'Journey time'}
            </span>
            <span className="dest-uk-travel-panel__stat-value">
              {formatUkTravelDuration(journeyMins)}
            </span>
          </div>
        )}
        {travel.priceFromGbp > 0 && (
          <div className="dest-uk-travel-panel__stat">
            <span className="dest-uk-travel-panel__stat-label">From</span>
            <span className="dest-uk-travel-panel__stat-value">
              £
              {travel.priceFromGbp}
            </span>
          </div>
        )}
      </div>
      <p className="dest-uk-travel-panel__route">
        <ModeIcon size={14} aria-hidden="true" />
        <span>{travel.detail}</span>
      </p>
      {travel.suggestions && travel.suggestions.length > 0 && (
        <ul className="dest-uk-travel-panel__suggestions">
          {travel.suggestions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      <p className="dest-uk-travel-panel__note">{travel.priceNote}</p>
      <LocalTipsBlock tips={travel.localTips} />
      <LocalTipsBlock tips={travel.destinationTips} arrival />
    </div>
  );
}
