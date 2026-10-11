import { useSyncExternalStore } from 'react';
import { type Route, routeFromHash } from '../routes';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/** The page named by the address bar's hash, kept in step with back/forward navigation. */
export function useHashRoute(): Route {
  return useSyncExternalStore(subscribe, () => routeFromHash(window.location.hash));
}
