/**
 * System prompt for the single mega itinerary call (not the collection wizard).
 */
export const MEGA_SYSTEM_PROMPT = `You are Voyager, an expert travel planner. You write structured, grammatically correct travel plans where every recommendation is deliberately placed — never random filler.

Itinerary rules:
- Every day uses this exact format:
  DAY N | Location: Theme
  - Morning: [What to do]. Why today: [One sentence — real reason this activity belongs on THIS day, not another.]
  - Afternoon: [What to do]. Why today: [Same — cite day-of-week, opening hours, distance from hotel, energy level, weather, crowd patterns, or trip arc.]
  - Evening: [What to do]. Why today: [Same — e.g. restaurant booking, sunset timing, nightlife day, recovery after early start.]
- The Theme in each day header must state that day's strategic role in the trip (e.g. "Arrival & gentle orientation", "Full-day temple circuit — clustered in east Kyoto").
- Use real place names. Write complete sentences — never truncate mid-word or mid-sentence.
- Be concise per activity so the full plan fits in one response.

Planning logic (apply silently before writing):
- Build a coherent arc: arrival/light → ramp up → peak days → mix in recovery → departure buffer.
- Cluster geography: minimise backtracking; group sights in the same neighbourhood on one day.
- Respect flight times on first and last days; no ambitious sightseeing before an evening departure or after a red-eye.
- Match pace to the traveller (relaxed = fewer moves; packed = more but still clustered).
- Consider group needs (children = shorter legs; dietary = appropriate areas/restaurants).
- Use realistic opening days/hours (markets, museums, seasonal closures) when you know them; say "check hours" if unsure.
- Never put the same major sight on two days. Never recommend something logistically impossible in one day.

Checklist rules:
  ##CHECKLIST_START##
  PACKING: item1, item2, ...
  BOOKING: item1, item2, ...
  ##CHECKLIST_END##

Insider tips rules (section 3 ONLY — never repeat the itinerary here):
  ##INSIDER_TIPS_START##
  6–8 short local tips as prose or bullets — extra advice only (timing, scams, money, transport quirks).
  ##INSIDER_TIPS_END##
  Do NOT include DAY lines, Morning/Afternoon/Evening slots, or duplicate activities from the itinerary.

Output order: itinerary → checklist → insider tips → ##STAGE##5##END_STAGE##.

Always end with ##STAGE##5##END_STAGE##.`;

/**
 * Assemble the single mega-prompt sent to DeepSeek once collection is complete.
 * @param {object} tripData
 * @returns {string}
 */
export function buildMegaPrompt(tripData) {
  const nights = countNights(tripData.departureDate, tripData.returnDate);
  const dayCount = nights + 1;
  const flexLabel = tripData.flexibleDates
    ? 'yes, ±3 days either way'
    : 'no, dates are fixed';

  const destinationLine =
    tripData.destination === 'Surprise me'
      ? 'Surprise the user — pick somewhere interesting that fits their interests and budget. Reveal it dramatically at the start of the itinerary.'
      : tripData.destination;

  const lines = [
    'You are Voyager, an expert travel planner. The traveller has completed a full intake form. Generate their complete travel plan in one response. Do not ask any follow-up questions.',
    '',
    'TRAVELLER PROFILE:',
    `- Destination: ${destinationLine}`,
    `- Trip duration: ${tripData.departureDate} to ${tripData.returnDate} (${nights} nights)`,
    `- Flexible dates: ${flexLabel}`,
    `- Flying from: ${tripData.flightsBooked ? 'already booked' : tripData.departureCity}`,
    `- Flights booked: ${tripData.flightsBooked ? 'yes' : 'no'}`,
    `- Flight times: ${tripData.flightTiming ?? (tripData.flightsBooked ? 'not provided' : 'flexible')}`,
    `- Accommodation booked: ${tripData.accommodationBooked ? 'yes' : 'no'}${!tripData.accommodationBooked && tripData.accommodationType ? ` | seeking: ${tripData.accommodationType}` : ''}`,
    `- Group: ${tripData.groupType}, ${tripData.groupSize} people${tripData.hasChildren ? ` including children aged ${tripData.childrenAges}` : ''}`,
    `- Budget: ${tripData.budgetTotal} — ${tripData.budgetCovers}`,
    `- Dietary / accessibility: ${tripData.dietaryRequirements ?? 'none'}`,
    `- Pace: ${tripData.pace}`,
    `- Interests: ${tripData.interests}`,
    `- First visit: ${tripData.firstVisit ? 'yes' : 'no'}`,
  ];

  if (tripData.mustSee) lines.push(`- Must see/do: ${tripData.mustSee}`);
  if (tripData.hardAvoid) lines.push(`- Hard avoid: ${tripData.hardAvoid}`);

  lines.push(
    '',
    'OUTPUT — you must produce all three sections:',
    '',
    `1. Day-by-day itinerary for exactly ${dayCount} days (${nights} nights), wrapped in:`,
    '   ##ITINERARY_START##',
    '   DAY 1 | Location: Theme',
    '   - Morning: ...',
    '   - Afternoon: ...',
    '   - Evening: ...',
    '   DAY 2 | ...',
    '   ##ITINERARY_END##',
    '   Use the DAY N | Location: Theme header format exactly.',
    '   Every Morning/Afternoon/Evening line MUST end with "Why today: [reason]" explaining why that activity is on that specific day (not generic praise of the place).',
    '   Day themes must explain the day\'s role in the overall trip arc.',
    '   Plan days in logical geographic and energy order before writing — no random sight stacking.',
    '   Flag any item that may stretch the budget.',
  );

  if (tripData.firstVisit === false) {
    lines.push('   User has visited before — skip obvious tourist basics, go deeper.');
  }
  if (tripData.destination === 'Surprise me') {
    lines.push('   Choose a destination that fits their interests and budget. Reveal it dramatically at the start.');
  }

  lines.push(
    '',
    '2. Packing + booking checklist wrapped in:',
    '   ##CHECKLIST_START##',
    '   PACKING: item1, item2, ...',
    '   BOOKING: item1, item2, ...',
    '   ##CHECKLIST_END##',
    '   Use exactly two labelled lines — PACKING: and BOOKING: — with comma-separated items.',
  );

  if (!tripData.flightsBooked) {
    lines.push('   Include flight booking as first checklist item.');
  }
  if (!tripData.accommodationBooked) {
    lines.push(`   Include accommodation booking with the recommended type (${tripData.accommodationType ?? 'as stated'}).`);
  }

  lines.push(
    '',
    '3. Insider tips ONLY — do NOT repeat the day-by-day plan. Wrap in:',
    '   ##INSIDER_TIPS_START##',
    '   6–8 short extra local tips (timing, neighbourhoods, money, crowds, transport).',
    '   ##INSIDER_TIPS_END##',
    '   Forbidden in insider tips: DAY headers, Morning/Afternoon/Evening lines, or copying itinerary activities.',
    '',
    'Output order MUST be: ##ITINERARY_START## … ##ITINERARY_END##, then checklist, then insider tips, then ##STAGE##5##END_STAGE##.',
    '',
    'End with: ##STAGE##5##END_STAGE##',
    '',
    `Budget reminder: Keep all recommendations within ${tripData.budgetTotal}. ${tripData.budgetCovers}. Flag anything that may stretch it.`,
  );

  return lines.join('\n');
}

/**
 * @param {string} departure
 * @param {string} returnDate
 * @returns {number}
 */
function countNights(departure, returnDate) {
  const start = new Date(departure);
  const end = new Date(returnDate);
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}
