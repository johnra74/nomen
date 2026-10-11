export type Route = 'game' | 'rules' | 'about';

/** The game and its static pages, in navigation order. Hash links need no server support. */
export const ROUTES = [
  { route: 'game', hash: '#/', label: 'Play' },
  { route: 'rules', hash: '#/rules', label: 'Rules' },
  { route: 'about', hash: '#/about', label: 'About' },
] as const satisfies readonly { route: Route; hash: string; label: string }[];

export const hashOf = (route: Route): string => ROUTES.find((entry) => entry.route === route)!.hash;

/** Unknown or empty hashes show the game. */
export function routeFromHash(hash: string): Route {
  return ROUTES.find((entry) => entry.hash === hash)?.route ?? 'game';
}
