import { fireEvent, render, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type KeyboardHandlers, useKeyboardInput } from './useKeyboardInput';

function setup(enabled = true) {
  const handlers = {
    onLetter: vi.fn<KeyboardHandlers['onLetter']>(),
    onRemove: vi.fn<KeyboardHandlers['onRemove']>(),
    onClear: vi.fn<KeyboardHandlers['onClear']>(),
    onSubmit: vi.fn<KeyboardHandlers['onSubmit']>(),
    onShuffle: vi.fn<KeyboardHandlers['onShuffle']>(),
  };
  const hook = renderHook(({ on }) => useKeyboardInput(handlers, on), {
    initialProps: { on: enabled },
  });
  return { handlers, ...hook };
}

describe('useKeyboardInput', () => {
  it('maps letters, Backspace, Escape, Enter and Space to intents', () => {
    const { handlers } = setup();
    fireEvent.keyDown(document.body, { key: 'c' });
    fireEvent.keyDown(document.body, { key: 'A' });
    expect(handlers.onLetter.mock.calls).toEqual([['C'], ['A']]);
    fireEvent.keyDown(document.body, { key: 'Backspace' });
    expect(handlers.onRemove).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(handlers.onClear).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document.body, { key: 'Enter' });
    expect(handlers.onSubmit).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document.body, { key: ' ' });
    expect(handlers.onShuffle).toHaveBeenCalledTimes(1);
  });

  it('prevents the default action only for keys it handles', () => {
    setup();
    expect(fireEvent.keyDown(document.body, { key: 'Backspace' })).toBe(false);
    expect(fireEvent.keyDown(document.body, { key: 'Tab' })).toBe(true);
    expect(fireEvent.keyDown(document.body, { key: '7' })).toBe(true);
  });

  it('ignores shortcuts with a modifier key', () => {
    const { handlers } = setup();
    fireEvent.keyDown(document.body, { key: 'r', ctrlKey: true });
    fireEvent.keyDown(document.body, { key: 'r', metaKey: true });
    fireEvent.keyDown(document.body, { key: 'r', altKey: true });
    expect(handlers.onLetter).not.toHaveBeenCalled();
  });

  it('leaves Enter and Space alone on a focused button, but still reads letters there', () => {
    const { handlers } = setup();
    const { getByRole } = render(<button type="button">Shuffle</button>);
    const button = getByRole('button');
    expect(fireEvent.keyDown(button, { key: 'Enter' })).toBe(true);
    expect(fireEvent.keyDown(button, { key: ' ' })).toBe(true);
    expect(handlers.onSubmit).not.toHaveBeenCalled();
    expect(handlers.onShuffle).not.toHaveBeenCalled();
    fireEvent.keyDown(button, { key: 't' });
    expect(handlers.onLetter).toHaveBeenCalledWith('T');
  });

  it('listens only while enabled', () => {
    const { handlers, rerender, unmount } = setup(false);
    fireEvent.keyDown(document.body, { key: 'c' });
    expect(handlers.onLetter).not.toHaveBeenCalled();
    rerender({ on: true });
    fireEvent.keyDown(document.body, { key: 'c' });
    expect(handlers.onLetter).toHaveBeenCalledTimes(1);
    unmount();
    fireEvent.keyDown(document.body, { key: 'c' });
    expect(handlers.onLetter).toHaveBeenCalledTimes(1);
  });
});
