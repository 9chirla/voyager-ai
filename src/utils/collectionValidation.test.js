import { describe, expect, it } from 'vitest';
import { validateCardCollection, getSectionSummaries } from './collectionValidation';
import { DEFAULT_TRIP_DATA } from '../hooks/useTripCollection';

const completeTrip = {
  ...DEFAULT_TRIP_DATA,
  destination: 'Tokyo, Japan',
  departureDate: '2026-08-01',
  returnDate: '2026-08-10',
  flexibleDates: false,
  flightsBooked: true,
  flightTiming: 'Morning departures',
  accommodationBooked: true,
  groupType: 'couple',
  groupSize: 2,
  hasChildren: false,
  budgetTotal: '£1,000–£2,000',
  budgetCovers: 'Covers everything',
};

const completeDraft = {
  dietary: ['None'],
  pace: 'moderate',
  paceLabel: 'Moderate — busy with breathing room',
  selectedInterests: ['Culture & history'],
  groupSize: 4,
};

describe('validateCardCollection', () => {
  it('fails when destination missing', () => {
    const result = validateCardCollection(DEFAULT_TRIP_DATA, { dietary: [] });
    expect(result.valid).toBe(false);
    expect(result.errors[1]).toBeTruthy();
  });

  it('passes with complete trip and draft', () => {
    const result = validateCardCollection(completeTrip, {
      ...completeDraft,
      pace: 'moderate',
      selectedInterests: ['Food & local cuisine'],
    });
    expect(result.valid).toBe(true);
  });
});

describe('getSectionSummaries', () => {
  it('summarises destination', () => {
    const summaries = getSectionSummaries({ destination: 'Bali, Indonesia' }, {});
    expect(summaries[1]).toBe('Bali, Indonesia');
  });
});
