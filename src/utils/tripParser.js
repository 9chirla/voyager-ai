/**
 * @typedef {Object} ItineraryDay
 * @property {number} day - Day number (1-based)
 * @property {string} location - City or area name
 * @property {string} theme - Theme or focus for the day
 * @property {string} morning - Morning activity
 * @property {string} [morningWhy] - Why this activity is scheduled this day
 * @property {string} afternoon - Afternoon activity
 * @property {string} [afternoonWhy]
 * @property {string} evening - Evening activity
 * @property {string} [eveningWhy]
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string[]} issues
 */

/** Flexible whitespace-tolerant closed itinerary block. */
const ITINERARY_BLOCK_REGEX =
  /\s*##\s*ITINERARY_START\s*##([\s\S]*?)\s*##\s*ITINERARY_END\s*##/i;

/** Open itinerary block when END tag is missing (auto-continue partial). */
const ITINERARY_OPEN_REGEX =
  /\s*##\s*ITINERARY_START\s*##([\s\S]*)$/i;

/** Open insider tips block when END tag is missing. */
const INSIDER_TIPS_OPEN_REGEX =
  /\s*##\s*INSIDER_TIPS_START\s*##([\s\S]*)$/i;

/** Flexible whitespace-tolerant closed insider tips block. */
const INSIDER_TIPS_BLOCK_REGEX =
  /\s*##\s*INSIDER_TIPS_START\s*##([\s\S]*?)\s*##\s*INSIDER_TIPS_END\s*##/i;

/** Flexible whitespace-tolerant closed checklist block. */
const CHECKLIST_BLOCK_REGEX =
  /\s*##\s*CHECKLIST_START\s*##([\s\S]*?)\s*##\s*CHECKLIST_END\s*##/i;

/** Open checklist block when END tag is missing. */
const CHECKLIST_OPEN_REGEX =
  /\s*##\s*CHECKLIST_START\s*##([\s\S]*)$/i;

/** Flexible whitespace-tolerant chips block delimiters. */
const CHIPS_BLOCK_REGEX =
  /\s*##\s*CHIPS\s*##([\s\S]*?)\s*##\s*END_CHIPS\s*##/i;

/** Stage marker emitted by the AI at the end of each response. */
const STAGE_TAG_REGEX = /##STAGE##\d##END_STAGE##/g;

/** Shared day-header detector for streaming and fallback parsing. */
export const DAY_HEADER_DETECT_REGEX = /^\s*(?:#{1,3}\s+)?(?:\*{1,2})?DAY\s+\d+/i;

const CHECKLIST_START_INNER_REGEX = /\s*##\s*CHECKLIST_START\s*##/i;

const PACKING_SECTION_LABELS = ['PACKING', 'DOCUMENTS', 'CLOTHING', 'TOILETRIES', 'TECH'];
const BOOKING_SECTION_LABELS = ['BOOKING', 'BOOKINGS TO MAKE', 'BOOKINGS'];
const ALL_CHECKLIST_LABELS = [...PACKING_SECTION_LABELS, ...BOOKING_SECTION_LABELS];

/**
 * Normalize Windows and classic Mac line endings.
 * @param {string} text
 * @returns {string}
 */
export function normalizeLineEndings(text) {
  if (!text) return '';
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Strip markdown bold markers from a string.
 * @param {string} str
 * @returns {string}
 */
function stripBold(str) {
  return str.replace(/\*\*/g, '').trim();
}

/**
 * Extract a time-slot activity from an itinerary body segment.
 * @param {string} body - Text block following a day header
 * @param {string} slot - Time slot label (Morning, Afternoon, Evening)
 * @returns {string}
 */
function extractActivity(body, slot) {
  const lines = normalizeLineEndings(body).split('\n');
  for (const rawLine of lines) {
    const line = stripBold(rawLine.trim());
    const regex = new RegExp(`^[-•*]?\\s*${slot}\\s*:\\s*(.+)`, 'i');
    const match = line.match(regex);
    if (match) return match[1].trim();
  }
  return '';
}

/**
 * Split "Activity. Why today: reason" into parts for display.
 * @param {string} text
 * @returns {{ activity: string, whyToday: string }}
 */
export function splitActivityRationale(text) {
  if (!text) return { activity: '', whyToday: '' };
  const match = text.match(/^(.+?)\.\s*Why today:\s*(.+)$/i)
    || text.match(/^(.+?)\s+Why today:\s*(.+)$/i);
  if (match) {
    return { activity: match[1].trim(), whyToday: match[2].trim() };
  }
  return { activity: text, whyToday: '' };
}

/**
 * @param {string} body
 * @returns {Pick<ItineraryDay, 'morning'|'morningWhy'|'afternoon'|'afternoonWhy'|'evening'|'eveningWhy'>}
 */
function extractDaySlots(body) {
  const morning = splitActivityRationale(extractActivity(body, 'Morning'));
  const afternoon = splitActivityRationale(extractActivity(body, 'Afternoon'));
  const evening = splitActivityRationale(extractActivity(body, 'Evening'));
  return {
    morning: morning.activity,
    ...(morning.whyToday ? { morningWhy: morning.whyToday } : {}),
    afternoon: afternoon.activity,
    ...(afternoon.whyToday ? { afternoonWhy: afternoon.whyToday } : {}),
    evening: evening.activity,
    ...(evening.whyToday ? { eveningWhy: evening.whyToday } : {}),
  };
}

/**
 * Strip list/markdown prefixes from a day header line.
 * @param {string} line
 * @returns {string}
 */
function normalizeHeaderLine(line) {
  return stripBold(line.trim())
    .replace(/^#+\s*/, '')
    .replace(/^[-•*]\s+/, '')
    .trim();
}

/**
 * Split "Location — Theme" or "Location - Theme" tail after pipe.
 * @param {string} rest
 * @returns {{ location: string, theme: string } | null}
 */
function splitLocationThemeTail(rest) {
  const dashMatch = rest.match(/^([^—–-]+?)\s*[—–-]\s*(.+)$/);
  if (dashMatch) {
    return { location: dashMatch[1].trim(), theme: dashMatch[2].trim() };
  }
  return null;
}

/**
 * Parse a single day header line into structured fields.
 * @param {string} line - Raw header line
 * @returns {{ day: number, location: string, theme: string } | null}
 */
function parseDayHeaderLine(line) {
  const normalized = normalizeHeaderLine(line);
  if (!normalized) return null;

  // DAY N | Location: Theme  (pipe + colon format)
  let match = normalized.match(/^DAY\s+(\d+)\s*\|\s*([^:\n]+):\s*(.+)$/i);
  if (match) {
    return {
      day: parseInt(match[1], 10),
      location: match[2].trim(),
      theme: match[3].trim(),
    };
  }

  // DAY N | Location — Theme  (pipe + em/en dash — common model deviation)
  match = normalized.match(/^DAY\s+(\d+)\s*\|\s*(.+)$/i);
  if (match) {
    const split = splitLocationThemeTail(match[2].trim());
    if (split) {
      return {
        day: parseInt(match[1], 10),
        location: split.location,
        theme: split.theme,
      };
    }
  }

  // DAY N - Location: Theme  (dash before location)
  match = normalized.match(/^DAY\s+(\d+)\s*[-–—]\s*([^:\n]+):\s*(.+)$/i);
  if (match) {
    return {
      day: parseInt(match[1], 10),
      location: match[2].trim(),
      theme: match[3].trim(),
    };
  }

  // DAY N: Location — Theme  (colon + em/en dash format)
  match = normalized.match(/^DAY\s+(\d+)\s*:\s*([^—–\-\n]+?)\s*[—–-]\s*(.+)$/i);
  if (match) {
    return {
      day: parseInt(match[1], 10),
      location: match[2].trim(),
      theme: match[3].trim(),
    };
  }

  // DAY N: Theme or DAY N: Location — Theme (single colon remainder)
  match = normalized.match(/^DAY\s+(\d+)\s*:\s*(.+)$/i);
  if (match) {
    const rest = match[2].trim();
    const dashMatch = rest.match(/^([^—–-]+?)\s*[—–-]\s*(.+)$/);
    if (dashMatch) {
      return {
        day: parseInt(match[1], 10),
        location: dashMatch[1].trim(),
        theme: dashMatch[2].trim(),
      };
    }
    return {
      day: parseInt(match[1], 10),
      location: '',
      theme: rest,
    };
  }

  return null;
}

/**
 * Parse day entries from a block of itinerary text.
 * @param {string} block - Itinerary body (inside tags or full text for fallback)
 * @returns {ItineraryDay[]}
 */
export function parseDaysFromBlock(block) {
  const lines = normalizeLineEndings(block).split('\n');
  /** @type {ItineraryDay[]} */
  const days = [];
  /** @type {{ day: number, location: string, theme: string } | null} */
  let current = null;
  /** @type {string[]} */
  let bodyLines = [];

  for (const line of lines) {
    const header = parseDayHeaderLine(line);
    if (header) {
      if (current) {
        const body = bodyLines.join('\n');
        days.push({
          ...current,
          ...extractDaySlots(body),
        });
      }
      current = header;
      bodyLines = [];
    } else if (current) {
      bodyLines.push(line);
    }
  }

  if (current) {
    const body = bodyLines.join('\n');
    days.push({
      ...current,
      ...extractDaySlots(body),
    });
  }

  return days;
}

/**
 * Count day header lines in text for fallback parsing.
 * @param {string} text
 * @returns {number}
 */
function countDayLines(text) {
  const normalized = normalizeLineEndings(text);
  return normalized.split('\n').filter((line) => DAY_HEADER_DETECT_REGEX.test(line)).length;
}

/**
 * Remove day headers and Morning/Afternoon/Evening lines from free text.
 * @param {string} text
 * @returns {string}
 */
export function stripItineraryDayContent(text) {
  if (!text) return '';
  const lines = normalizeLineEndings(text).split('\n');
  /** @type {string[]} */
  const kept = [];
  let skippingDay = false;

  for (const line of lines) {
    const trimmed = stripBold(line.trim());

    if (DAY_HEADER_DETECT_REGEX.test(trimmed)) {
      skippingDay = true;
      continue;
    }

    if (skippingDay) {
      if (/^[-•*]?\s*(Morning|Afternoon|Evening)\s*:/i.test(trimmed)) continue;
      if (!trimmed) continue;
      if (/^##\s*/.test(trimmed)) {
        skippingDay = false;
      } else if (!/^[-•*]/.test(trimmed) && trimmed.length > 0) {
        skippingDay = false;
      } else {
        continue;
      }
    }

    if (/^##\s*ITINERARY/i.test(trimmed)) continue;
    if (/^##\s*ITINERARY_END/i.test(trimmed)) continue;

    kept.push(line);
  }

  return kept.join('\n').trim();
}

/**
 * @param {string} text
 * @returns {boolean}
 */
function looksLikeItinerary(text) {
  if (!text) return false;
  return countDayLines(text) >= 2
    || (DAY_HEADER_DETECT_REGEX.test(text) && /Morning\s*:/i.test(text));
}

/**
 * Remove tagged or untagged itinerary region from full response text.
 * @param {string} normalized
 * @param {{ hasTags: boolean, isClosed: boolean }} resolved
 * @param {boolean} parseSuccess
 * @returns {string}
 */
function removeItineraryFromText(normalized, resolved, parseSuccess) {
  if (!parseSuccess) return normalized.trim();

  if (resolved.hasTags && resolved.isClosed) {
    return normalized.replace(ITINERARY_BLOCK_REGEX, '').trim();
  }

  let text = normalized.replace(
    /##\s*ITINERARY_START\s*##[\s\S]*?(?=##\s*(?:ITINERARY_END|CHECKLIST_START|INSIDER_TIPS_START)\s*##)/i,
    '',
  );
  text = text.replace(/##\s*ITINERARY_END\s*##/gi, '');

  if (!resolved.hasTags) {
    text = stripItineraryDayContent(text);
  }

  return text.trim();
}

/**
 * Trim itinerary inner text at checklist or end markers.
 * @param {string} inner
 * @returns {string}
 */
function trimItineraryInner(inner) {
  let block = inner.replace(/\s*##\s*ITINERARY_END\s*##\s*/i, '').trim();
  const checklistIdx = block.search(CHECKLIST_START_INNER_REGEX);
  if (checklistIdx >= 0) {
    block = block.slice(0, checklistIdx).trim();
  }
  return block;
}

/**
 * Remove only itinerary tag lines, preserving inner content for chat display.
 * @param {string} text
 * @returns {string}
 */
function unwrapItineraryTags(text) {
  return normalizeLineEndings(text)
    .replace(/\s*##\s*ITINERARY_START\s*##\s*/i, '')
    .replace(/\s*##\s*ITINERARY_END\s*##\s*/i, '')
    .trim();
}

/**
 * Resolve itinerary inner block from closed, open, or untagged text.
 * @param {string} text
 * @returns {{ block: string, hasTags: boolean, isClosed: boolean } | null}
 */
function resolveItineraryBlock(text) {
  const normalized = normalizeLineEndings(text);
  const closed = normalized.match(ITINERARY_BLOCK_REGEX);
  if (closed) {
    return { block: closed[1].trim(), hasTags: true, isClosed: true };
  }

  const open = normalized.match(ITINERARY_OPEN_REGEX);
  if (open) {
    return { block: trimItineraryInner(open[1]), hasTags: true, isClosed: false };
  }

  if (countDayLines(normalized) >= 1) {
    const startMatch = normalized.match(/##\s*ITINERARY_START\s*##/i);
    if (startMatch) {
      const afterStart = normalized.slice(startMatch.index + startMatch[0].length);
      const inner = trimItineraryInner(afterStart);
      if (countDayLines(inner) >= 1) {
        return { block: inner, hasTags: true, isClosed: false };
      }
    }
  }

  if (countDayLines(normalized) >= 3) {
    return { block: normalized.trim(), hasTags: false, isClosed: false };
  }

  return null;
}

/**
 * Parse structured itinerary blocks from AI response text.
 * @param {string} text - Raw AI message content
 * @returns {{ days: ItineraryDay[], cleanedText: string, parseSuccess: boolean }}
 */
export function parseItinerary(text) {
  if (!text) {
    return { days: [], cleanedText: '', parseSuccess: false };
  }

  const normalized = normalizeLineEndings(text);
  const resolved = resolveItineraryBlock(normalized);

  if (!resolved) {
    return { days: [], cleanedText: normalized.trim(), parseSuccess: false };
  }

  const days = parseDaysFromBlock(resolved.block);
  const parseSuccess = days.length > 0;
  const cleanedText = removeItineraryFromText(normalized, resolved, parseSuccess);

  return { days, cleanedText, parseSuccess };
}

/**
 * Split a checklist section value into individual items.
 * @param {string} raw - Raw section content after label
 * @returns {string[]}
 */
function splitChecklistItems(raw) {
  if (!raw) return [];

  const trimmed = normalizeLineEndings(raw).trim();
  const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean);

  /** @type {string[]} */
  let items;

  if (lines.length > 1) {
    items = lines.map((line) => line.replace(/^[-•*]\s*/, '').trim());
  } else {
    items = trimmed.split(',').map((item) => item.trim());
  }

  return items.filter(Boolean);
}

/**
 * Build a lookahead alternation of checklist section labels.
 * @param {string} excludeLabel
 * @returns {string}
 */
function checklistLabelLookahead(excludeLabel) {
  return ALL_CHECKLIST_LABELS
    .filter((label) => label !== excludeLabel)
    .map((label) => label.replace(/\s+/g, '\\s+'))
    .join('|');
}

/**
 * Extract items for one checklist label.
 * @param {string} block
 * @param {string} label
 * @returns {string[]}
 */
function extractChecklistSectionByLabel(block, label) {
  const escaped = label.replace(/\s+/g, '\\s+');
  const lookahead = checklistLabelLookahead(label);
  const regex = new RegExp(
    `${escaped}\\s*:\\s*([\\s\\S]*?)(?=(?:${lookahead})\\s*:|$)`,
    'i',
  );
  const match = block.match(regex);
  if (!match) return [];
  return splitChecklistItems(match[1]);
}

/**
 * Extract packing and booking arrays, including subsection label aliases.
 * @param {string} block
 * @returns {{ packing: string[], booking: string[] }}
 */
function extractChecklistSections(block) {
  /** @type {string[]} */
  const packing = [];
  /** @type {string[]} */
  const booking = [];

  for (const label of PACKING_SECTION_LABELS) {
    packing.push(...extractChecklistSectionByLabel(block, label));
  }
  for (const label of BOOKING_SECTION_LABELS) {
    booking.push(...extractChecklistSectionByLabel(block, label));
  }

  return { packing, booking };
}

/**
 * Remove only checklist tag lines, preserving inner content for chat display.
 * @param {string} text
 * @returns {string}
 */
function unwrapChecklistTags(text) {
  return normalizeLineEndings(text)
    .replace(/\s*##\s*CHECKLIST_START\s*##\s*/i, '')
    .replace(/\s*##\s*CHECKLIST_END\s*##\s*/i, '')
    .trim();
}

/**
 * Resolve checklist inner block from closed or open tagged text.
 * @param {string} text
 * @returns {{ block: string, hasTags: boolean, isClosed: boolean } | null}
 */
function resolveChecklistBlock(text) {
  const normalized = normalizeLineEndings(text);
  const closed = normalized.match(CHECKLIST_BLOCK_REGEX);
  if (closed) {
    return { block: closed[1].trim(), hasTags: true, isClosed: true };
  }

  const open = normalized.match(CHECKLIST_OPEN_REGEX);
  if (open) {
    const inner = open[1].replace(/\s*##\s*CHECKLIST_END\s*##\s*/i, '').trim();
    return { block: inner, hasTags: true, isClosed: false };
  }

  return null;
}

/**
 * Parse structured checklist blocks from AI response text.
 * @param {string} text - Raw AI message content
 * @returns {{ packing: string[], booking: string[], cleanedText: string, parseSuccess: boolean }}
 */
export function parseChecklist(text) {
  if (!text) {
    return { packing: [], booking: [], cleanedText: '', parseSuccess: false };
  }

  const normalized = normalizeLineEndings(text);
  const resolved = resolveChecklistBlock(normalized);

  if (!resolved) {
    return { packing: [], booking: [], cleanedText: normalized.trim(), parseSuccess: false };
  }

  const { packing, booking } = extractChecklistSections(resolved.block);
  const parseSuccess = packing.length > 0 || booking.length > 0;

  let cleanedText;
  if (parseSuccess && resolved.isClosed) {
    cleanedText = normalized.replace(CHECKLIST_BLOCK_REGEX, '').trim();
  } else if (resolved.hasTags) {
    cleanedText = unwrapChecklistTags(normalized);
  } else {
    cleanedText = normalized.trim();
  }

  return { packing, booking, cleanedText, parseSuccess };
}

/**
 * Parse quick-reply chip options from AI response text.
 * @param {string} text - Raw AI message content
 * @returns {{ chips: string[], cleanedText: string }}
 */
export function parseChips(text) {
  if (!text) {
    return { chips: [], cleanedText: '' };
  }

  const normalized = normalizeLineEndings(text);
  const tagMatch = normalized.match(CHIPS_BLOCK_REGEX);

  if (!tagMatch) {
    return { chips: [], cleanedText: normalized.trim() };
  }

  const chips = tagMatch[1]
    .replace(/^\|+|\|+$/g, '')
    .split('|')
    .map((label) => label.trim())
    .map((label) => label.replace(/^\|+|\|+$/g, '').trim())
    .filter(Boolean);

  const cleanedText = normalized.replace(CHIPS_BLOCK_REGEX, '').trim();

  return { chips, cleanedText };
}

/**
 * Parse insider tips — must NOT contain the day-by-day itinerary.
 * @param {string} text
 * @returns {{ tips: string, cleanedText: string }}
 */
export function parseInsiderTips(text) {
  if (!text) return { tips: '', cleanedText: '' };

  const normalized = normalizeLineEndings(text);
  const closed = normalized.match(INSIDER_TIPS_BLOCK_REGEX);
  if (closed) {
    const tips = closed[1].replace(STAGE_TAG_REGEX, '').trim();
    return {
      tips,
      cleanedText: normalized.replace(INSIDER_TIPS_BLOCK_REGEX, '').trim(),
    };
  }

  const open = normalized.match(INSIDER_TIPS_OPEN_REGEX);
  if (open) {
    let tips = open[1]
      .replace(/\s*##\s*INSIDER_TIPS_END\s*##/i, '')
      .replace(STAGE_TAG_REGEX, '')
      .trim();
    if (looksLikeItinerary(tips)) tips = '';
    return {
      tips,
      cleanedText: normalized.replace(INSIDER_TIPS_OPEN_REGEX, '').trim(),
    };
  }

  const headingMatch = normalized.match(
    /(?:^|\n)\s*(?:#{1,3}\s*)?(?:\*\*)?Insider [Tt]ips:?(?:\*\*)?\s*\n([\s\S]*?)(?=\n##|\n##STAGE|$)/,
  );
  if (headingMatch) {
    let tips = stripItineraryDayContent(headingMatch[1].trim());
    tips = tips.replace(STAGE_TAG_REGEX, '').trim();
    if (tips && !looksLikeItinerary(tips)) {
      return {
        tips,
        cleanedText: normalized.replace(headingMatch[0], '').trim(),
      };
    }
  }

  let fallback = stripItineraryDayContent(normalized);
  fallback = fallback
    .replace(CHECKLIST_BLOCK_REGEX, '')
    .replace(/^\s*PACKING:.*$/gim, '')
    .replace(/^\s*BOOKING:.*$/gim, '')
    .replace(STAGE_TAG_REGEX, '')
    .trim();

  if (fallback && !looksLikeItinerary(fallback)) {
    return { tips: fallback, cleanedText: '' };
  }

  return { tips: '', cleanedText: normalized.trim() };
}

/**
 * Parse the AI-emitted stage marker from response text.
 * @param {string} text - Raw AI message content
 * @returns {{ stage: number|null, cleanedText: string }}
 */
export function parseStage(text) {
  const normalized = normalizeLineEndings(text);
  const match = normalized.match(/##STAGE##(\d)##END_STAGE##/);
  const stage = match ? parseInt(match[1], 10) : null;
  const cleanedText = normalized.replace(/##STAGE##\d##END_STAGE##/g, '').trim();
  return { stage, cleanedText };
}

/**
 * Strip all structured ##TAG## blocks from text.
 * @param {string} text - Raw message content
 * @returns {string}
 */
export function stripAllTags(text) {
  if (!text) return '';

  const normalized = normalizeLineEndings(text);
  return normalized
    .replace(ITINERARY_BLOCK_REGEX, '')
    .replace(CHECKLIST_BLOCK_REGEX, '')
    .replace(INSIDER_TIPS_BLOCK_REGEX, '')
    .replace(CHIPS_BLOCK_REGEX, '')
    .replace(STAGE_TAG_REGEX, '')
    .trim();
}

/**
 * Validate parsed trip data before showing the plan.
 * @param {object} tripData - Display tripData after parse
 * @param {{ expectedDayCount?: number, requireTips?: boolean }} [options]
 * @returns {ValidationResult}
 */
export function validateParsedOutput(tripData, options = {}) {
  /** @type {string[]} */
  const issues = [];
  const { expectedDayCount, requireTips = false } = options;

  if (!tripData?.itinerary?.length) {
    issues.push('no itinerary days parsed');
  } else {
    for (const day of tripData.itinerary) {
      const slots = [day.morning, day.afternoon, day.evening].filter(Boolean);
      if (slots.length === 0) {
        issues.push(`day ${day.day} has no activities`);
      }
    }

    if (expectedDayCount != null && tripData.itinerary.length < expectedDayCount) {
      issues.push(`expected ${expectedDayCount} days, got ${tripData.itinerary.length}`);
    }
  }

  const hasChecklist =
    (tripData?.checklist?.packing?.length ?? 0) > 0
    || (tripData?.checklist?.booking?.length ?? 0) > 0;
  if (!hasChecklist) {
    issues.push('checklist is empty');
  }

  if (requireTips && !tripData?.tips?.trim()) {
    issues.push('insider tips missing');
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Extract trip metadata from user messages for the summary panel.
 * @param {string} text - User message text
 * @param {object} current - Current tripData object
 * @returns {object} Partial tripData updates
 */
export function extractTripMetadata(text, current) {
  const updates = {};
  const lower = text.toLowerCase();

  if (!current.destination) {
    const destPatterns = [
      /(?:going to|visit|travel(?:ing)? to|trip to|dream(?:ing)? of)\s+(.+)/i,
      /^(.{2,40})$/i,
    ];
    for (const pattern of destPatterns) {
      const m = text.match(pattern);
      if (m && m[1].length > 2 && !/^(yes|no|sure|ok|hi|hello)$/i.test(m[1])) {
        updates.destination = m[1].replace(/[.!?]$/, '').trim();
        break;
      }
    }
  }

  if (!current.dates) {
    const datePatterns = [
      /(\d+\s*(?:days?|nights?))/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /(flexible|next month|next year|this summer|this winter)/i,
    ];
    for (const pattern of datePatterns) {
      if (pattern.test(text)) {
        updates.dates = text.trim();
        break;
      }
    }
  }

  if (!current.budget) {
    if (/backpacker|budget|cheap|shoestring/i.test(text)) updates.budget = 'Backpacker 🎒';
    else if (/mid[- ]?range|moderate|standard/i.test(text)) updates.budget = 'Mid-Range 🏨';
    else if (/luxury|premium|high[- ]?end|splurge/i.test(text)) updates.budget = 'Luxury 🌟';
    else if (/\$\d+|\€\d+|£\d+|usd|eur|gbp/i.test(text)) updates.budget = text.trim();
  }

  if (!current.interests?.length) {
    const interestMap = {
      culture: 'Culture 🏛️',
      food: 'Food 🍜',
      adventure: 'Adventure 🏔️',
      relaxation: 'Relaxation 🏖️',
      nightlife: 'Nightlife 🎉',
    };
    const found = [];
    for (const [key, label] of Object.entries(interestMap)) {
      if (lower.includes(key)) found.push(label);
    }
    if (found.length) updates.interests = found;
  }

  return updates;
}
