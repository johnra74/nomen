import { describe, expect, it } from 'vitest';
import { ROUTES, routeFromHash } from './routes';

describe('routes', () => {
  it('lists the game and the two static pages', () => {
    expect(ROUTES.map((entry) => [entry.route, entry.hash, entry.label])).toEqual([
      ['game', '#/', 'Play'],
      ['rules', '#/rules', 'Rules'],
      ['about', '#/about', 'About'],
    ]);
  });

  it('maps a location hash to a route', () => {
    expect(routeFromHash('#/rules')).toBe('rules');
    expect(routeFromHash('#/about')).toBe('about');
    expect(routeFromHash('#/')).toBe('game');
  });

  it('falls back to the game for an empty or unknown hash', () => {
    expect(routeFromHash('')).toBe('game');
    expect(routeFromHash('#/nowhere')).toBe('game');
    expect(routeFromHash('#rules')).toBe('game');
  });
});
