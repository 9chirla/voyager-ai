import { describe, it, expect } from 'vitest';
import {
  createStreamParser,
  feedStreamParser,
  flushStreamParser,
} from './streamParser.js';

describe('streamParser', () => {
  it('emits day 1 when day 2 header appears', () => {
    let state = createStreamParser();
    const tokens = [
      '##ITINERARY_START##\n',
      'DAY 1 | Tokyo: Temples\n- Morning: Senso-ji\n',
      'DAY 2 | Tokyo: Modern\n',
    ];

    /** @type {import('./tripParser.js').ItineraryDay[]} */
    let emitted = [];
    for (const token of tokens) {
      const result = feedStreamParser(state, token);
      state = result.state;
      emitted = emitted.concat(result.newDays);
    }

    expect(emitted).toHaveLength(1);
    expect(emitted[0].day).toBe(1);
    expect(emitted[0].morning).toBe('Senso-ji');
  });

  it('flushes final day at stream end', () => {
    let state = createStreamParser();
    const chunk = '##ITINERARY_START##\nDAY 1 | Rome: History\n- Morning: Colosseum\n';
    const fed = feedStreamParser(state, chunk);
    state = fed.state;

    const flushed = flushStreamParser(state);
    expect(flushed.newDays).toHaveLength(1);
    expect(flushed.newDays[0].location).toBe('Rome');
  });

  it('does not emit duplicate days', () => {
    let state = createStreamParser();
    const chunk = '##ITINERARY_START##\nDAY 1 | Tokyo: A\n- Morning: x\n';
    let result = feedStreamParser(state, chunk);
    state = result.state;
    result = feedStreamParser(state, '\n- Afternoon: y\n');
    state = result.state;

    expect(result.newDays).toHaveLength(0);
  });

  it('handles empty feed without throwing', () => {
    const state = createStreamParser();
    expect(feedStreamParser(state, '').newDays).toEqual([]);
  });
});
