import { useState, useCallback, useRef, useEffect } from 'react';
import {
  parseItinerary,
  parseChecklist,
  parseChips,
  parseInsiderTips,
  parseStage,
  validateParsedOutput,
} from '../utils/tripParser';
import {
  createStreamParser,
  feedStreamParser,
  flushStreamParser,
} from '../utils/streamParser';
import { buildMegaPrompt, MEGA_SYSTEM_PROMPT } from '../utils/buildPrompt';
import {
  useTripCollection,
  INITIAL_STEP,
  buildCurrentStep,
  formatDateSummary,
  formatDateBadge,
  CONFIRM_DIETARY,
} from './useTripCollection';
import {
  formatInspirationBlock,
  mergeMustSeeWithInspiration,
} from '../utils/plannerContext';
import {
  chatApiUrl,
  isStaticHostWithoutApi,
  STATIC_HOST_API_MESSAGE,
} from '../utils/apiConfig';

const SESSION_VERSION = 2;

/**
 * STORAGE_SCHEMA
 * voyager-collection (v3) — useTripCollection: stepHistory, tripData, draft, isComplete
 * voyager-session (v2)    — messages, tripData, stage, chips
 * voyager-checklist-state — Record<string, boolean> checkbox states
 */

const COLLECTION_WELCOME =
  "Welcome, traveller! ✈️ I'm Voyager, your personal trip planning companion. Let's craft an unforgettable journey together.\n\n";

const CHECKLIST_STORAGE_KEY = 'voyager-checklist-state';
const SESSION_STORAGE_KEY = 'voyager-session';
const SESSION_SAVE_DEBOUNCE_MS = 500;

const DEFAULT_TRIP_DATA = {
  destination: '',
  dates: '',
  budget: '',
  interests: [],
  itinerary: [],
  checklist: { packing: [], booking: [] },
  tips: '',
};

/** Map collected intake data to summary panel shape. */
function mapCollectionToFullTripData(collected) {
  const dates =
    collected.departureDate && collected.returnDate
      ? formatDateSummary(collected.departureDate, collected.returnDate)
      : '';
  return {
    destination: collected.destination ?? '',
    dates,
    budget: collected.budgetTotal ?? '',
    interests: collected.interests
      ? collected.interests.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    itinerary: [],
    checklist: { packing: [], booking: [] },
    tips: '',
    collectionRaw: collected,
  };
}

/**
 * @param {import('../utils/tripParser.js').ItineraryDay[]} existing
 * @param {import('../utils/tripParser.js').ItineraryDay[]} incoming
 * @returns {import('../utils/tripParser.js').ItineraryDay[]}
 */
function mergeItineraryDays(existing, incoming) {
  const byDay = new Map(existing.map((d) => [d.day, d]));
  for (const day of incoming) {
    byDay.set(day.day, day);
  }
  return [...byDay.values()].sort((a, b) => a.day - b.day);
}

/**
 * @param {object} collected
 * @returns {number|undefined}
 */
function getExpectedDayCount(collected) {
  if (!collected?.departureDate || !collected?.returnDate) return undefined;
  const start = new Date(collected.departureDate);
  const end = new Date(collected.returnDate);
  const nights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  return nights + 1;
}

/** @param {string} stepId @param {object} data */
function getStepAnswerDisplay(stepId, data) {
  const groupLabels = { solo: 'Solo', couple: 'Couple', friends: 'Group of friends', family: 'Family' };
  const displays = {
    s1_destination: data.destination,
    s2_departure: data.departureDate ? formatDateBadge(data.departureDate) : '',
    s3_return: data.returnDate ? formatDateBadge(data.returnDate) : '',
    s4_flexible: data.flexibleDates ? 'Yes, ±3 days either way' : 'No, dates are fixed',
    s5_flights: data.flightsBooked ? 'Yes, flights booked ✓' : 'No, still need to book',
    s5a_city: data.departureCity,
    s5b_timing: data.flightTiming,
    s6_accommodation: data.accommodationBooked ? 'Already booked ✓' : 'Still need to book',
    s6a_accom_type: data.accommodationType,
    s7_group: groupLabels[data.groupType] ?? data.groupType,
    s7a_couple_kids: data.hasChildren ? 'Yes, with kids' : 'No, just us two',
    s7b_ages: data.childrenAges,
    s7c_ages: data.childrenAges,
    s7a_size: `${data.groupSize} people`,
    s7b_family_kids: data.hasChildren ? 'Yes, with kids' : 'No children',
    s8_budget: data.budgetTotal,
    s8a_budget_covers: data.budgetCovers,
    s9_dietary: data.dietaryRequirements ?? 'None',
    s10_style: 'Build my trip →',
  };
  return displays[stepId] ?? '';
}

function rebuildCollectionMessages(collection) {
  const { stepHistory, tripData } = collection;
  const messages = [
    {
      role: 'assistant',
      content: COLLECTION_WELCOME + buildCurrentStep(INITIAL_STEP, {}).question,
      stage: 1,
    },
  ];

  for (let i = 0; i < stepHistory.length - 1; i++) {
    const stepId = stepHistory[i];
    const answer = getStepAnswerDisplay(stepId, tripData);
    if (!answer) break;

    messages.push({ role: 'user', content: String(answer), stage: i + 1 });

    if (stepId === 's3_return' && tripData.departureDate && tripData.returnDate) {
      messages.push({
        role: 'assistant',
        content: `📅 **${formatDateSummary(tripData.departureDate, tripData.returnDate)}**`,
        stage: 3,
      });
    }

    const nextId = stepHistory[i + 1];
    if (nextId) {
      messages.push({
        role: 'assistant',
        content: buildCurrentStep(nextId, tripData).question,
        stage: i + 2,
      });
    }
  }

  return messages;
}

function loadChecklistState() {
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function migrateSession(parsed) {
  if (!parsed || parsed.version !== SESSION_VERSION) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
  if (!Array.isArray(parsed.messages) || !parsed.tripData) return null;
  return parsed;
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = migrateSession(JSON.parse(raw));
    if (!parsed) return null;
    return {
      messages: parsed.messages.filter(
        (m) => m.role !== 'assistant' || (m.content && m.content.trim()),
      ),
      tripData: parsed.tripData,
      stage: typeof parsed.stage === 'number' ? parsed.stage : 1,
      chips: Array.isArray(parsed.chips) ? parsed.chips : [],
    };
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function saveSession({ messages, tripData, stage, chips }) {
  try {
    const persistableMessages = messages.filter(
      (m) => m.role !== 'assistant' || (m.content && m.content.trim()),
    );
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ version: SESSION_VERSION, messages: persistableMessages, tripData, stage, chips }),
    );
  } catch {
    // fail silently
  }
}

/**
 * @param {Response} res
 * @param {{ onToken?: (token: string, accumulated: string) => void, onDayReady?: (day: import('../utils/tripParser.js').ItineraryDay) => void, signal?: AbortSignal }} options
 * @returns {Promise<{ fullText: string, truncated: boolean }>}
 */
async function readSseStream(res, options = {}) {
  const { onToken, onDayReady, signal } = options;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';
  let truncated = false;
  let streamParserState = createStreamParser();

  const emitNewDays = (newDays) => {
    if (!onDayReady || !newDays.length) return;
    for (const day of newDays) {
      onDayReady(day);
    }
  };

  const processToken = (token) => {
    fullText += token;
    onToken?.(token, fullText);

    const fed = feedStreamParser(streamParserState, token);
    streamParserState = fed.state;
    emitNewDays(fed.newDays);
  };

  const processSseLines = (lines) => {
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        if (parsed.meta?.finish_reason === 'length') {
          truncated = true;
        }
        if (parsed.token) {
          processToken(parsed.token);
        }
      } catch {
        // skip malformed SSE chunk
      }
    }
  };

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        throw new DOMException('Aborted', 'AbortError');
      }

      const { done, value } = await reader.read();
      if (value) buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split('\n');
      buffer = done ? '' : (lines.pop() || '');
      processSseLines(lines);
      if (done) {
        if (buffer.trim()) processSseLines([buffer]);
        break;
      }
    }

    const flushed = flushStreamParser(streamParserState);
    streamParserState = flushed.state;
    emitNewDays(flushed.newDays);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw err;
  }

  return { fullText, truncated };
}

export function useChat() {
  const collection = useTripCollection();
  const initialState = useRef(null);

  if (initialState.current === null) {
    if (!collection.isComplete) {
      initialState.current = {
        messages: rebuildCollectionMessages(collection),
        tripData: mapCollectionToFullTripData(collection.tripData),
        stage: collection.stage,
        chips: collection.chips,
      };
    } else {
      const session = loadSession();
      initialState.current = session ?? {
        messages: rebuildCollectionMessages({ ...collection, isComplete: true }),
        tripData: mapCollectionToFullTripData(collection.tripData),
        stage: 5,
        chips: [],
      };
    }
  }

  const [messages, setMessages] = useState(initialState.current.messages);
  const [tripData, setTripData] = useState(initialState.current.tripData);
  const [stage, setStage] = useState(initialState.current.stage);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreamingPlan, setIsStreamingPlan] = useState(false);
  const [chips, setChips] = useState(initialState.current.chips);
  const [error, setError] = useState(null);
  const [cardValidationErrors, setCardValidationErrors] = useState({});
  const [checklistState, setChecklistState] = useState(loadChecklistState);
  const abortControllerRef = useRef(null);
  /** @type {import('../utils/plannerContext').PlannerInspirationContext|null} */
  const inspirationRef = useRef(null);

  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setIsStreamingPlan(false);
  }, []);

  const isCollecting = !collection.isComplete;
  const displayStage = isCollecting ? collection.stage : stage;
  const displayChips = isCollecting ? collection.chips : chips;

  useEffect(() => {
    if (!isCollecting) return;
    setTripData(mapCollectionToFullTripData(collection.tripData));
  }, [collection.tripData, isCollecting]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isCollecting || collection.isComplete) {
        saveSession({ messages, tripData, stage, chips });
      }
    }, SESSION_SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [messages, tripData, stage, chips, isCollecting, collection.isComplete]);

  const handleDayReady = useCallback((day) => {
    setTripData((prev) => ({
      ...prev,
      itinerary: mergeItineraryDays(prev.itinerary ?? [], [day]),
    }));
  }, []);

  const streamMegaPlanResponse = useCallback(async (collectedTripData) => {
    setIsLoading(true);
    setIsStreamingPlan(true);
    setError(null);

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const enrichedTripData = {
      ...collectedTripData,
      mustSee: mergeMustSeeWithInspiration(
        collectedTripData.mustSee,
        inspirationRef.current,
      ),
    };

    const megaPrompt = buildMegaPrompt(enrichedTripData);
    const apiMessages = [
      { role: 'system', content: MEGA_SYSTEM_PROMPT },
      { role: 'user', content: megaPrompt },
    ];

    setStage(5);
    setTripData(mapCollectionToFullTripData(enrichedTripData));

    if (isStaticHostWithoutApi()) {
      setError(STATIC_HOST_API_MESSAGE);
      setIsLoading(false);
      setIsStreamingPlan(false);
      return;
    }

    try {
      const res = await fetch(chatApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, stage: 5 }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errorMsg = 'Something went wrong';
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch {
          if (res.status === 404) {
            errorMsg = isStaticHostWithoutApi()
              ? STATIC_HOST_API_MESSAGE
              : 'Chat API not found. Run `npm run dev` so Express serves /api/chat.';
          }
        }
        throw new Error(errorMsg);
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        throw new Error(
          data.error
            || 'API returned an unexpected JSON response. Restart the dev server (`npm run dev`) so /api/chat streams correctly.',
        );
      }

      const { fullText, truncated } = await readSseStream(res, {
        signal: controller.signal,
        onDayReady: handleDayReady,
      });

      if (!fullText.trim()) throw new Error('Voyager returned an empty response. Try again.');

      const { stage: aiStage, cleanedText: stageClean } = parseStage(fullText);
      if (aiStage !== null) setStage(aiStage);

      const { days, cleanedText: afterItinerary } = parseItinerary(stageClean);
      const { packing, booking, cleanedText: afterChecklist } = parseChecklist(afterItinerary);
      const { cleanedText: afterChips } = parseChips(afterChecklist);
      const { tips } = parseInsiderTips(afterChips);

      let validationResult = { valid: true, issues: [] };

      setTripData((prev) => {
        const mergedItinerary = days.length > 0 ? days : (prev.itinerary ?? []);
        const mergedChecklist = {
          packing: packing.length > 0 ? packing : (prev.checklist?.packing ?? []),
          booking: booking.length > 0 ? booking : (prev.checklist?.booking ?? []),
        };
        const mergedTips = tips.trim() || prev.tips || '';

        const next = {
          ...prev,
          ...(days.length > 0 ? { itinerary: days } : {}),
          ...(packing.length > 0 || booking.length > 0
            ? { checklist: { packing, booking } }
            : {}),
          ...(tips.trim() ? { tips: tips.trim() } : {}),
        };

        validationResult = validateParsedOutput(
          {
            itinerary: mergedItinerary,
            checklist: mergedChecklist,
            tips: mergedTips,
          },
          { expectedDayCount: getExpectedDayCount(collectedTripData) },
        );

        return next;
      });

      if (!validationResult.valid) {
        setError(
          truncated
            ? `Plan may be incomplete: ${validationResult.issues.join('; ')}. Tap Try again to regenerate.`
            : `Plan validation failed: ${validationResult.issues.join('; ')}. Tap Try again to regenerate.`,
        );
      } else if (truncated) {
        setError('Response may still be incomplete — tap Try again to regenerate.');
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      const message = err.message || 'Something went wrong';
      if (message === 'Failed to fetch' || message === 'Load failed') {
        setError(
          isStaticHostWithoutApi()
            ? STATIC_HOST_API_MESSAGE
            : 'Could not reach the Voyager API. Check that the server is running (`npm run dev`).',
        );
      } else {
        setError(message);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsLoading(false);
      setIsStreamingPlan(false);
    }
  }, [handleDayReady]);

  const fetchMegaResponse = useCallback(
    async (collectedTripData) => {
      await streamMegaPlanResponse(collectedTripData);
    },
    [streamMegaPlanResponse],
  );

  const appendCollectionExchange = useCallback((result, answeringStage, updatedMessages) => {
    const display = result.userDisplay ?? '';
    const msgs = [...updatedMessages, { role: 'user', content: display, stage: answeringStage }];

    if (result.dateSummary) {
      msgs.push({ role: 'assistant', content: `📅 **${result.dateSummary}**`, stage: answeringStage });
    }

    if (result.nextQuestion) {
      msgs.push({ role: 'assistant', content: result.nextQuestion, stage: result.nextStage ?? answeringStage + 1 });
    }

    return msgs;
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isLoading || !isCollecting) return;

      setError(null);
      const answeringStage = collection.stage;
      const result = collection.handleAnswer(text.trim());
      if (!result.success) return;

      const updatedMessages = [...messages];
      if (result.justCompleted) {
        const finalMsgs = appendCollectionExchange(result, answeringStage, updatedMessages);
        setMessages(finalMsgs);
        await fetchMegaResponse(result.collected);
        return;
      }

      setMessages(appendCollectionExchange(result, answeringStage, updatedMessages));
    },
    [isLoading, isCollecting, collection, messages, fetchMegaResponse, appendCollectionExchange],
  );

  const handleChipSelect = useCallback(
    (chip) => {
      const inputType = collection.currentStep?.inputType;

      if (inputType === 'multi_chips_with_text' && chip !== CONFIRM_DIETARY) {
        collection.toggleChip(chip);
        return;
      }

      if (inputType === 'chips_only' || (inputType === 'chips_with_text' && collection.currentStep?.autoAdvance !== false)) {
        sendMessage(chip);
        return;
      }

      if (inputType === 'chips_with_text') {
        sendMessage(chip);
      }
    },
    [collection, sendMessage],
  );

  const handleDateSelect = useCallback(
    (isoDate) => {
      sendMessage(isoDate);
    },
    [sendMessage],
  );

  const handleTravelStyleConfirm = useCallback(async () => {
    const result = collection.confirmTravelStyle();
    if (!result.success) return;

    const answeringStage = collection.stage;
    const updatedMessages = [...messages];
    const finalMsgs = appendCollectionExchange(result, answeringStage, updatedMessages);
    setMessages(finalMsgs);
    await fetchMegaResponse(result.collected);
  }, [collection, messages, appendCollectionExchange, fetchMegaResponse]);

  const handleBack = useCallback(() => {
    const prev = collection.handleBack();
    if (!prev) return;
    setMessages(
      rebuildCollectionMessages({
        stepHistory: prev.stepHistory,
        tripData: prev.tripData,
        isComplete: false,
      }),
    );
  }, [collection]);

  const submitCollectionCards = useCallback(async () => {
    setError(null);
    const result = collection.submitFromCards();
    if (!result.success) {
      setCardValidationErrors(result.errors ?? {});
      return;
    }
    setCardValidationErrors({});
    await fetchMegaResponse(result.collected);
  }, [collection, fetchMegaResponse]);

  const retryLastMessage = useCallback(async () => {
    if (isLoading) return;
    setError(null);
    if (collection.tripData.destination) {
      await fetchMegaResponse(collection.tripData);
    }
  }, [isLoading, collection, fetchMegaResponse]);

  const toggleChecklistItem = useCallback((itemKey) => {
    setChecklistState((prev) => {
      const next = { ...prev, [itemKey]: !prev[itemKey] };
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const applyInspiration = useCallback((context) => {
    inspirationRef.current = context;
    collection.patchTripData({ destination: context.destination });
    collection.updateTravelStyleText(
      'mustSee',
      mergeMustSeeWithInspiration(null, context) ?? '',
    );
  }, [collection]);

  const resetChat = useCallback(() => {
    abortStream();
    inspirationRef.current = null;
    collection.resetCollection();
    setMessages([]);
    setTripData({ ...DEFAULT_TRIP_DATA, interests: [] });
    setStage(1);
    setChips([]);
    setError(null);
    setCardValidationErrors({});
    setChecklistState({});
    localStorage.removeItem(CHECKLIST_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, [collection, abortStream]);

  const stopStreaming = useCallback(() => {
    abortStream();
  }, [abortStream]);

  return {
    messages,
    tripData,
    stage: displayStage,
    isLoading,
    isStreamingPlan,
    chips: displayChips,
    error,
    collectionError: collection.collectionError,
    sendMessage,
    applyInspiration,
    handleChipSelect,
    handleDateSelect,
    handleTravelStyleConfirm,
    handleBack,
    resetChat,
    stopStreaming,
    retryLastMessage,
    toggleChecklistItem,
    checklistState,
    isCollecting,
    collectionStage: collection.stage,
    currentStep: collection.currentStep,
    currentStepId: collection.currentStepId,
    collectionDraft: collection.draft,
    toggleTravelStyle: collection.toggleTravelStyle,
    updateTravelStyleText: collection.updateTravelStyleText,
    setGroupSize: collection.setGroupSize,
    confirmGroupSize: collection.confirmGroupSize,
    collectionTripData: collection.tripData,
    sectionSummaries: collection.sectionSummaries,
    patchTripData: collection.patchTripData,
    patchDraft: collection.patchDraft,
    toggleDietaryChip: collection.toggleDietaryChip,
    submitCollectionCards,
    cardValidationErrors,
  };
}
