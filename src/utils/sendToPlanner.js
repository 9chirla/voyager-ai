export const FACT_DESTINATION_KEY = 'voyager-fact-destination';

/**
 * Route a fact destination into the trip planner.
 * @param {string} destination
 * @param {{
 *   pathname: string,
 *   isCollecting: boolean,
 *   navigate: (path: string) => void,
 * }} ctx
 */
export function sendToPlanner(destination, { pathname, isCollecting, navigate }) {
  const onApp = pathname === '/app' || pathname.endsWith('/app');

  if (onApp) {
    if (isCollecting) return;
    sessionStorage.setItem(FACT_DESTINATION_KEY, destination);
    return;
  }

  sessionStorage.setItem(FACT_DESTINATION_KEY, destination);
  navigate('/app');
}
