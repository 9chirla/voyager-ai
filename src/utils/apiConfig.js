/**
 * API base URL for chat proxy.
 * - Dev: empty → relative `/api/chat` (Vite proxies to Express on :3001)
 * - GitHub Pages / static host: set VITE_API_BASE_URL to your deployed Express server
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

/** @returns {string} */
export function chatApiUrl() {
  if (API_BASE) return `${API_BASE}/api/chat`;
  return '/api/chat';
}

/** True when built for GitHub Pages without a remote API configured. */
export function isStaticHostWithoutApi() {
  const base = import.meta.env.BASE_URL || '/';
  const onPages = base !== '/' && base.endsWith('/');
  return onPages && !API_BASE;
}

/** User-facing message when the chat API is unreachable on a static deploy. */
export const STATIC_HOST_API_MESSAGE =
  'Trip generation needs the Voyager API server. GitHub Pages hosts the frontend only — '
  + 'run locally with `npm run dev`, deploy the Docker image, or set VITE_API_BASE_URL '
  + 'to a hosted API and rebuild.';
