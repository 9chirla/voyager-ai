import { FACT_CONTEXT_KEY } from './plannerContext';

export const FACT_DESTINATION_KEY = 'voyager-fact-destination';

/**
 * Route inspiration context into the trip planner.
 * @param {import('./plannerContext').PlannerInspirationContext | string} context
 * @param {{
 *   pathname: string,
 *   isCollecting: boolean,
 *   navigate: (path: string) => void,
 * }} ctx
 */
export function sendToPlanner(context, { pathname, isCollecting, navigate }) {
  const payload = typeof context === 'string'
    ? {
        source: 'manual',
        title: context,
        location: context,
        description: '',
        destination: context,
      }
    : context;

  const onApp = pathname === '/app' || pathname.endsWith('/app');

  if (onApp) {
    if (isCollecting) return;
    sessionStorage.setItem(FACT_DESTINATION_KEY, payload.destination);
    sessionStorage.setItem(FACT_CONTEXT_KEY, JSON.stringify(payload));
    return;
  }

  sessionStorage.setItem(FACT_DESTINATION_KEY, payload.destination);
  sessionStorage.setItem(FACT_CONTEXT_KEY, JSON.stringify(payload));
  navigate('/app');
}
