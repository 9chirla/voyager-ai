import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import CollectionSectionCard from './CollectionSectionCard';
import ChoiceChip from './ChoiceChip';
import DatePickerBubble, { parseIso, toIsoDate } from './DatePickerBubble';
import StepperInput from './StepperInput';
import TravelStyleCard from './TravelStyleCard';
import { COLLECTION_SECTIONS } from '../utils/collectionValidation';
import { SURPRISE_CHIP } from '../hooks/useTripCollection';

const DESTINATION_CHIPS = [
  'Bali, Indonesia', 'Tokyo, Japan', 'Marrakech, Morocco',
  'Amalfi Coast, Italy', 'New York, USA', 'Barcelona, Spain', SURPRISE_CHIP,
];

const DEPARTURE_CHIPS = [
  'London Heathrow (LHR)', 'London Gatwick (LGW)', 'London Stansted (STN)',
  'Manchester (MAN)', 'Birmingham (BHX)', 'Edinburgh (EDI)',
];

const DIETARY_CHIPS = [
  'None', 'Vegetarian', 'Vegan', 'Halal', 'Gluten-free', 'Nut allergy', 'Mobility considerations',
];

/** @param {string} iso */
function dayAfter(iso) {
  const d = parseIso(iso);
  d.setDate(d.getDate() + 1);
  return toIsoDate(d);
}

/**
 * Card-based trip collection — every section stays editable.
 */
export default function TripCollectionWizard({
  tripData,
  draft,
  sectionSummaries,
  collectionError,
  isLoading,
  prefillDestination,
  onPatchTrip,
  onToggleDietary,
  onToggleTravelStyle,
  onUpdateTravelStyleText,
  onSubmit,
  onSectionFocus,
  focusSectionId,
  validationErrors = {},
}) {
  const [expanded, setExpanded] = useState(() => new Set([1]));
  const [destinationInput, setDestinationInput] = useState(tripData.destination ?? '');
  const [datesPhase, setDatesPhase] = useState(() => {
    if (!tripData.departureDate) return 'departure';
    if (!tripData.returnDate) return 'return';
    return 'flexibility';
  });
  const returnDateRef = useRef(null);

  useEffect(() => {
    if (focusSectionId) {
      setExpanded((prev) => new Set([...prev, focusSectionId]));
    }
  }, [focusSectionId]);

  useEffect(() => {
    if (prefillDestination) {
      setDestinationInput(prefillDestination);
      onPatchTrip({ destination: prefillDestination });
      setExpanded(new Set([1]));
    }
  }, [prefillDestination, onPatchTrip]);

  useEffect(() => {
    if (tripData.destination && !destinationInput) {
      setDestinationInput(tripData.destination);
    }
  }, [tripData.destination, destinationInput]);

  const completedCount = useMemo(
    () => COLLECTION_SECTIONS.filter((s) => sectionSummaries[s.id]).length,
    [sectionSummaries],
  );

  const toggleSection = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    onSectionFocus?.(id);
  };

  const expandSection = (id) => {
    setExpanded((prev) => new Set([...prev, id]));
    onSectionFocus?.(id);
    requestAnimationFrame(() => {
      document.getElementById(`collection-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  useEffect(() => {
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      const first = Number(Object.keys(validationErrors).sort()[0]);
      if (first) expandSection(first);
    }
  }, [validationErrors]);

  const applyDestination = (value) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) return;
    onPatchTrip({ destination: trimmed === SURPRISE_CHIP ? 'Surprise me' : trimmed });
    setDestinationInput(trimmed === SURPRISE_CHIP ? 'Surprise me' : trimmed);
  };

  const handleDepartureSelect = (iso) => {
    const updates = { departureDate: iso };
    if (tripData.returnDate && tripData.returnDate <= iso) {
      updates.returnDate = null;
    }
    onPatchTrip(updates);
    setDatesPhase('return');
    setExpanded((prev) => new Set([...prev, 2]));
    requestAnimationFrame(() => {
      returnDateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const handleReturnSelect = (iso) => {
    onPatchTrip({ returnDate: iso });
    setDatesPhase('flexibility');
  };

  const minReturnDate = tripData.departureDate ? dayAfter(tripData.departureDate) : undefined;

  return (
    <div
      className="flex flex-col h-full"
      data-testid="collection-wizard"
    >
      <div className="px-4 pt-4 pb-2 border-b border-white/5 bg-navy-light/20">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold text-cream">Plan your trip</h2>
            <p className="text-xs text-cream/50 mt-0.5">
              Pick options in each card — tap any section anytime to change your answers.
            </p>
          </div>
        </div>
        <p className="text-[10px] text-cream/40 mt-2">
          {completedCount}
          {' '}
          of
          {' '}
          {COLLECTION_SECTIONS.length}
          {' '}
          sections filled
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <CollectionSectionCard
          sectionId={1}
          title="Destination"
          summary={sectionSummaries[1]}
          isComplete={Boolean(sectionSummaries[1])}
          isExpanded={expanded.has(1)}
          onToggle={() => toggleSection(1)}
          hasError={Boolean(validationErrors[1])}
        >
          <p className="text-xs text-cream/60">Where would you like to go?</p>
          <div className="flex flex-wrap gap-2">
            {DESTINATION_CHIPS.map((chip) => (
              <ChoiceChip
                key={chip}
                label={chip}
                active={tripData.destination === chip || (chip === SURPRISE_CHIP && tripData.destination === 'Surprise me')}
                onClick={() => applyDestination(chip)}
              />
            ))}
          </div>
          <input
            type="text"
            data-testid="destination-input"
            value={destinationInput}
            onChange={(e) => setDestinationInput(e.target.value)}
            onBlur={() => destinationInput.trim().length >= 2 && applyDestination(destinationInput)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyDestination(destinationInput);
              }
            }}
            placeholder="Or type any destination…"
            className="w-full rounded-lg bg-navy border border-white/10 px-3 py-2.5 text-sm text-cream
                       placeholder:text-cream/30 focus:outline-none focus:ring-2 focus:ring-amber/30"
          />
          {validationErrors[1] && <p className="text-xs text-red-400">{validationErrors[1]}</p>}
        </CollectionSectionCard>

        <CollectionSectionCard
          sectionId={2}
          title="Dates"
          summary={sectionSummaries[2]}
          isComplete={Boolean(sectionSummaries[2])}
          isExpanded={expanded.has(2)}
          onToggle={() => toggleSection(2)}
          hasError={Boolean(validationErrors[2])}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs text-cream/60 mb-2">
                {datesPhase === 'departure' ? 'Step 1 · Pick departure' : 'Departure'}
              </p>
              <DatePickerBubble
                id="departure-date-picker"
                label="Departure"
                selectedDate={tripData.departureDate}
                active={datesPhase === 'departure'}
                onSelect={handleDepartureSelect}
              />
            </div>

            {tripData.departureDate ? (
              <div ref={returnDateRef}>
                <p className="text-xs text-cream/60 mb-2">
                  {datesPhase === 'return' ? 'Step 2 · Now pick return' : 'Return'}
                </p>
                {datesPhase === 'return' && !tripData.returnDate && (
                  <p className="text-xs text-amber/80 mb-2">
                    Return must be after
                    {' '}
                    {new Date(tripData.departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                )}
                <DatePickerBubble
                  id="return-date-picker"
                  label="Return"
                  selectedDate={tripData.returnDate}
                  minDate={minReturnDate}
                  viewAnchorDate={tripData.returnDate || minReturnDate}
                  active={datesPhase === 'return'}
                  onSelect={handleReturnSelect}
                />
              </div>
            ) : (
              <p className="text-xs text-cream/40 italic">Choose departure first — return dates will appear here.</p>
            )}

            {tripData.departureDate && tripData.returnDate && (
              <div>
                <p className="text-xs text-cream/60 mb-2">Date flexibility</p>
                <div className="flex flex-wrap gap-2">
                  {['Yes, ±3 days either way', 'Slightly flexible', 'No, dates are fixed'].map((opt) => (
                    <ChoiceChip
                      key={opt}
                      label={opt}
                      active={
                        opt === 'No, dates are fixed'
                          ? tripData.flexibleDates === false
                          : tripData.flexibleDates === true
                      }
                      onClick={() => onPatchTrip({ flexibleDates: opt !== 'No, dates are fixed' })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          {validationErrors[2] && <p className="text-xs text-red-400">{validationErrors[2]}</p>}
        </CollectionSectionCard>

        <CollectionSectionCard
          sectionId={3}
          title="Flights"
          summary={sectionSummaries[3]}
          isComplete={Boolean(sectionSummaries[3])}
          isExpanded={expanded.has(3)}
          onToggle={() => toggleSection(3)}
          hasError={Boolean(validationErrors[3])}
        >
          <div className="flex flex-wrap gap-2">
            <ChoiceChip
              label="Yes, flights booked ✓"
              active={tripData.flightsBooked === true}
              onClick={() => onPatchTrip({ flightsBooked: true, departureCity: null })}
            />
            <ChoiceChip
              label="No, still need to book"
              active={tripData.flightsBooked === false}
              onClick={() => onPatchTrip({ flightsBooked: false })}
            />
          </div>
          {tripData.flightsBooked === false && (
            <>
              <p className="text-xs text-cream/60">Flying from</p>
              <div className="flex flex-wrap gap-2">
                {DEPARTURE_CHIPS.map((chip) => (
                  <ChoiceChip
                    key={chip}
                    label={chip}
                    active={tripData.departureCity === chip}
                    onClick={() => onPatchTrip({ departureCity: chip })}
                  />
                ))}
              </div>
              <input
                type="text"
                value={tripData.departureCity ?? ''}
                onChange={(e) => onPatchTrip({ departureCity: e.target.value })}
                placeholder="City or airport…"
                className="w-full rounded-lg bg-navy border border-white/10 px-3 py-2 text-sm text-cream
                           placeholder:text-cream/30 focus:outline-none focus:ring-2 focus:ring-amber/30"
              />
            </>
          )}
          <div>
            <p className="text-xs text-cream/60 mb-2">
              {tripData.flightsBooked ? 'Booked flight times' : 'Preferred flight times'}
            </p>
            <div className="flex flex-wrap gap-2">
              {(tripData.flightsBooked
                ? ['Outbound morning · return evening', 'Outbound 08:00 · return 19:00', 'Red-eye outbound', "Flexible — I'll type exact times"]
                : ['Morning departures', 'Afternoon / evening', 'Red-eye OK', 'No preference']
              ).map((chip) => (
                <ChoiceChip
                  key={chip}
                  label={chip}
                  active={tripData.flightTiming === chip}
                  onClick={() => onPatchTrip({ flightTiming: chip })}
                />
              ))}
            </div>
            <input
              type="text"
              value={tripData.flightTiming ?? ''}
              onChange={(e) => onPatchTrip({ flightTiming: e.target.value })}
              placeholder="Or type times / preferences…"
              className="w-full mt-2 rounded-lg bg-navy border border-white/10 px-3 py-2 text-sm text-cream
                         placeholder:text-cream/30 focus:outline-none focus:ring-2 focus:ring-amber/30"
            />
          </div>
          {validationErrors[3] && <p className="text-xs text-red-400">{validationErrors[3]}</p>}
        </CollectionSectionCard>

        <CollectionSectionCard
          sectionId={4}
          title="Stay"
          summary={sectionSummaries[4]}
          isComplete={Boolean(sectionSummaries[4])}
          isExpanded={expanded.has(4)}
          onToggle={() => toggleSection(4)}
          hasError={Boolean(validationErrors[4])}
        >
          <div className="flex flex-wrap gap-2">
            <ChoiceChip
              label="Already booked ✓"
              active={tripData.accommodationBooked === true}
              onClick={() => onPatchTrip({ accommodationBooked: true, accommodationType: null })}
            />
            <ChoiceChip
              label="Still need to book"
              active={tripData.accommodationBooked === false}
              onClick={() => onPatchTrip({ accommodationBooked: false })}
            />
          </div>
          {tripData.accommodationBooked === false && (
            <>
              <p className="text-xs text-cream/60">Accommodation type</p>
              <div className="flex flex-wrap gap-2">
                {['Budget hostel', 'Mid-range hotel', 'Boutique / riad', 'Luxury resort', 'Airbnb / apartment', 'Surprise me'].map((chip) => (
                  <ChoiceChip
                    key={chip}
                    label={chip}
                    active={tripData.accommodationType === chip}
                    onClick={() => onPatchTrip({ accommodationType: chip })}
                  />
                ))}
              </div>
            </>
          )}
          {validationErrors[4] && <p className="text-xs text-red-400">{validationErrors[4]}</p>}
        </CollectionSectionCard>

        <CollectionSectionCard
          sectionId={5}
          title="Group"
          summary={sectionSummaries[5]}
          isComplete={Boolean(sectionSummaries[5])}
          isExpanded={expanded.has(5)}
          onToggle={() => toggleSection(5)}
          hasError={Boolean(validationErrors[5])}
        >
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Solo', value: 'solo' },
              { label: 'Couple', value: 'couple' },
              { label: 'Group of friends', value: 'friends' },
              { label: 'Family', value: 'family' },
            ].map(({ label, value }) => (
              <ChoiceChip
                key={value}
                label={label}
                active={tripData.groupType === value}
                onClick={() => onPatchTrip({ groupType: value })}
              />
            ))}
          </div>
          {(tripData.groupType === 'friends' || tripData.groupType === 'family') && (
            <StepperInput
              label="Group size"
              value={tripData.groupSize ?? draft.groupSize ?? 4}
              min={2}
              max={20}
              onChange={(n) => onPatchTrip({ groupSize: n })}
            />
          )}
          {(tripData.groupType === 'couple' || tripData.groupType === 'family') && (
            <>
              <div className="flex flex-wrap gap-2">
                <ChoiceChip
                  label={tripData.groupType === 'couple' ? 'No, just us two' : 'No children'}
                  active={tripData.hasChildren === false}
                  onClick={() => onPatchTrip({ hasChildren: false, childrenAges: null })}
                />
                <ChoiceChip
                  label="Yes, with kids"
                  active={tripData.hasChildren === true}
                  onClick={() => onPatchTrip({ hasChildren: true })}
                />
              </div>
              {tripData.hasChildren && (
                <div className="flex flex-wrap gap-2">
                  {['Under 5', '5–10', '11–15', 'Mixed ages'].map((chip) => (
                    <ChoiceChip
                      key={chip}
                      label={chip}
                      active={tripData.childrenAges === chip}
                      onClick={() => onPatchTrip({ childrenAges: chip })}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          {validationErrors[5] && <p className="text-xs text-red-400">{validationErrors[5]}</p>}
        </CollectionSectionCard>

        <CollectionSectionCard
          sectionId={6}
          title="Budget"
          summary={sectionSummaries[6]}
          isComplete={Boolean(sectionSummaries[6])}
          isExpanded={expanded.has(6)}
          onToggle={() => toggleSection(6)}
          hasError={Boolean(validationErrors[6])}
        >
          <div className="flex flex-wrap gap-2">
            {['Under £500', '£500–£1,000', '£1,000–£2,000', '£2,000–£5,000', '£5,000+', 'Flexible / not sure'].map((chip) => (
              <ChoiceChip
                key={chip}
                label={chip}
                active={tripData.budgetTotal === chip}
                onClick={() => onPatchTrip({ budgetTotal: chip })}
              />
            ))}
          </div>
          <p className="text-xs text-cream/60">Budget covers</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Covers everything',
              'Flights paid, covers accommodation + spending',
              'Both paid, this is spending money only',
              'Not sure yet',
            ].map((chip) => (
              <ChoiceChip
                key={chip}
                label={chip}
                active={tripData.budgetCovers === chip}
                onClick={() => onPatchTrip({ budgetCovers: chip })}
              />
            ))}
          </div>
          {validationErrors[6] && <p className="text-xs text-red-400">{validationErrors[6]}</p>}
        </CollectionSectionCard>

        <CollectionSectionCard
          sectionId={7}
          title="Dietary & access"
          summary={sectionSummaries[7]}
          isComplete={Boolean(sectionSummaries[7])}
          isExpanded={expanded.has(7)}
          onToggle={() => toggleSection(7)}
          hasError={Boolean(validationErrors[7])}
        >
          <p className="text-xs text-cream/60">Select all that apply</p>
          <div className="flex flex-wrap gap-2">
            {DIETARY_CHIPS.map((chip) => (
              <ChoiceChip
                key={chip}
                label={chip}
                active={draft.dietary?.includes(chip)}
                onClick={() => onToggleDietary(chip)}
                multi
              />
            ))}
          </div>
          {validationErrors[7] && <p className="text-xs text-red-400">{validationErrors[7]}</p>}
        </CollectionSectionCard>

        <CollectionSectionCard
          sectionId={8}
          title="Travel style"
          summary={sectionSummaries[8]}
          isComplete={Boolean(sectionSummaries[8])}
          isExpanded={expanded.has(8)}
          onToggle={() => toggleSection(8)}
          hasError={Boolean(validationErrors[8])}
        >
          <TravelStyleCard
            draft={draft}
            onToggleChip={onToggleTravelStyle}
            onUpdateText={onUpdateTravelStyleText}
            onConfirm={() => {}}
            disabled={isLoading}
            error={validationErrors[8]}
            hideSubmit
          />
        </CollectionSectionCard>
      </div>

      <div className="shrink-0 px-4 py-4 border-t border-white/10 bg-navy/80 backdrop-blur-sm">
        {collectionError && (
          <p className="text-xs text-red-400 mb-2" role="alert">{collectionError}</p>
        )}
        <button
          type="button"
          data-testid="build-trip-button"
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber text-navy text-sm font-semibold
                     hover:bg-amber-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                     focus:outline-none focus:ring-2 focus:ring-amber/50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Building your trip…
            </>
          ) : (
            'Build my trip →'
          )}
        </button>
      </div>
    </div>
  );
}
