import { useEffect, useSyncExternalStore } from 'react';
import { WARNING_SECONDS } from '../domain/constants';
import type { GameEngine } from '../domain/gameEngine';
import { levelConfig } from '../domain/levels';
import { canSubmit } from '../domain/selection';
import { currentWord, selectionScore } from '../domain/selectors';
import { type UpdateSource, noUpdates } from '../infrastructure/serviceWorkerUpdate';
import type { Clock } from '../ports';
import { Announcer } from './components/Announcer';
import { Board } from './components/Board';
import { ClockBar } from './components/ClockBar';
import { Controls } from './components/Controls';
import { GameOver } from './components/GameOver';
import { NavBar } from './components/NavBar';
import { PauseOverlay } from './components/PauseOverlay';
import { ScorePanel } from './components/ScorePanel';
import { StartScreen } from './components/StartScreen';
import { UpdatePrompt } from './components/UpdatePrompt';
import { WordTray } from './components/WordTray';
import { useCountdown } from './hooks/useCountdown';
import { useGame } from './hooks/useGame';
import { useHashRoute } from './hooks/useHashRoute';
import { useKeyboardInput } from './hooks/useKeyboardInput';
import { statusMessage } from './messages';
import { AboutPage } from './pages/AboutPage';
import { RulesPage } from './pages/RulesPage';

export interface AppProps {
  /** Null while the noun list is still loading. */
  readonly engine: GameEngine | null;
  readonly clock: Clock;
  readonly loadFailed?: boolean;
  readonly update?: UpdateSource;
}

export function App({ engine, clock, loadFailed = false, update = noUpdates }: AppProps) {
  const game = useGame(engine);
  const route = useHashRoute();
  const { state } = game;
  const { allowanceMs } = levelConfig(state.level);
  const updateAvailable = useSyncExternalStore(update.subscribe, update.isAvailable);

  const countdown = useCountdown({
    clock,
    status: state.status,
    deadline: state.deadline,
    pausedRemainingMs: state.remainingMs,
    onExpire: game.expire,
    onHidden: game.pause,
  });

  useKeyboardInput(
    {
      onLetter: game.selectLetter,
      onRemove: game.removeLast,
      onClear: game.clearSelection,
      onSubmit: game.submit,
      onShuffle: game.shuffle,
    },
    state.status === 'playing' && route === 'game',
  );

  // Reading a page must not cost the player time, so leaving the game pauses it.
  const leftGame = route !== 'game' && state.status === 'playing';
  const { pause } = game;
  useEffect(() => {
    if (leftGame) pause();
  }, [leftGame, pause]);

  const inGame = state.status === 'playing' || state.status === 'paused';
  const tone =
    state.status !== 'playing' || !state.lastResult
      ? 'neutral'
      : state.lastResult.kind === 'accepted'
        ? 'good'
        : 'bad';

  return (
    <>
      <NavBar route={route} />
      <main className="app container">
        {route === 'rules' && <RulesPage />}
        {route === 'about' && <AboutPage />}
        {route === 'game' && (
          <>
            {state.status === 'ready' && (
              <StartScreen
                ready={game.ready}
                loadFailed={loadFailed}
                best={game.best}
                onPlay={game.start}
              />
            )}

            {inGame && (
              <>
                <ScorePanel level={state.level} score={state.score} />
                <ClockBar
                  remainingMs={countdown.remainingMs}
                  allowanceMs={allowanceMs}
                  isWarning={countdown.isWarning}
                />
              </>
            )}

            {state.status === 'playing' && (
              <WordTray
                word={currentWord(state)}
                points={selectionScore(state)}
                nudge={game.missedLetters}
              />
            )}

            {/* Always mounted, so assistive technology treats it as one live region. */}
            <Announcer
              message={statusMessage(state)}
              warning={countdown.isWarning ? `${WARNING_SECONDS} seconds left.` : ''}
              tone={tone}
              visible={state.status === 'playing'}
            />

            {state.status === 'playing' && (
              <>
                <Board board={state.board} selection={state.selection} onSelect={game.selectTile} />
                <Controls
                  hasSelection={state.selection.length > 0}
                  canSubmit={canSubmit(state.selection)}
                  onRemove={game.removeLast}
                  onClear={game.clearSelection}
                  onShuffle={game.shuffle}
                  onSubmit={game.submit}
                  onPause={game.pause}
                />
              </>
            )}

            {state.status === 'paused' && <PauseOverlay onResume={game.resume} />}

            {state.status === 'over' && (
              <GameOver state={state} best={game.best} onPlayAgain={game.start} />
            )}
          </>
        )}

        <UpdatePrompt available={updateAvailable} status={state.status} onUpdate={update.apply} />
      </main>
    </>
  );
}
