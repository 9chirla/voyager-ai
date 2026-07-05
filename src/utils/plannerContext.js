export const FACT_CONTEXT_KEY = 'voyager-fact-context';

/**
 * @typedef {object} PlannerInspirationContext
 * @property {'seasonal'|'live-event'|'destination-explorer'|'manual'} source
 * @property {string[]} [mustSeeItems]
 * @property {string} title
 * @property {string} location
 * @property {string} description
 * @property {string} destination
 * @property {string} [category]
 * @property {string} [eventDate]
 */

/**
 * @param {object} item
 * @returns {PlannerInspirationContext}
 */
export function buildSeasonalContext(item) {
  return {
    source: 'seasonal',
    title: item.title,
    location: item.location,
    description: item.description,
    destination: item.ctaDestination,
    category: item.category,
  };
}

/**
 * @param {object} event
 * @param {(date: string) => string} formatDate
 * @returns {PlannerInspirationContext}
 */
/**
 * @param {import('../data/destinations.js').Destination} destination
 * @returns {PlannerInspirationContext}
 */
export function buildDestinationExplorerContext(destination) {
  const mustSeeItems = destination.attractions.map((a) => a.name);
  return {
    source: 'destination-explorer',
    title: destination.country,
    location: destination.country,
    description: `${destination.tagline}. Ideal trip: ${destination.duration.label}.`,
    destination: destination.country,
    mustSeeItems,
  };
}

export function buildLiveEventContext(event, formatDate) {
  const dateLabel = formatDate(event.localDate);
  return {
    source: 'live-event',
    title: event.name,
    location: `${event.city}, ${event.country}`,
    description: `Live event on ${dateLabel}. Plan a trip around attending "${event.name}" in ${event.city}.`,
    destination: `${event.city}, ${event.country}`,
    eventDate: event.localDate,
  };
}

/**
 * @param {PlannerInspirationContext} ctx
 * @returns {string}
 */
export function formatInspirationBlock(ctx) {
  const eyebrows = {
    'live-event': '🎫 **Live event**',
    seasonal: '✨ **Seasonal phenomenon**',
    'destination-explorer': '🌍 **Destination pick**',
    manual: '✈️ **Trip inspiration**',
  };
  const eyebrow = eyebrows[ctx.source] ?? eyebrows.manual;
  const category = ctx.category
    ? `\n_${ctx.category.replace(/-/g, ' ')}_`
    : '';
  const dateLine = ctx.eventDate ? `\n📅 ${ctx.eventDate}` : '';

  return [
    eyebrow + category,
    '',
    `**${ctx.title}**`,
    ctx.location + dateLine,
    '',
    ctx.description,
    ...(ctx.mustSeeItems?.length
      ? ['', `**Must see:** ${ctx.mustSeeItems.join(', ')}`]
      : []),
    '',
    '_Destination pre-filled below — edit if you like, then send._',
  ].join('\n');
}

/**
 * @param {PlannerInspirationContext} ctx
 * @returns {string}
 */
export function formatInspirationForPrompt(ctx) {
  const labels = {
    'live-event': 'Live event inspiration',
    seasonal: 'Seasonal phenomenon inspiration',
    'destination-explorer': 'Destination explorer pick',
    manual: 'Trip inspiration',
  };
  const label = labels[ctx.source] ?? labels.manual;
  const mustSeeLine = ctx.mustSeeItems?.length
    ? `Must see: ${ctx.mustSeeItems.join(', ')}`
    : '';
  return [
    `${label}: ${ctx.title} (${ctx.location})`,
    ctx.description,
    mustSeeLine,
    `Suggested destination: ${ctx.destination}`,
  ].filter(Boolean).join(' — ');
}

/**
 * @param {string|null} raw
 * @param {string} fallbackDestination
 * @returns {PlannerInspirationContext}
 */
export function parseStoredContext(raw, fallbackDestination) {
  if (!raw) {
    return {
      source: 'manual',
      title: fallbackDestination,
      location: fallbackDestination,
      description: '',
      destination: fallbackDestination,
    };
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.destination) return parsed;
  } catch {
    // fall through
  }

  return {
    source: 'manual',
    title: fallbackDestination,
    location: fallbackDestination,
    description: '',
    destination: fallbackDestination,
  };
}

/**
 * @param {string|null|undefined} existing
 * @param {PlannerInspirationContext|null} inspiration
 * @returns {string|null}
 */
export function mergeMustSeeWithInspiration(existing, inspiration) {
  if (!inspiration) return existing?.trim() || null;
  const insp = formatInspirationForPrompt(inspiration);
  const prior = existing?.trim();
  return prior ? `${insp}\n\n${prior}` : insp;
}
