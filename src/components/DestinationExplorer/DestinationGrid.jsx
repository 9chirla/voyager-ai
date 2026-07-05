import { useEffect, useMemo, useRef, useState } from 'react';
import { useUkHomeCity } from '../../context/UkHomeCityContext';
import { useLiveEvents } from '../../hooks/useLiveEvents';
import {
  getUkModeJourneyMinutes,
  getUkTravelFromHome,
  isUkDestinationReachableByMode,
} from '../../hooks/useUkTravel';
import { getVisaStatus } from '../../hooks/useVisaStatus';
import destinations from '../../data/destinations';
import ukDomesticDestinations from '../../data/ukDomesticDestinations';
import DestinationCard from './DestinationCard';

const REGIONS = [
  { id: 'all', label: 'All' },
  { id: 'europe', label: 'Europe' },
  { id: 'asia', label: 'Asia' },
  { id: 'americas', label: 'Americas' },
  { id: 'africa', label: 'Africa' },
  { id: 'oceania', label: 'Oceania' },
];

const UK_REGIONS = [
  { id: 'all', label: 'All' },
  { id: 'england', label: 'England' },
  { id: 'scotland', label: 'Scotland' },
  { id: 'wales', label: 'Wales' },
  { id: 'northern-ireland', label: 'N. Ireland' },
];

const SORT_OPTIONS = [
  { id: 'visa', label: 'Best visa access' },
  { id: 'name', label: 'A–Z' },
];

const UK_SORT_OPTIONS = [
  { id: 'distance', label: 'Nearest first' },
  { id: 'name', label: 'A–Z' },
];

const VISA_FILTERS = [
  { id: 'all', label: 'All access' },
  { id: 'visa-free', label: 'Visa-free' },
  { id: 'visa-on-arrival', label: 'VOA' },
  { id: 'e-visa', label: 'E-visa' },
  { id: 'visa-required', label: 'Visa required' },
];

const VISA_RANK = {
  'visa-free': 0,
  'visa-on-arrival': 1,
  'e-visa': 2,
  'visa-required': 3,
  unknown: 4,
};

/**
 * @param {{
 *   passports: string[],
 *   heldVisas?: string[],
 *   scope?: 'uk' | 'international',
 *   destinationList?: import('../../data/destinations.js').Destination[],
 * }} props
 */
export default function DestinationGrid({
  passports,
  heldVisas = [],
  scope = 'international',
  destinationList,
}) {
  const isUk = scope === 'uk';
  const { homeCityId, transportMode } = useUkHomeCity();
  const source = destinationList ?? destinations;
  const regionOptions = isUk ? UK_REGIONS : REGIONS;
  const sortOptions = isUk ? UK_SORT_OPTIONS : SORT_OPTIONS;

  const [region, setRegion] = useState('all');
  const [sort, setSort] = useState(isUk ? 'distance' : 'visa');
  const [visaFilter, setVisaFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [visibleCards, setVisibleCards] = useState(new Set());
  const gridRef = useRef(null);
  const { events } = useLiveEvents();

  const liveCountries = useMemo(() => {
    const names = events.map((e) => e.country?.toLowerCase() ?? '');
    return (destCountry) => names.some(
      (n) => n.includes(destCountry.toLowerCase())
        || destCountry.toLowerCase().includes(n.split(',')[0].trim()),
    );
  }, [events]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = source.filter((d) => {
      if (isUk) {
        if (region !== 'all' && d.ukNation !== region) return false;
        if (!isUkDestinationReachableByMode(homeCityId, d.id, transportMode)) {
          return false;
        }
      } else {
        const status = getVisaStatus(passports, d.iso, heldVisas);
        if (region !== 'all' && d.filterRegion !== region) return false;
        if (visaFilter !== 'all' && status !== visaFilter) return false;
      }
      if (q) {
        const haystack = [
          d.country,
          d.iso,
          d.region,
          d.tagline,
          isUk ? d.tripType : '',
          isUk ? d.gettingThere : '',
          isUk ? d.ukNation : '',
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (isUk && sort === 'distance') {
        const da = getUkModeJourneyMinutes(homeCityId, a.id, transportMode);
        const db = getUkModeJourneyMinutes(homeCityId, b.id, transportMode);
        if (da !== db) return da - db;
        const distA = getUkTravelFromHome(homeCityId, a.id)?.distanceMiles ?? 9999;
        const distB = getUkTravelFromHome(homeCityId, b.id)?.distanceMiles ?? 9999;
        return distA - distB;
      }
      if (!isUk && sort === 'visa') {
        return VISA_RANK[getVisaStatus(passports, a.iso, heldVisas)]
          - VISA_RANK[getVisaStatus(passports, b.iso, heldVisas)];
      }
      return a.country.localeCompare(b.country);
    });

    return list;
  }, [region, sort, visaFilter, search, passports, heldVisas, source, isUk, homeCityId, transportMode]);

  useEffect(() => {
    setExpandedId(null);
    setRegion('all');
    setSearch('');
    setVisaFilter('all');
    setSort(isUk ? 'distance' : 'visa');
  }, [scope, isUk]);

  useEffect(() => {
    setExpandedId(null);
  }, [region, visaFilter, search, passports, heldVisas, homeCityId, transportMode]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setVisibleCards(new Set(filtered.map((d) => d.id)));
      return undefined;
    }

    setVisibleCards(new Set());

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-dest-id');
            if (id) {
              setVisibleCards((prev) => new Set([...prev, id]));
            }
          }
        });
      },
      { threshold: 0.05, rootMargin: '80px 0px' },
    );

    const cells = gridRef.current?.querySelectorAll('[data-dest-id]');
    cells?.forEach((cell) => observer.observe(cell));

    return () => observer.disconnect();
  }, [filtered]);

  return (
    <>
      <div className="dest-grid-search">
        <input
          type="search"
          className="dest-grid-search__input"
          placeholder={isUk ? `Search ${source.length} UK destinations…` : `Search ${source.length} countries…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={isUk ? 'Search UK regions' : 'Search countries'}
        />
        <span className="dest-grid-search__count">
          {filtered.length}
          {' '}
          shown
          {isUk && (
            <>
              {' '}
              ·
              {' '}
              {ukDomesticDestinations.length}
              {' '}
              UK destinations
            </>
          )}
        </span>
      </div>

      <div className="dest-grid-controls">
        <div className="dest-grid-controls__group">
          <span className="dest-grid-controls__label">Region</span>
          {regionOptions.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`dest-filter-pill ${region === r.id ? 'dest-filter-pill--active' : ''}`}
              onClick={() => setRegion(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
        {!isUk && (
          <div className="dest-grid-controls__group">
            <span className="dest-grid-controls__label">Access</span>
            {VISA_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`dest-filter-pill ${visaFilter === f.id ? 'dest-filter-pill--active' : ''}`}
                onClick={() => setVisaFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
        <div className="dest-grid-controls__group">
          <span className="dest-grid-controls__label">Sort</span>
          {sortOptions.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`dest-sort-pill ${sort === s.id ? 'dest-sort-pill--active' : ''}`}
              onClick={() => setSort(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dest-grid" ref={gridRef}>
        {filtered.length === 0 ? (
          <p className="dest-grid__empty">
            {isUk
              ? 'No destinations match — try a different search or filter.'
              : 'No countries match — try a different passport, search, or filter.'}
          </p>
        ) : (
          filtered.map((dest, index) => (
            <div
              key={dest.id}
              className="dest-grid__cell"
              data-dest-id={dest.id}
            >
              <DestinationCard
                destination={dest}
                passports={passports}
                heldVisas={heldVisas}
                expanded={expandedId === dest.id}
                onToggle={() => setExpandedId((cur) => (cur === dest.id ? null : dest.id))}
                hasLiveEvents={liveCountries(dest.country)}
                visible={visibleCards.has(dest.id)}
                staggerMs={Math.min(index, 12) * 30}
                domestic={isUk}
                homeCityId={isUk ? homeCityId : undefined}
              />
            </div>
          ))
        )}
      </div>
    </>
  );
}
