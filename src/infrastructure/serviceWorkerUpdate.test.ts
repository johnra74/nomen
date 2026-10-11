import { describe, expect, it, vi } from 'vitest';
import { createUpdateSource, noUpdates } from './serviceWorkerUpdate';

describe('createUpdateSource', () => {
  it('reports a waiting update to subscribers and applies it on request', () => {
    let needRefresh = () => {};
    const activate = vi.fn().mockResolvedValue(undefined);
    const source = createUpdateSource((options) => {
      needRefresh = options.onNeedRefresh;
      return activate;
    });
    const listener = vi.fn();
    const unsubscribe = source.subscribe(listener);

    expect(source.isAvailable()).toBe(false);
    needRefresh();
    expect(source.isAvailable()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    needRefresh();
    expect(listener).toHaveBeenCalledTimes(1);

    source.apply();
    expect(activate).toHaveBeenCalledWith(true);
  });
});

describe('noUpdates', () => {
  it('never has an update', () => {
    const unsubscribe = noUpdates.subscribe(() => {});
    expect(noUpdates.isAvailable()).toBe(false);
    expect(() => {
      noUpdates.apply();
      unsubscribe();
    }).not.toThrow();
  });
});
