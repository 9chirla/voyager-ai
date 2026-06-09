import { useState, useCallback, useEffect, useMemo } from 'react';

const COLLECTION_STORAGE_KEY = 'voyager-collection';
const COLLECTION_VERSION = 3;

export const CONFIRM_DIETARY = 'Got it →';
export const SURPRISE_CHIP = 'Surprise me!';

export const DEFAULT_TRIP_DATA = {
  destination: null,
  departureDate: null,
  returnDate: null,
  flexibleDates: null,
  departureCity: null,
  flightsBooked: null,
  flightTiming: null,
  accommodationBooked: null,
  accommodationType: null,
  groupType: null,
  groupSize: null,
  hasChildren: null,
  childrenAges: null,
  budgetTotal: null,
  budgetCovers: null,
  dietaryRequirements: null,
  pace: null,
  activitiesPerDay: null,
  firstVisit: null,
  mustSee: null,
  hardAvoid: null,
  interests: null,
};

const INITIAL_STEP = 's1_destination';

/** @type {Record<string, number>} */
const DISPLAY_STAGE = {
  s1_destination: 1,
  s2_departure: 2,
  s3_return: 3,
  s4_flexible: 4,
  s5_flights: 5,
  s5a_city: 5,
  s5b_timing: 5,
  s6_accommodation: 6,
  s6a_accom_type: 6,
  s7_group: 7,
  s7a_couple_kids: 7,
  s7b_ages: 7,
  s7a_size: 7,
  s7b_family_kids: 7,
  s7c_ages: 7,
  s8_budget: 8,
  s8a_budget_covers: 8,
  s9_dietary: 9,
  s10_style: 10,
};

/** Fields each step writes — cleared on handleBack from that step. */
const STEP_FIELDS = {
  s1_destination: ['destination'],
  s2_departure: ['departureDate'],
  s3_return: ['returnDate'],
  s4_flexible: ['flexibleDates'],
  s5_flights: ['flightsBooked', 'departureCity', 'flightTiming'],
  s5a_city: ['departureCity'],
  s5b_timing: ['flightTiming'],
  s6_accommodation: ['accommodationBooked', 'accommodationType'],
  s6a_accom_type: ['accommodationType'],
  s7_group: ['groupType', 'groupSize', 'hasChildren', 'childrenAges'],
  s7a_couple_kids: ['hasChildren', 'childrenAges'],
  s7b_ages: ['childrenAges'],
  s7a_size: ['groupSize'],
  s7b_family_kids: ['hasChildren', 'childrenAges'],
  s7c_ages: ['childrenAges'],
  s8_budget: ['budgetTotal', 'budgetCovers'],
  s8a_budget_covers: ['budgetCovers'],
  s9_dietary: ['dietaryRequirements'],
  s10_style: ['pace', 'activitiesPerDay', 'firstVisit', 'mustSee', 'hardAvoid', 'interests'],
};

/**
 * @param {string} stepId
 * @param {object} data
 * @returns {string|null}
 */
function resolveNextStep(stepId, data) {
  switch (stepId) {
    case 's1_destination': return 's2_departure';
    case 's2_departure': return 's3_return';
    case 's3_return': return 's4_flexible';
    case 's4_flexible': return 's5_flights';
    case 's5_flights': return data.flightsBooked ? 's5b_timing' : 's5a_city';
    case 's5a_city': return 's5b_timing';
    case 's5b_timing': return 's6_accommodation';
    case 's6_accommodation': return data.accommodationBooked ? 's7_group' : 's6a_accom_type';
    case 's6a_accom_type': return 's7_group';
    case 's7_group':
      if (data.groupType === 'solo') return 's8_budget';
      if (data.groupType === 'couple') return 's7a_couple_kids';
      return 's7a_size';
    case 's7a_couple_kids': return data.hasChildren ? 's7b_ages' : 's8_budget';
    case 's7b_ages': return 's8_budget';
    case 's7a_size': return data.groupType === 'family' ? 's7b_family_kids' : 's8_budget';
    case 's7b_family_kids': return data.hasChildren ? 's7c_ages' : 's8_budget';
    case 's7c_ages': return 's8_budget';
    case 's8_budget': return 's8a_budget_covers';
    case 's8a_budget_covers': return 's9_dietary';
    case 's9_dietary': return 's10_style';
    case 's10_style': return null;
    default: return null;
  }
}

/**
 * @param {string} stepId
 * @param {object} draft
 * @returns {object}
 */
function buildCurrentStep(stepId, draft) {
  switch (stepId) {
    case 's1_destination':
      return {
        question: 'Where would you like to go?',
        inputType: 'chips_with_text',
        chips: [
          'Bali, Indonesia', 'Tokyo, Japan', 'Marrakech, Morocco',
          'Amalfi Coast, Italy', 'New York, USA', 'Barcelona, Spain', SURPRISE_CHIP,
        ],
        autoAdvance: false,
      };
    case 's2_departure':
      return { question: 'When do you depart?', inputType: 'date_picker', autoAdvance: true };
    case 's3_return':
      return { question: 'And when do you return?', inputType: 'date_picker', autoAdvance: true };
    case 's4_flexible':
      return {
        question: 'Are your dates flexible at all?',
        inputType: 'chips_only',
        chips: ['Yes, ±3 days either way', 'Slightly flexible', 'No, dates are fixed'],
        autoAdvance: true,
      };
    case 's5_flights':
      return {
        question: 'Have you already booked your flights?',
        inputType: 'chips_only',
        chips: ['Yes, flights booked ✓', 'No, still need to book'],
        autoAdvance: true,
      };
    case 's5a_city':
      return {
        question: 'Which city or airport are you flying from?',
        inputType: 'chips_with_text',
        chips: [
          'London Heathrow (LHR)', 'London Gatwick (LGW)', 'London Stansted (STN)',
          'Manchester (MAN)', 'Birmingham (BHX)', 'Edinburgh (EDI)',
        ],
        autoAdvance: false,
      };
    case 's5b_timing':
      return {
        question: draft.flightsBooked
          ? 'What are your booked flight times (outbound and return)?'
          : 'Any preferred flight times when you book?',
        inputType: 'chips_with_text',
        chips: draft.flightsBooked
          ? [
              'Outbound morning · return evening',
              'Outbound 08:00 · return 19:00',
              'Red-eye outbound',
              "Flexible — I'll type exact times",
            ]
          : [
              'Morning departures',
              'Afternoon / evening',
              'Red-eye OK',
              'No preference',
            ],
        autoAdvance: false,
      };
    case 's6_accommodation':
      return {
        question: 'What about accommodation — sorted or still to book?',
        inputType: 'chips_only',
        chips: ['Already booked ✓', 'Still need to book'],
        autoAdvance: true,
      };
    case 's6a_accom_type':
      return {
        question: 'What type of accommodation are you after?',
        inputType: 'chips_with_text',
        chips: ['Budget hostel', 'Mid-range hotel', 'Boutique / riad', 'Luxury resort', 'Airbnb / apartment', 'Surprise me'],
        autoAdvance: false,
      };
    case 's7_group':
      return {
        question: 'Who are you travelling with?',
        inputType: 'chips_only',
        chips: ['Solo', 'Couple', 'Group of friends', 'Family'],
        autoAdvance: true,
      };
    case 's7a_couple_kids':
      return {
        question: 'Any children joining?',
        inputType: 'chips_only',
        chips: ['No, just us two', 'Yes, with kids'],
        autoAdvance: true,
      };
    case 's7b_ages':
    case 's7c_ages':
      return {
        question: 'Roughly what ages are the children?',
        inputType: 'chips_only',
        chips: ['Under 5', '5–10', '11–15', 'Mixed ages'],
        autoAdvance: true,
      };
    case 's7a_size':
      return {
        question: 'How many people in total including you?',
        inputType: 'stepper',
        min: 2,
        max: 20,
        default: draft.groupSize ?? 4,
        autoAdvance: false,
      };
    case 's7b_family_kids':
      return {
        question: 'Are any children coming along?',
        inputType: 'chips_only',
        chips: ['No children', 'Yes, with kids'],
        autoAdvance: true,
      };
    case 's8_budget':
      return {
        question: 'What is your total budget for this trip?',
        inputType: 'chips_with_text',
        chips: ['Under £500', '£500–£1,000', '£1,000–£2,000', '£2,000–£5,000', '£5,000+', 'Flexible / not sure'],
        autoAdvance: false,
      };
    case 's8a_budget_covers':
      return {
        question: 'Good to know. Does that budget need to cover flights and accommodation, or are those already sorted?',
        inputType: 'chips_only',
        chips: [
          'Covers everything',
          'Flights paid, covers accommodation + spending',
          'Both paid, this is spending money only',
          'Not sure yet',
        ],
        autoAdvance: true,
      };
    case 's9_dietary':
      return {
        question: 'Any dietary requirements or accessibility needs we should factor into recommendations?',
        inputType: 'multi_chips_with_text',
        chips: ['None', 'Vegetarian', 'Vegan', 'Halal', 'Gluten-free', 'Nut allergy', 'Mobility considerations'],
        confirmLabel: CONFIRM_DIETARY,
        autoAdvance: false,
      };
    case 's10_style':
      return {
        question: 'Last one — tell us how you like to travel.',
        inputType: 'multi_chips_confirm',
        autoAdvance: false,
      };
    default:
      return { question: '', inputType: 'none' };
  }
}

/**
 * @param {string} iso
 * @returns {string}
 */
export function formatDateBadge(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * @param {string} departure
 * @param {string} returnDate
 * @returns {string}
 */
export function formatDateSummary(departure, returnDate) {
  const nights = Math.max(1, Math.round((new Date(returnDate) - new Date(departure)) / 86400000));
  return `${nights} nights · ${formatDateBadge(departure)} → ${formatDateBadge(returnDate)}`;
}

/**
 * @param {object} state
 */
function saveCollection(state) {
  try {
    localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify({ version: COLLECTION_VERSION, ...state }));
  } catch {
    // fail silently
  }
}

function loadCollection() {
  try {
    const raw = localStorage.getItem(COLLECTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== COLLECTION_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * @param {object} tripData
 * @param {string[]} fields
 * @returns {object}
 */
function clearFields(tripData, fields) {
  const next = { ...tripData };
  for (const f of fields) next[f] = null;
  return next;
}

const PACE_MAP = {
  'Packed — I want to see everything': 'packed',
  'Moderate — busy but with breathing room': 'moderate',
  'Relaxed — slow mornings, don\'t rush me': 'relaxed',
};

const ACTIVITIES_MAP = {
  packed: '5+',
  moderate: '3-4',
  relaxed: '1-2',
};

export function useTripCollection() {
  const saved = loadCollection();

  const [stepHistory, setStepHistory] = useState(saved?.stepHistory ?? [INITIAL_STEP]);
  const [tripData, setTripData] = useState(saved?.tripData ?? { ...DEFAULT_TRIP_DATA });
  const [draft, setDraft] = useState(saved?.draft ?? { dietary: [], groupSize: 4, selectedInterests: [] });
  const [isComplete, setIsComplete] = useState(saved?.isComplete ?? false);
  const [collectionError, setCollectionError] = useState(null);

  const currentStepId = isComplete ? null : stepHistory[stepHistory.length - 1];
  const stage = currentStepId ? DISPLAY_STAGE[currentStepId] ?? 1 : 11;
  const currentStep = currentStepId ? buildCurrentStep(currentStepId, { ...tripData, ...draft }) : null;

  useEffect(() => {
    saveCollection({ stepHistory, tripData, draft, isComplete });
  }, [stepHistory, tripData, draft, isComplete]);

  const advance = useCallback((nextData, userDisplay) => {
    const nextId = resolveNextStep(currentStepId, nextData);
    if (!nextId) {
      setTripData(nextData);
      setIsComplete(true);
      return {
        success: true,
        justCompleted: true,
        userDisplay,
        collected: nextData,
        nextQuestion: null,
      };
    }
    setTripData(nextData);
    setStepHistory((h) => [...h, nextId]);
    const nextStep = buildCurrentStep(nextId, { ...nextData, ...draft });
    return {
      success: true,
      userDisplay,
      nextQuestion: nextStep.question,
      nextStepId: nextId,
      nextStage: DISPLAY_STAGE[nextId],
      dateSummary: nextId === 's4_flexible' && nextData.departureDate && nextData.returnDate
        ? formatDateSummary(nextData.departureDate, nextData.returnDate)
        : null,
    };
  }, [currentStepId, draft]);

  const handleAnswer = useCallback((answer) => {
    if (isComplete || !currentStepId) {
      return { success: false, error: 'Collection already complete.' };
    }

    const trimmed = answer.trim();
    setCollectionError(null);

    switch (currentStepId) {
      case 's1_destination': {
        if (!trimmed || trimmed.length < 2) {
          const err = 'Please enter a destination (at least 2 characters).';
          setCollectionError(err);
          return { success: false, error: err };
        }
        const dest = trimmed === SURPRISE_CHIP ? 'Surprise me' : trimmed;
        return advance({ ...tripData, destination: dest }, dest);
      }

      case 's2_departure': {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const picked = new Date(trimmed);
        if (Number.isNaN(picked.getTime()) || picked < today) {
          const err = 'Please pick a valid future date.';
          setCollectionError(err);
          return { success: false, error: err };
        }
        return advance({ ...tripData, departureDate: trimmed }, formatDateBadge(trimmed));
      }

      case 's3_return': {
        const picked = new Date(trimmed);
        const dep = new Date(tripData.departureDate);
        if (Number.isNaN(picked.getTime()) || picked <= dep) {
          const err = 'Return date must be after your departure date.';
          setCollectionError(err);
          return { success: false, error: err };
        }
        return advance({ ...tripData, returnDate: trimmed }, formatDateBadge(trimmed));
      }

      case 's4_flexible': {
        const flex = trimmed !== 'No, dates are fixed';
        return advance({ ...tripData, flexibleDates: flex }, trimmed);
      }

      case 's5_flights': {
        const booked = trimmed === 'Yes, flights booked ✓';
        const next = { ...tripData, flightsBooked: booked, departureCity: booked ? null : tripData.departureCity };
        return advance(next, trimmed);
      }

      case 's5a_city': {
        if (!trimmed) {
          const err = 'Please enter your departure city or airport.';
          setCollectionError(err);
          return { success: false, error: err };
        }
        return advance({ ...tripData, departureCity: trimmed }, trimmed);
      }

      case 's5b_timing': {
        if (!trimmed) {
          const err = 'Please enter your flight times or pick an option.';
          setCollectionError(err);
          return { success: false, error: err };
        }
        return advance({ ...tripData, flightTiming: trimmed }, trimmed);
      }

      case 's6_accommodation': {
        const booked = trimmed === 'Already booked ✓';
        const next = { ...tripData, accommodationBooked: booked, accommodationType: booked ? null : tripData.accommodationType };
        return advance(next, trimmed);
      }

      case 's6a_accom_type': {
        if (!trimmed) {
          const err = 'Please choose an accommodation type.';
          setCollectionError(err);
          return { success: false, error: err };
        }
        return advance({ ...tripData, accommodationType: trimmed }, trimmed);
      }

      case 's7_group': {
        const map = { Solo: 'solo', Couple: 'couple', 'Group of friends': 'friends', Family: 'family' };
        const groupType = map[trimmed];
        let next = { ...tripData, groupType, groupSize: null, hasChildren: null, childrenAges: null };
        if (groupType === 'solo') next = { ...next, groupSize: 1, hasChildren: false, childrenAges: null };
        return advance(next, trimmed);
      }

      case 's7a_couple_kids': {
        const hasChildren = trimmed === 'Yes, with kids';
        const next = { ...tripData, groupSize: 2, hasChildren, childrenAges: hasChildren ? tripData.childrenAges : null };
        return advance(next, trimmed);
      }

      case 's7b_ages':
      case 's7c_ages':
        return advance({ ...tripData, hasChildren: true, childrenAges: trimmed }, trimmed);

      case 's7a_size': {
        const size = parseInt(trimmed, 10);
        if (Number.isNaN(size) || size < 2 || size > 20) {
          const err = 'Please choose a group size between 2 and 20.';
          setCollectionError(err);
          return { success: false, error: err };
        }
        return advance({ ...tripData, groupSize: size }, `${size} people`);
      }

      case 's7b_family_kids': {
        const hasChildren = trimmed === 'Yes, with kids';
        const next = { ...tripData, hasChildren, childrenAges: hasChildren ? tripData.childrenAges : null };
        return advance(next, trimmed);
      }

      case 's8_budget':
        return advance({ ...tripData, budgetTotal: trimmed }, trimmed);

      case 's8a_budget_covers':
        return advance({ ...tripData, budgetCovers: trimmed }, trimmed);

      case 's9_dietary':
        if (trimmed === CONFIRM_DIETARY) {
          if (draft.dietary.length === 0) {
            const err = 'Please select at least one option or type your requirements.';
            setCollectionError(err);
            return { success: false, error: err };
          }
          const value = draft.dietary.includes('None') ? null : draft.dietary.join(', ');
          return advance({ ...tripData, dietaryRequirements: value }, value ?? 'None');
        }
        if (currentStep.chips?.includes(trimmed)) {
          return { success: false, toggled: true };
        }
        if (!trimmed) {
          const err = 'Please select at least one option.';
          setCollectionError(err);
          return { success: false, error: err };
        }
        return advance({ ...tripData, dietaryRequirements: trimmed }, trimmed);

      default:
        return { success: false, error: 'Unknown step.' };
    }
  }, [isComplete, currentStepId, tripData, draft, advance, currentStep]);

  const toggleChip = useCallback((chip) => {
    if (currentStepId !== 's9_dietary') return;
    setCollectionError(null);
    setDraft((prev) => {
      if (chip === 'None') return { ...prev, dietary: ['None'] };
      const without = prev.dietary.filter((c) => c !== 'None');
      const dietary = without.includes(chip)
        ? without.filter((c) => c !== chip)
        : [...without, chip];
      return { ...prev, dietary };
    });
  }, [currentStepId]);

  const confirmTravelStyle = useCallback(() => {
    if (currentStepId !== 's10_style') return { success: false };
    if (!draft.pace) {
      const err = 'Please select your travel pace.';
      setCollectionError(err);
      return { success: false, error: err };
    }
    if (!draft.selectedInterests?.length) {
      const err = 'Please select at least one interest.';
      setCollectionError(err);
      return { success: false, error: err };
    }
    setCollectionError(null);
    const next = {
      ...tripData,
      pace: draft.pace,
      activitiesPerDay: ACTIVITIES_MAP[draft.pace] ?? '3-4',
      firstVisit: draft.firstVisit ?? true,
      mustSee: draft.mustSee?.trim() || null,
      hardAvoid: draft.hardAvoid?.trim() || null,
      interests: draft.selectedInterests.join(', '),
    };
    setIsComplete(true);
    setTripData(next);
    return { success: true, justCompleted: true, collected: next, userDisplay: 'Build my trip →' };
  }, [currentStepId, tripData, draft]);

  const toggleTravelStyle = useCallback((section, chip) => {
    if (currentStepId !== 's10_style') return;
    setCollectionError(null);
    setDraft((prev) => {
      if (section === 'pace') {
        return { ...prev, pace: PACE_MAP[chip], paceLabel: chip };
      }
      if (section === 'firstVisit') {
        return { ...prev, firstVisit: chip === 'First time', firstVisitLabel: chip };
      }
      if (section === 'interests') {
        const selected = prev.selectedInterests ?? [];
        const selectedInterests = selected.includes(chip)
          ? selected.filter((c) => c !== chip)
          : [...selected, chip];
        return { ...prev, selectedInterests };
      }
      return prev;
    });
  }, [currentStepId]);

  const updateTravelStyleText = useCallback((field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setGroupSize = useCallback((size) => {
    setDraft((prev) => ({ ...prev, groupSize: size }));
  }, []);

  const confirmGroupSize = useCallback(() => {
    return handleAnswer(String(draft.groupSize ?? 4));
  }, [handleAnswer, draft.groupSize]);

  const handleBack = useCallback(() => {
    if (stepHistory.length <= 1 || isComplete) return null;

    const leaving = stepHistory[stepHistory.length - 1];
    const fields = STEP_FIELDS[leaving] ?? [];
    const newHistory = stepHistory.slice(0, -1);
    const prevStepId = newHistory[newHistory.length - 1];
    const newTripData = clearFields(tripData, fields);

    setStepHistory(newHistory);
    setTripData(newTripData);
    setCollectionError(null);

    if (leaving === 's9_dietary') setDraft((d) => ({ ...d, dietary: [] }));
    if (leaving === 's10_style') {
      setDraft((d) => ({
        ...d,
        pace: null,
        paceLabel: null,
        firstVisit: null,
        firstVisitLabel: null,
        selectedInterests: [],
        mustSee: '',
        hardAvoid: '',
      }));
    }

    const prevStep = buildCurrentStep(prevStepId, { ...newTripData, ...draft });
    return {
      question: prevStep.question,
      stepId: prevStepId,
      stage: DISPLAY_STAGE[prevStepId],
      stepHistory: newHistory,
      tripData: newTripData,
    };
  }, [stepHistory, isComplete, tripData, draft]);

  const resetCollection = useCallback(() => {
    setStepHistory([INITIAL_STEP]);
    setTripData({ ...DEFAULT_TRIP_DATA });
    setDraft({ dietary: [], groupSize: 4, selectedInterests: [] });
    setIsComplete(false);
    setCollectionError(null);
    localStorage.removeItem(COLLECTION_STORAGE_KEY);
  }, []);

  const chips = useMemo(() => {
    if (!currentStep?.chips) return [];
    const base = [...currentStep.chips];
    if (currentStepId === 's9_dietary' && draft.dietary.length > 0) {
      base.push(CONFIRM_DIETARY);
    }
    return base;
  }, [currentStep, currentStepId, draft.dietary]);

  return {
    stage,
    stepHistory,
    tripData,
    currentStep,
    currentStepId,
    handleAnswer,
    handleBack,
    isComplete,
    resetCollection,
    collectionError,
    toggleChip,
    confirmTravelStyle,
    toggleTravelStyle,
    updateTravelStyleText,
    setGroupSize,
    confirmGroupSize,
    draft,
    chips,
    DISPLAY_STAGE,
  };
}

export { INITIAL_STEP, buildCurrentStep, DISPLAY_STAGE };
