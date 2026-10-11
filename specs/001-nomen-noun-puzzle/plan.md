# Implementation Plan: nōmən, a noun-building puzzle game

**Branch**: `001-nomen-noun-puzzle` | **Date**: 2026-10-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-nomen-noun-puzzle/spec.md`

## Summary

nōmən is a single-player word puzzle: 12 Scrabble-valued letter tiles, the player spells an English
noun of 3 to 8 letters before a per-word countdown expires, used tiles are refilled, and difficulty
rises by level. It ships as an installable, offline-capable React progressive web application.

Technical approach: a pure TypeScript domain core holds every rule (scoring, letter bag, board
generation, solvability, validation, levels, state transitions). It depends only on four small
ports (dictionary, random source, clock, score store). Browser implementations of those ports are
wired in one composition root, and a thin React layer renders state and forwards intents. The noun
list is extracted from WordNet at build time and bundled, so validation and the board guarantees
run on the device.

## Technical Context

**Language/Version**: TypeScript 6 (strict), targeting ES2022; Node.js 22 LTS or newer for tooling

**Primary Dependencies**: React 19, React DOM 19, Vite 8, `vite-plugin-pwa` 2 (Workbox 7), Bootstrap 5.3 with the Bootswatch Lumen theme (CSS only, no Bootstrap JavaScript), `@fontsource/source-sans-pro` (Lumen's typeface, bundled), `sass-embedded` (build-time); build-time only: `wordnet-db` (WordNet data files), `tsx` (run the word-list script)

**Storage**: Browser `localStorage` for the personal best only (one small JSON record). No server, no database.

**Testing**: Vitest 4 with `@vitest/coverage-v8`, React Testing Library, `@testing-library/user-event`, jsdom. Coverage thresholds 80% (lines, branches, functions, statements) enforced in config.

**Target Platform**: Evergreen browsers (Chrome, Edge, Safari, Firefox) on Android, iOS and desktop; installed as a PWA (standalone display)

**Project Type**: Single-project client-side web application (PWA). No backend.

**Performance Goals**: Word submit to refilled board in under 100 ms on a mid-range phone (SC-003); solvability check under 10 ms; 60 fps tile interaction; interactive in under 3 s on 4G first visit (SC-006)

**Constraints**: Fully offline after first load; countdown accurate to 250 ms (SC-004); initial JS under 200 KB gzipped excluding the word list; word list under 150 KB gzipped; no network calls at runtime; WCAG 2.1 AA

**Scale/Scope**: One screen with four states (ready, playing, paused, over); about 10 domain modules, 4 ports, 4 adapters, about 10 components, 3 hooks; a noun list in the tens of thousands of words

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I. SOLID Design | One responsibility per domain module; level table and letter data are config; all side effects behind ports; single composition root (`src/main.tsx`) | PASS |
| II. DRY | `src/domain/constants.ts` is the only home of letter values, weights, vowel set, board size, word bounds; `src/domain/levels.ts` the only home of the level rules; tests import them | PASS |
| III. Test-First, 80% | tasks.md orders tests before implementation in every phase; Vitest thresholds fail the run below 80%; time and randomness are faked | PASS |
| IV. Pure Domain Core | `src/domain/**` imports nothing from React, DOM, or `src/infrastructure`; enforced by an ESLint `no-restricted-imports` rule | PASS |
| V. Offline-First PWA | Word list bundled and precached; no runtime network calls; manifest and service worker via `vite-plugin-pwa` | PASS |
| VI. Accessible, Mobile-First | 320 px baseline layout, 44 px targets, keyboard input, live regions, reduced-motion handling are explicit tasks | PASS |
| VII. Simplicity | No state library, router or backend. Bootstrap with the Lumen theme is a requested dependency; see Complexity Tracking | PASS (justified) |

**Post-design re-check (after Phase 1)**: PASS. The design adds one element beyond the minimum, a
`gameEngine` module separate from `gameReducer`. It is justified below, not a violation: it keeps
the reducer pure (Principle IV) by moving the random refill out of it.

## Project Structure

### Documentation (this feature)

```text
specs/001-nomen-noun-puzzle/
├── plan.md              # This file
├── research.md          # Phase 0: decisions and alternatives
├── data-model.md        # Phase 1: entities, invariants, state machine
├── quickstart.md        # Phase 1: run and validation guide
├── contracts/
│   ├── domain.ts        # Domain types and pure-function signatures
│   ├── ports.ts         # Port interfaces (Dictionary, RandomSource, Clock, ScoreStore)
│   └── ui-contract.md   # User-facing interaction contract (controls, keys, announcements)
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2: ordered task list
```

### Source Code (repository root)

```text
index.html
package.json
tsconfig.json
vite.config.ts               # Vite + PWA plugin + Vitest config and coverage thresholds
pwa.config.ts                # web app manifest and precache globs (tested)
eslint.config.js             # includes the domain import boundary rule
.github/workflows/ci.yml     # lint, typecheck, test with coverage, build
public/
├── icons/                   # PWA icons (192, 512, maskable), favicon
└── licenses/                # WordNet licence notice
scripts/
├── wordFilter.ts            # pure noun filter (unit tested)
├── build-wordlist.ts        # I/O shell: WordNet -> src/assets/nouns.txt (build-time)
└── make-icons.mjs           # draws the PNG icons (dependency-free)
src/
├── main.tsx                 # composition root: builds adapters, renders <App>
├── assets/
│   └── nouns.txt            # generated noun list, one word per line
├── domain/                  # pure TypeScript, no React, no browser APIs
│   ├── constants.ts         # letter values, letter weights, vowels, board size, word bounds
│   ├── types.ts             # Tile, Board, GameState, GameAction, LevelConfig, ...
│   ├── scoring.ts           # letter value, word score
│   ├── levels.ts            # level table: allowance, target, hard-letter multiplier, levelForScore
│   ├── letterBag.ts         # weighted letter draw for a level
│   ├── solvability.ts       # count formable nouns on a board (early exit)
│   ├── boardGenerator.ts    # deal and refill honouring vowel + solvability guarantees
│   ├── selection.ts         # select tile, select by letter, remove last, clear, shuffle
│   ├── wordValidator.ts     # length, tile and dictionary checks with rejection reasons
│   ├── gameEngine.ts        # commands that need ports: start, submit; returns reducer actions
│   ├── gameReducer.ts       # pure state transitions
│   └── selectors.ts         # derived values: current word, best word, level progress
├── ports/
│   └── index.ts             # Dictionary, RandomSource, Clock, ScoreStore
├── infrastructure/
│   ├── wordListDictionary.ts
│   ├── cryptoRandom.ts
│   ├── browserClock.ts
│   ├── localStorageScoreStore.ts
│   └── serviceWorkerUpdate.ts  # reports a waiting app update to the UI
└── ui/
    ├── App.tsx              # receives the engine and clock as props
    ├── messages.ts          # all feedback and announcement wording
    ├── routes.ts            # the game and its static pages, addressed by URL hash
    ├── pages/
    │   ├── Page.tsx         # shared page frame: titled card that takes focus
    │   ├── RulesPage.tsx    # rules, generated from domain constants and the level table
    │   └── AboutPage.tsx    # the story of the word nōmen and of the game
    ├── hooks/
    │   ├── useGame.ts       # state + intents built from the injected engine
    │   ├── useCountdown.ts
    │   ├── useKeyboardInput.ts
    │   ├── useHashRoute.ts
    │   └── useLatest.ts
    ├── components/
    │   ├── Board.tsx
    │   ├── Tile.tsx
    │   ├── WordTray.tsx
    │   ├── Controls.tsx
    │   ├── ClockBar.tsx
    │   ├── ScorePanel.tsx
    │   ├── StartScreen.tsx
    │   ├── PauseOverlay.tsx
    │   ├── GameOver.tsx
    │   ├── BestScore.tsx
    │   ├── Announcer.tsx
    │   ├── NavBar.tsx
    │   └── UpdatePrompt.tsx
    └── styles/
        └── app.scss         # Bootstrap + Lumen compiled from source, plus board-specific rules
tests/
├── support/                 # seededRandom, fakeClock, memoryScoreStore, fixtureDictionary
└── integration/             # full game flows through the rendered App
```

Unit tests are colocated with the code they test as `*.test.ts` / `*.test.tsx`.

**Structure Decision**: Single client-side project. Dependencies point inward:
`ui -> domain <- infrastructure`, with `ports` defining the seams. `src/domain` and `src/ports`
have no outward imports. `src/main.tsx` is the only file that names concrete adapters.

### Module responsibilities

| Module | Single responsibility | Depends on |
|---|---|---|
| `constants` | Game constants | nothing |
| `scoring` | Points for a letter and a word | constants |
| `levels` | Level number to config; score to level | constants |
| `letterBag` | Draw a weighted random letter for a level | constants, levels, `RandomSource` |
| `solvability` | How many nouns a set of letters can form, up to a limit | `Dictionary` |
| `boardGenerator` | Produce boards that satisfy FR-003 and FR-004 | letterBag, solvability |
| `selection` | Rules for picking and unpicking tiles | constants |
| `wordValidator` | Accept or reject a selection with a reason | constants, `Dictionary` |
| `gameEngine` | Orchestrate start and submit, emitting plain actions | validator, scoring, levels, boardGenerator |
| `gameReducer` | Apply actions to state | types, selection |

### Key design points

- **Reducer purity**: refilling needs randomness, so `gameEngine.submit(state)` runs in the event
  handler and returns a plain action (`WORD_ACCEPTED` with the score and the new board, or
  `WORD_REJECTED` with a reason). `gameReducer` only applies actions. This keeps the reducer safe
  under React Strict Mode's double invocation and trivially testable.
- **Board guarantee algorithm** (FR-003 to FR-005): see research R3. Choose a vowel count inside
  the allowed range, draw exactly that many vowels and the rest as consonants from the level's
  weighted bags, test solvability, retry up to a
  bounded count, then redeal the full board, then fall back to a constructive board built around
  two dictionary nouns. The fallback guarantees termination.
- **Clock**: deadline based. The reducer stores the deadline; `useCountdown` reads
  `deadline - Clock.now()` whenever it renders and a 100 ms interval only triggers the repaint
  and the expiry check, so it never counts ticks. Pause stores remaining milliseconds.
  `visibilitychange` triggers pause.
- **Dictionary loading**: `nouns.txt` is fetched once at startup from the precache and parsed into a
  `Set` plus an index by sorted-letter signature. The start screen shows until it is ready.
- **Coverage exclusions** (each listed in config): `src/main.tsx` (composition root),
  `src/assets/**` (generated), `scripts/build-wordlist.ts` (file I/O shell; its logic is the tested
  `scripts/wordFilter.ts`), `*.d.ts`, and the two type-only files `src/domain/types.ts` and
  `src/ports/index.ts`.
- **No React context**: one screen has one consumer, so `App` takes the engine and clock as props
  and `useGame` holds the state (constitution VII). The originally planned `GameContext` was
  dropped as unnecessary.

### Static pages and navigation (added 2026-10-11)

- **Routing without a router**: three views (game, rules, about) are selected by the URL hash
  (`#/`, `#/rules`, `#/about`) through `useHashRoute`, a few lines over `useSyncExternalStore`.
  Hash links need no server configuration, work from the service worker's cached `index.html`,
  give working back/forward buttons and can be opened directly. A routing library would be a
  dependency for three links (constitution VII).
- **Rules cannot drift from the game**: `RulesPage` renders its numbers, letter-value table and
  level table from `src/domain/constants.ts` and `levelConfig`, so there is no second copy of any
  rule (constitution II).
- **Leaving pauses**: `App` pauses a game in progress when the route is not the game, reusing the
  existing pause action; the player resumes explicitly on return.
- **About page**: prose content in `AboutPage.tsx`, with Latin and other foreign words marked with
  `lang` so screen readers pronounce them properly.

## Measured Results (implementation, 2026-10-11)

| Measure | Budget | Actual |
|---|---|---|
| Noun list | under 150 KB gzipped | 21,898 nouns, 65.9 KB gzipped in the build |
| Initial JS, excluding the noun list | under 200 KB gzipped | 76.0 KB gzipped (plus 2.2 KB service worker helper) |
| CSS (Bootstrap subset + Lumen + game rules) | none set | 20.0 KB gzipped |
| Fonts (Source Sans Pro 400 and 700, latin, woff2) | none set | 29.6 KB |
| Accessibility with the Lumen theme | no WCAG 2.1 AA violations | axe: 0 violations on start, playing, paused, rules and about screens; Lighthouse 100 |
| After adding the pages | JS under 200 KB gzipped | JS 80.5 KB, CSS 21.5 KB gzipped |
| Unit test coverage | 80% on all four measures | statements 99.5%, branches 97.9%, functions 100%, lines 99.7% |
| Board guarantees (SC-002) | 0 violations in 100,000 | 0 violations in 100,000 |
| Lighthouse accessibility (SC-007) | 90 or more | 100 (start screen, headless Chromium) |

## Complexity Tracking

No constitution violations. The table records the one deliberate addition for transparency.

| Addition | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Bootstrap 5 + Bootswatch Lumen (CSS framework) | Requested explicitly for the UX revision of 2026-10-11 | Hand-written CSS (the first version) met the requirements but is not the look that was asked for. Cost is contained: CSS only, a subset of Bootstrap's partials, no Bootstrap JavaScript and no component library |
| `gameEngine` alongside `gameReducer` | Refill requires a random source and dictionary; a reducer must be pure | Calling ports inside the reducer makes it impure and non-deterministic under Strict Mode double invocation |
