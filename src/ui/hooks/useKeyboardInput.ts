import { useEffect } from 'react';
import type { Letter } from '../../domain/types';
import { useLatest } from './useLatest';

export interface KeyboardHandlers {
  onLetter(letter: Letter): void;
  onRemove(): void;
  onClear(): void;
  onSubmit(): void;
  onShuffle(): void;
}

const LETTER_KEY = /^[a-z]$/i;

/** Physical-keyboard play: letters pick tiles, Backspace/Escape edit, Enter submits. */
export function useKeyboardInput(handlers: KeyboardHandlers, enabled: boolean): void {
  const latest = useLatest(handlers);

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      // Enter and Space on a focused button keep their normal meaning: press that button.
      const onButton = event.target instanceof HTMLButtonElement;
      const { onLetter, onRemove, onClear, onSubmit, onShuffle } = latest.current;

      if (LETTER_KEY.test(event.key)) onLetter(event.key.toUpperCase() as Letter);
      else if (event.key === 'Backspace') onRemove();
      else if (event.key === 'Escape') onClear();
      else if (event.key === 'Enter' && !onButton) onSubmit();
      else if (event.key === ' ' && !onButton) onShuffle();
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, latest]);
}
