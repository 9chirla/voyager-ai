import { describe, it, expect } from 'vitest';
import {
  parseItinerary,
  parseChecklist,
  parseChips,
  parseStage,
  stripAllTags,
  extractTripMetadata,
  validateParsedOutput,
  normalizeLineEndings,
} from './tripParser.js';

const STANDARD_ITINERARY_BLOCK = `
##ITINERARY_START##
DAY 1 | Tokyo: Temples & Tradition
- Morning: Visit Senso-ji Temple
- Afternoon: Explore Ueno Park
- Evening: Dinner in Shibuya
##ITINERARY_END##
`.trim();

const THREE_DAY_UNTAGGED = `
DAY 1 | Tokyo: Temples
- Morning: Senso-ji
- Afternoon: Ueno Park
- Evening: Shibuya ramen
DAY 2 | Tokyo: Modern
- Morning: TeamLab
- Afternoon: Harajuku
- Evening: Izakaya
DAY 3 | Kyoto: Culture
- Morning: Fushimi Inari
- Afternoon: Gion walk
- Evening: Kaiseki dinner
`.trim();

describe('parseItinerary', () => {
  it('parses standard format with all three time slots correctly', () => {
    const text = `Here is your plan!\n${STANDARD_ITINERARY_BLOCK}\nEnjoy!`;
    const result = parseItinerary(text);

    expect(result.parseSuccess).toBe(true);
    expect(result.days).toHaveLength(1);
    expect(result.days[0]).toEqual({
      day: 1,
      location: 'Tokyo',
      theme: 'Temples & Tradition',
      morning: 'Visit Senso-ji Temple',
      afternoon: 'Explore Ueno Park',
      evening: 'Dinner in Shibuya',
    });
    expect(result.cleanedText).toBe('Here is your plan!\nEnjoy!');
  });

  it('attempts best-effort parse when tags are missing but 3+ DAY lines exist', () => {
    const result = parseItinerary(THREE_DAY_UNTAGGED);

    expect(result.days).toHaveLength(3);
    expect(result.days[0].day).toBe(1);
    expect(result.days[1].day).toBe(2);
    expect(result.days[2].day).toBe(3);
    expect(result.days[0].morning).toBe('Senso-ji');
    expect(result.parseSuccess).toBe(true);
    expect(result.cleanedText).toBe(THREE_DAY_UNTAGGED);
  });

  it('parses bold markdown in day headers', () => {
    const text = `
##ITINERARY_START##
**DAY 1** | Paris: Art & Culture
- Morning: Louvre
- Afternoon: Musée d'Orsay
- Evening: Seine cruise
##ITINERARY_END##
`.trim();

    const result = parseItinerary(text);

    expect(result.parseSuccess).toBe(true);
    expect(result.days[0]).toMatchObject({
      day: 1,
      location: 'Paris',
      theme: 'Art & Culture',
      morning: 'Louvre',
    });
  });

  it('handles extra whitespace around tags', () => {
    const text = `
  ##  ITINERARY_START  ##
  DAY 1 | Rome: History
  - Morning: Colosseum
  - Afternoon: Forum
  - Evening: Trastevere
  ##  ITINERARY_END  ##
`.trim();

    const result = parseItinerary(text);

    expect(result.parseSuccess).toBe(true);
    expect(result.days).toHaveLength(1);
    expect(result.days[0].location).toBe('Rome');
    expect(result.cleanedText).toBe('');
  });

  it('returns empty result for empty string input', () => {
    expect(parseItinerary('')).toEqual({
      days: [],
      cleanedText: '',
      parseSuccess: false,
    });
  });

  it('returns parseSuccess false when fewer than 3 day lines and no tags', () => {
    const text = 'DAY 1 | Tokyo: Solo day\n- Morning: Coffee';
    const result = parseItinerary(text);

    expect(result.days).toEqual([]);
    expect(result.parseSuccess).toBe(false);
    expect(result.cleanedText).toBe(text);
  });

  it('parses open itinerary block without END tag', () => {
    const text = `
##ITINERARY_START##
DAY 1 | Rome: History
- Morning: Colosseum
- Afternoon: Forum
- Evening: Trastevere
`.trim();

    const result = parseItinerary(text);

    expect(result.parseSuccess).toBe(true);
    expect(result.days).toHaveLength(1);
    expect(result.days[0].location).toBe('Rome');
  });

  it('handles Windows CRLF line endings', () => {
    const text = '##ITINERARY_START##\r\nDAY 1 | Tokyo: Theme\r\n- Morning: Coffee\r\n##ITINERARY_END##';
    const result = parseItinerary(text);

    expect(result.parseSuccess).toBe(true);
    expect(result.days[0].morning).toBe('Coffee');
  });

  it('parses DAY N: Location — Theme header format', () => {
    const text = `
##ITINERARY_START##
DAY 1: Marrakech — Markets
- Morning: Souks
- Afternoon: Bahia Palace
- Evening: Jemaa el-Fnaa
##ITINERARY_END##
`.trim();

    const result = parseItinerary(text);

    expect(result.parseSuccess).toBe(true);
    expect(result.days[0]).toMatchObject({
      day: 1,
      location: 'Marrakech',
      theme: 'Markets',
    });
  });

  it('parses DAY N - Location: Theme dash header format', () => {
    const text = `
##ITINERARY_START##
DAY 2 - Kyoto: Temples
- Morning: Fushimi Inari
##ITINERARY_END##
`.trim();

    const result = parseItinerary(text);

    expect(result.days[0]).toMatchObject({
      day: 2,
      location: 'Kyoto',
      theme: 'Temples',
    });
  });

  it('parses DAY N | Location — Theme pipe em-dash format', () => {
    const text = `
##ITINERARY_START##
DAY 1 | Marrakech — Medina & Souks
- Morning: Explore the souks
- Afternoon: Bahia Palace
- Evening: Jemaa el-Fnaa
DAY 2 | Marrakech — Gardens & Palaces
- Morning: Majorelle Garden
- Afternoon: Yves Saint Laurent Museum
- Evening: Rooftop dinner
##ITINERARY_END##
`.trim();

    const result = parseItinerary(text);

    expect(result.parseSuccess).toBe(true);
    expect(result.days).toHaveLength(2);
    expect(result.days[0]).toMatchObject({
      day: 1,
      location: 'Marrakech',
      theme: 'Medina & Souks',
      morning: 'Explore the souks',
    });
  });

  it('parses markdown-prefixed day headers and bold time slots', () => {
    const text = `
##ITINERARY_START##
### DAY 1 | Marrakech: Arrival
**Morning:** Airport transfer and riad check-in
**Afternoon:** Relax at the riad pool
**Evening:** Dinner in the medina
##ITINERARY_END##
`.trim();

    const result = parseItinerary(text);

    expect(result.parseSuccess).toBe(true);
    expect(result.days[0]).toMatchObject({
      day: 1,
      location: 'Marrakech',
      theme: 'Arrival',
      morning: 'Airport transfer and riad check-in',
      afternoon: 'Relax at the riad pool',
      evening: 'Dinner in the medina',
    });
  });

  it('stops open itinerary block at checklist start', () => {
    const text = `
##ITINERARY_START##
DAY 1 | Marrakech: Arrival
- Morning: Souks
##CHECKLIST_START##
PACKING: scarf
##CHECKLIST_END##
`.trim();

    const result = parseItinerary(text);

    expect(result.parseSuccess).toBe(true);
    expect(result.days).toHaveLength(1);
    expect(result.days[0].location).toBe('Marrakech');
  });
});

describe('parseChecklist', () => {
  it('parses comma-separated items correctly', () => {
    const text = `
##CHECKLIST_START##
PACKING: passport, sunscreen, light jacket
BOOKING: flights, hotel, JR Pass
##CHECKLIST_END##
`.trim();

    const result = parseChecklist(text);

    expect(result.parseSuccess).toBe(true);
    expect(result.packing).toEqual(['passport', 'sunscreen', 'light jacket']);
    expect(result.booking).toEqual(['flights', 'hotel', 'JR Pass']);
    expect(result.cleanedText).toBe('');
  });

  it('parses newline-separated items correctly', () => {
    const text = `
##CHECKLIST_START##
PACKING:
- passport
- jacket, waterproof
- adapter
BOOKING:
- flights
- hotel
##CHECKLIST_END##
`.trim();

    const result = parseChecklist(text);

    expect(result.parseSuccess).toBe(true);
    expect(result.packing).toEqual(['passport', 'jacket, waterproof', 'adapter']);
    expect(result.booking).toEqual(['flights', 'hotel']);
  });

  it('skips empty items and trims whitespace', () => {
    const text = `
##CHECKLIST_START##
PACKING:  passport ,  , sunscreen ,  adapter
BOOKING: flights
##CHECKLIST_END##
`.trim();

    const result = parseChecklist(text);

    expect(result.packing).toEqual(['passport', 'sunscreen', 'adapter']);
    expect(result.booking).toEqual(['flights']);
  });

  it('returns empty arrays and parseSuccess false when tags are missing', () => {
    const text = 'PACKING: passport, sunscreen';
    const result = parseChecklist(text);

    expect(result.packing).toEqual([]);
    expect(result.booking).toEqual([]);
    expect(result.parseSuccess).toBe(false);
    expect(result.cleanedText).toBe(text);
  });

  it('folds DOCUMENTS and TECH subsections into packing', () => {
    const text = `
##CHECKLIST_START##
DOCUMENTS: passport, visa
TECH: phone charger, adapter
BOOKING: flights
##CHECKLIST_END##
`.trim();

    const result = parseChecklist(text);

    expect(result.parseSuccess).toBe(true);
    expect(result.packing).toEqual(['passport', 'visa', 'phone charger', 'adapter']);
    expect(result.booking).toEqual(['flights']);
  });

  it('accepts checklist with packing only and no booking section', () => {
    const text = `
##CHECKLIST_START##
PACKING: passport, sunscreen
##CHECKLIST_END##
`.trim();

    const result = parseChecklist(text);

    expect(result.parseSuccess).toBe(true);
    expect(result.packing).toEqual(['passport', 'sunscreen']);
    expect(result.booking).toEqual([]);
  });
});

describe('parseChips', () => {
  it('parses standard pipe-separated chips', () => {
    const text = 'Pick one:\n##CHIPS## Surprise me ✨ | Japan 🇯🇵 | Italy 🇮🇹 ##END_CHIPS##';
    const result = parseChips(text);

    expect(result.chips).toEqual(['Surprise me ✨', 'Japan 🇯🇵', 'Italy 🇮🇹']);
    expect(result.cleanedText).toBe('Pick one:');
  });

  it('ignores leading and trailing pipes', () => {
    const text = '##CHIPS## | Option A | Option B | ##END_CHIPS##';
    const result = parseChips(text);

    expect(result.chips).toEqual(['Option A', 'Option B']);
  });

  it('trims whitespace from chip labels', () => {
    const text = '##CHIPS##  Backpacker 🎒  |  Mid-Range 🏨  |  Luxury 🌟  ##END_CHIPS##';
    const result = parseChips(text);

    expect(result.chips).toEqual(['Backpacker 🎒', 'Mid-Range 🏨', 'Luxury 🌟']);
  });

  it('returns empty chips and original text when no tag is present', () => {
    const text = '  Just a normal message  ';
    const result = parseChips(text);

    expect(result.chips).toEqual([]);
    expect(result.cleanedText).toBe('Just a normal message');
  });
});

describe('parseStage', () => {
  it('extracts stage number and removes the tag from cleanedText', () => {
    const text = 'Great choice! When are you thinking of going?\n##STAGE##2##END_STAGE##';
    const result = parseStage(text);

    expect(result.stage).toBe(2);
    expect(result.cleanedText).toBe('Great choice! When are you thinking of going?');
  });

  it('returns null stage when tag is missing', () => {
    const text = '  No stage tag here  ';
    const result = parseStage(text);

    expect(result.stage).toBeNull();
    expect(result.cleanedText).toBe('No stage tag here');
  });

  it('removes multiple stage tags from cleanedText', () => {
    const text = 'Hello ##STAGE##1##END_STAGE## world ##STAGE##2##END_STAGE##';
    const result = parseStage(text);

    expect(result.stage).toBe(1);
    expect(result.cleanedText).toBe('Hello  world');
  });
});

describe('stripAllTags', () => {
  it('removes all tag types including stage from a mixed string', () => {
    const text = `
Hello!
##ITINERARY_START##
DAY 1 | Tokyo: Theme
- Morning: Activity
##ITINERARY_END##
##CHECKLIST_START##
PACKING: passport
BOOKING: flights
##CHECKLIST_END##
##CHIPS## Yes | No ##END_CHIPS##
##STAGE##5##END_STAGE##
Goodbye!
`.trim();

    const result = stripAllTags(text);

    expect(result).toBe('Hello!\n\nGoodbye!');
    expect(result).not.toContain('ITINERARY');
    expect(result).not.toContain('CHECKLIST');
    expect(result).not.toContain('CHIPS');
    expect(result).not.toContain('STAGE');
  });

  it('returns string unchanged when no tags are present', () => {
    const text = 'Plain conversational text.';
    expect(stripAllTags(text)).toBe(text);
  });

  it('removes each tag type independently', () => {
    const itineraryOnly = 'Hi ##ITINERARY_START##DAY 1 | X: Y\n- Morning: Z##ITINERARY_END## bye';
    expect(stripAllTags(itineraryOnly)).toBe('Hi bye');

    const checklistOnly = 'Hi ##CHECKLIST_START##PACKING: a##CHECKLIST_END## bye';
    expect(stripAllTags(checklistOnly)).toBe('Hi bye');

    const chipsOnly = 'Hi ##CHIPS## A | B ##END_CHIPS## bye';
    expect(stripAllTags(chipsOnly)).toBe('Hi bye');

    const stageOnly = 'Hi ##STAGE##3##END_STAGE## bye';
    expect(stripAllTags(stageOnly)).toBe('Hi  bye');
  });
});

describe('validateParsedOutput', () => {
  it('returns valid for complete plan', () => {
    const tripData = {
      itinerary: [{
        day: 1, location: 'Tokyo', theme: 'T', morning: 'a', afternoon: 'b', evening: 'c',
      }],
      checklist: { packing: ['passport'], booking: ['flights'] },
      tips: 'Tip one',
    };
    expect(validateParsedOutput(tripData)).toEqual({ valid: true, issues: [] });
  });

  it('flags missing itinerary and checklist', () => {
    const result = validateParsedOutput({ itinerary: [], checklist: { packing: [], booking: [] } });
    expect(result.valid).toBe(false);
    expect(result.issues).toContain('no itinerary days parsed');
    expect(result.issues).toContain('checklist is empty');
  });

  it('flags day count mismatch as soft issue', () => {
    const tripData = {
      itinerary: [{ day: 1, location: 'X', theme: 'Y', morning: 'a', afternoon: '', evening: '' }],
      checklist: { packing: ['a'], booking: [] },
    };
    const result = validateParsedOutput(tripData, { expectedDayCount: 5 });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes('expected 5'))).toBe(true);
  });
});

describe('normalizeLineEndings', () => {
  it('converts CRLF to LF', () => {
    expect(normalizeLineEndings('a\r\nb')).toBe('a\nb');
  });
});

describe('extractTripMetadata', () => {
  const emptyCurrent = {
    destination: '',
    dates: '',
    budget: '',
    interests: [],
  };

  it('extracts destination from a short reply', () => {
    expect(extractTripMetadata('Japan', emptyCurrent)).toEqual({
      destination: 'Japan',
    });
  });

  it('extracts budget tier keywords', () => {
    const current = { ...emptyCurrent, destination: 'Japan' };
    expect(extractTripMetadata('luxury please', current)).toEqual({
      budget: 'Luxury 🌟',
    });
  });

  it('extracts multiple interests', () => {
    const current = { ...emptyCurrent, destination: 'Japan' };
    expect(extractTripMetadata('culture and food', current)).toEqual({
      interests: ['Culture 🏛️', 'Food 🍜'],
    });
  });

  it('does not overwrite fields that are already set', () => {
    const current = { ...emptyCurrent, destination: 'Italy' };
    expect(extractTripMetadata('Japan', current)).toEqual({});
  });
});
