import { formatDateBadge, formatDateSummary } from '../hooks/useTripCollection';

/** @typedef {{ id: number, key: string, title: string }} CollectionSection */

/** @type {CollectionSection[]} */
export const COLLECTION_SECTIONS = [
  { id: 1, key: 'destination', title: 'Destination' },
  { id: 2, key: 'dates', title: 'Dates' },
  { id: 3, key: 'flights', title: 'Flights' },
  { id: 4, key: 'stay', title: 'Stay' },
  { id: 5, key: 'group', title: 'Group' },
  { id: 6, key: 'budget', title: 'Budget' },
  { id: 7, key: 'dietary', title: 'Dietary & access' },
  { id: 8, key: 'style', title: 'Travel style' },
];

/**
 * @param {object} tripData
 * @param {object} draft
 * @returns {Record<number, string|null>}
 */
export function getSectionSummaries(tripData, draft) {
  const summaries = {};

  summaries[1] = tripData.destination || null;

  if (tripData.departureDate && tripData.returnDate) {
    summaries[2] = formatDateSummary(tripData.departureDate, tripData.returnDate);
    if (tripData.flexibleDates === true) summaries[2] += ' · flexible';
    else if (tripData.flexibleDates === false) summaries[2] += ' · fixed dates';
  } else if (tripData.departureDate) {
    summaries[2] = `Depart ${formatDateBadge(tripData.departureDate)}`;
  } else {
    summaries[2] = null;
  }

  if (tripData.flightsBooked === true) {
    summaries[3] = `Booked · ${tripData.flightTiming || 'times TBC'}`;
  } else if (tripData.flightsBooked === false) {
    summaries[3] = tripData.departureCity
      ? `${tripData.departureCity}${tripData.flightTiming ? ` · ${tripData.flightTiming}` : ''}`
      : 'Need to book';
  } else {
    summaries[3] = null;
  }

  if (tripData.accommodationBooked === true) {
    summaries[4] = 'Already booked';
  } else if (tripData.accommodationBooked === false) {
    summaries[4] = tripData.accommodationType || 'Still to book';
  } else {
    summaries[4] = null;
  }

  if (tripData.groupType === 'solo') summaries[5] = 'Solo';
  else if (tripData.groupType === 'couple') {
    summaries[5] = tripData.hasChildren
      ? `Couple + kids${tripData.childrenAges ? ` (${tripData.childrenAges})` : ''}`
      : 'Couple';
  } else if (tripData.groupType === 'friends') {
    summaries[5] = tripData.groupSize ? `${tripData.groupSize} friends` : 'Group of friends';
  } else if (tripData.groupType === 'family') {
    summaries[5] = tripData.groupSize
      ? `Family of ${tripData.groupSize}${tripData.hasChildren && tripData.childrenAges ? ` · ${tripData.childrenAges}` : ''}`
      : 'Family';
  } else {
    summaries[5] = null;
  }

  summaries[6] = tripData.budgetTotal
    ? `${tripData.budgetTotal}${tripData.budgetCovers ? ` · ${tripData.budgetCovers}` : ''}`
    : null;

  if (draft.dietary?.length) {
    summaries[7] = draft.dietary.includes('None') ? 'None' : draft.dietary.join(', ');
  } else if (tripData.dietaryRequirements) {
    summaries[7] = tripData.dietaryRequirements;
  } else {
    summaries[7] = null;
  }

  if (draft.paceLabel && draft.selectedInterests?.length) {
    summaries[8] = `${draft.paceLabel.split(' — ')[0]} · ${draft.selectedInterests.length} interests`;
  } else {
    summaries[8] = null;
  }

  return summaries;
}

/**
 * @param {object} tripData
 * @param {object} draft
 * @returns {{ valid: boolean, errors: Record<number, string>, firstInvalid: number|null }}
 */
export function validateCardCollection(tripData, draft) {
  /** @type {Record<number, string>} */
  const errors = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!tripData.destination || tripData.destination.trim().length < 2) {
    errors[1] = 'Pick or enter a destination.';
  }

  if (!tripData.departureDate) {
    errors[2] = 'Choose a departure date.';
  } else {
    const dep = new Date(tripData.departureDate);
    if (Number.isNaN(dep.getTime()) || dep < today) {
      errors[2] = 'Departure must be a future date.';
    }
  }

  if (!tripData.returnDate) {
    errors[2] = errors[2] || 'Choose a return date.';
  } else if (tripData.departureDate) {
    const ret = new Date(tripData.returnDate);
    const dep = new Date(tripData.departureDate);
    if (Number.isNaN(ret.getTime()) || ret <= dep) {
      errors[2] = 'Return must be after departure.';
    }
  }

  if (tripData.flexibleDates === null || tripData.flexibleDates === undefined) {
    errors[2] = errors[2] || 'Say if your dates are flexible.';
  }

  if (tripData.flightsBooked === null || tripData.flightsBooked === undefined) {
    errors[3] = 'Tell us if flights are booked.';
  } else if (!tripData.flightsBooked && !tripData.departureCity?.trim()) {
    errors[3] = 'Enter your departure city or airport.';
  } else if (!tripData.flightTiming?.trim()) {
    errors[3] = 'Add flight times or preferences.';
  }

  if (tripData.accommodationBooked === null || tripData.accommodationBooked === undefined) {
    errors[4] = 'Tell us about accommodation.';
  } else if (!tripData.accommodationBooked && !tripData.accommodationType?.trim()) {
    errors[4] = 'Choose an accommodation type.';
  }

  if (!tripData.groupType) {
    errors[5] = 'Who is travelling?';
  } else if (tripData.groupType === 'friends' || tripData.groupType === 'family') {
    if (!tripData.groupSize || tripData.groupSize < 2) {
      errors[5] = 'Set your group size.';
    }
  }

  if (tripData.groupType === 'couple' || tripData.groupType === 'family') {
    if (tripData.hasChildren === null || tripData.hasChildren === undefined) {
      errors[5] = errors[5] || 'Say if children are coming.';
    } else if (tripData.hasChildren && !tripData.childrenAges?.trim()) {
      errors[5] = errors[5] || 'Add children\'s ages.';
    }
  }

  if (!tripData.budgetTotal?.trim()) {
    errors[6] = 'Pick a budget range.';
  }
  if (!tripData.budgetCovers?.trim()) {
    errors[6] = errors[6] || 'Say what the budget covers.';
  }

  const dietaryOk = (draft.dietary?.length > 0) || tripData.dietaryRequirements;
  if (!dietaryOk) {
    errors[7] = 'Select dietary or accessibility needs (or None).';
  }

  if (!draft.pace) {
    errors[8] = 'Choose your travel pace.';
  }
  if (!draft.selectedInterests?.length) {
    errors[8] = errors[8] || 'Pick at least one interest.';
  }

  const ids = Object.keys(errors).map(Number).sort((a, b) => a - b);
  return {
    valid: ids.length === 0,
    errors,
    firstInvalid: ids[0] ?? null,
  };
}

/**
 * @param {number} sectionId
 * @param {object} tripData
 * @param {object} draft
 * @returns {boolean}
 */
export function isSectionComplete(sectionId, tripData, draft) {
  return validateCardCollection(tripData, draft).errors[sectionId] === undefined
    && getSectionSummaries(tripData, draft)[sectionId] !== null;
}
