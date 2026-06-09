import {
  normalizeLineEndings,
  parseDaysFromBlock,
} from './tripParser.js';

/** Detect the start of a new day header in streaming buffer. */
const NEXT_DAY_HEADER_REGEX = new RegExp(
  `(?:^|\\n)\\s*(?:#{1,3}\\s+)?(?:\\*{1,2})?DAY\\s+\\d+`,
  'i',
);

const ITINERARY_START_REGEX = /##\s*ITINERARY_START\s*##/i;
const ITINERARY_END_REGEX = /##\s*ITINERARY_END\s*##/i;

/**
 * @typedef {Object} StreamParserState
 * @property {string} buffer - Raw text accumulated inside itinerary region
 * @property {number} lastEmittedDay - Highest day number already emitted
 * @property {'IDLE'|'IN_ITINERARY'|'PAST_ITINERARY'} phase
 */

/**
 * Create initial incremental parser state.
 * @returns {StreamParserState}
 */
export function createStreamParser() {
  return {
    buffer: '',
    lastEmittedDay: 0,
    phase: 'IDLE',
  };
}

/**
 * Emit days from buffer that are newly complete.
 * @param {StreamParserState} state
 * @param {string} buffer
 * @param {boolean} includePartialLast
 * @returns {{ state: StreamParserState, newDays: import('./tripParser.js').ItineraryDay[] }}
 */
function emitNewDaysFromBuffer(state, buffer, includePartialLast) {
  const days = parseDaysFromBlock(buffer);
  /** @type {import('./tripParser.js').ItineraryDay[]} */
  const newDays = [];

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    if (day.day <= state.lastEmittedDay) continue;

    const isLast = i === days.length - 1;
    if (isLast && !includePartialLast) continue;

    newDays.push(day);
    state.lastEmittedDay = Math.max(state.lastEmittedDay, day.day);
  }

  return { state, newDays };
}

/**
 * Feed one SSE token; returns newly completed days (0..n).
 * @param {StreamParserState} state
 * @param {string} token
 * @returns {{ state: StreamParserState, newDays: import('./tripParser.js').ItineraryDay[] }}
 */
export function feedStreamParser(state, token) {
  if (!token && state.phase !== 'IN_ITINERARY') {
    return { state, newDays: [] };
  }

  const chunk = normalizeLineEndings(token);

  if (state.phase === 'PAST_ITINERARY') {
    return { state, newDays: [] };
  }

  if (state.phase === 'IDLE') {
    state.buffer += chunk;
    if (!ITINERARY_START_REGEX.test(state.buffer)) {
      return { state, newDays: [] };
    }
    state.phase = 'IN_ITINERARY';
    state.buffer = state.buffer.replace(/^[\s\S]*?##\s*ITINERARY_START\s*##/i, '');
    return { state, newDays: [] };
  }

  state.buffer += chunk;

  if (ITINERARY_END_REGEX.test(state.buffer)) {
    const [beforeEnd] = state.buffer.split(ITINERARY_END_REGEX);
    const result = emitNewDaysFromBuffer(state, beforeEnd, true);
    state.phase = 'PAST_ITINERARY';
    state.buffer = '';
    return result;
  }

  const headerMatches = [...state.buffer.matchAll(
    new RegExp(`(?:^|\\n)(\\s*(?:#{1,3}\\s+)?(?:\\*{1,2})?DAY\\s+\\d+[^\\n]*)`, 'gi'),
  )];
  if (headerMatches.length >= 2) {
    const lastMatch = headerMatches[headerMatches.length - 1];
    const splitIdx = lastMatch.index ?? 0;
    const completeBuffer = state.buffer.slice(0, splitIdx);
    const result = emitNewDaysFromBuffer(state, completeBuffer, true);
    state.buffer = state.buffer.slice(splitIdx);
    return result;
  }

  return { state, newDays: [] };
}

/**
 * Flush remaining buffer at stream end.
 * @param {StreamParserState} state
 * @returns {{ state: StreamParserState, newDays: import('./tripParser.js').ItineraryDay[] }}
 */
export function flushStreamParser(state) {
  if (state.phase !== 'IN_ITINERARY' || !state.buffer.trim()) {
    return { state, newDays: [] };
  }

  const result = emitNewDaysFromBuffer(state, state.buffer, true);
  state.phase = 'PAST_ITINERARY';
  state.buffer = '';
  return result;
}
