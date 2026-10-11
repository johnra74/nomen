import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useHashRoute } from './useHashRoute';

function go(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

afterEach(() => {
  window.location.hash = '';
});

describe('useHashRoute', () => {
  it('starts on the route in the address bar', () => {
    window.location.hash = '#/about';
    expect(renderHook(() => useHashRoute()).result.current).toBe('about');
  });

  it('follows hash changes until unmounted', () => {
    const { result, unmount } = renderHook(() => useHashRoute());
    expect(result.current).toBe('game');
    go('#/rules');
    expect(result.current).toBe('rules');
    go('#/');
    expect(result.current).toBe('game');
    unmount();
    go('#/about');
    expect(result.current).toBe('game');
  });
});
