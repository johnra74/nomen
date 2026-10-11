// Composition root: the only place that names concrete adapters.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import nounsUrl from './assets/nouns.txt?url';
import { createBoardGenerator } from './domain/boardGenerator';
import { type GameEngine, createGameEngine } from './domain/gameEngine';
import { browserClock } from './infrastructure/browserClock';
import { cryptoRandom } from './infrastructure/cryptoRandom';
import { createLocalStorageScoreStore } from './infrastructure/localStorageScoreStore';
import { createUpdateSource } from './infrastructure/serviceWorkerUpdate';
import { loadDictionary } from './infrastructure/wordListDictionary';
import { App } from './ui/App';
import '@fontsource/source-sans-pro/latin-400.css';
import '@fontsource/source-sans-pro/latin-700.css';
import './ui/styles/app.scss';

const root = createRoot(document.getElementById('root')!);
const update = createUpdateSource(registerSW);

function render(engine: GameEngine | null, loadFailed = false) {
  root.render(
    <StrictMode>
      <App engine={engine} clock={browserClock} loadFailed={loadFailed} update={update} />
    </StrictMode>,
  );
}

render(null);

loadDictionary(nounsUrl)
  .then((dictionary) =>
    render(
      createGameEngine({
        dictionary,
        boardGenerator: createBoardGenerator({ dictionary, random: cryptoRandom }),
        random: cryptoRandom,
        clock: browserClock,
        scoreStore: createLocalStorageScoreStore(),
        timestamp: () => new Date().toISOString(),
      }),
    ),
  )
  .catch(() => render(null, true));
