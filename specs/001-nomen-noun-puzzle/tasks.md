---

description: "Task list for nōmən, a noun-building puzzle game"
---

# Tasks: nōmən, a noun-building puzzle game

**Input**: Design documents from `/specs/001-nomen-noun-puzzle/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED. The constitution (Principle III) mandates test-first development and an 80%
coverage gate, and the spec states it as SC-009. Every test task MUST be written and seen to fail
before the implementation task that follows it.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested and
demonstrated on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1 to US5)
- Unit tests are colocated as `*.test.ts(x)` next to the file under test

## Path Conventions

Single project: `src/`, `tests/`, `scripts/` and `public/` at the repository root, as laid out in
plan.md.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialisation and tooling

- [X] T001 Scaffold the Vite + React 19 + TypeScript project at the repository root: `package.json`, `index.html`, `tsconfig.json` (strict, ES2022), `src/main.tsx` placeholder, `.gitignore` (node_modules, dist, coverage)
- [X] T002 Create the directory structure from plan.md: `src/domain`, `src/ports`, `src/infrastructure`, `src/ui/components`, `src/ui/hooks`, `src/ui/styles`, `src/assets`, `tests/support`, `tests/integration`, `scripts`, `public/icons`
- [X] T003 Configure Vitest in `vite.config.ts`: jsdom environment, setup file `tests/support/setup.ts` (jest-dom matchers), v8 coverage with thresholds 80 for lines, branches, functions and statements, exclusions limited to `src/main.tsx`, `src/assets/**`, `scripts/build-wordlist.ts`, `**/*.d.ts`, each with a justifying comment
- [X] T004 [P] Configure ESLint and Prettier in `eslint.config.js` and `.prettierrc`, including a `no-restricted-imports` rule that forbids `src/domain/**` and `src/ports/**` from importing `react`, `react-dom`, `src/ui/**` or `src/infrastructure/**`
- [X] T005 [P] Add npm scripts in `package.json`: `dev`, `build` (typecheck then vite build), `preview`, `typecheck`, `lint`, `test` (vitest run with coverage), `test:watch`, `build:words`
- [X] T006 [P] Install dependencies in `package.json`: react, react-dom; dev: vite, @vitejs/plugin-react, typescript, vitest, @vitest/coverage-v8, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, eslint, prettier, tsx, wordnet-db, vite-plugin-pwa

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Constants, types, ports, the noun list and test fakes that every story depends on

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create `src/domain/constants.ts` as the single source of truth: `BOARD_SIZE = 12`, `MIN_WORD_LENGTH = 3`, `MAX_WORD_LENGTH = 8`, `VOWELS = A E I O U`, `MIN_VOWEL_RATIO = 0.4`, derived `MIN_VOWELS = ceil(BOARD_SIZE * MIN_VOWEL_RATIO)`, `MIN_FORMABLE_WORDS = 2`, `LETTER_VALUES` (A1 B3 C3 D2 E1 F4 G2 H4 I1 J8 K5 L1 M3 N1 O1 P3 Q10 R1 S1 T1 U1 V4 W4 X8 Y4 Z10), `LETTER_WEIGHTS` (A9 B2 C2 D4 E12 F2 G3 H2 I9 J1 K1 L4 M2 N6 O8 P2 Q1 R6 S4 T6 U4 V2 W2 X1 Y2 Z1), `HARD_LETTERS = J K Q V W X Z`, `WARNING_SECONDS = 10`; with `src/domain/constants.test.ts` asserting all 26 letters have a value and a weight and `MIN_VOWELS === 5`
- [X] T008 [P] Create domain types in `src/domain/types.ts` from `contracts/domain.ts`: `Letter`, `Tile`, `Board`, `Selection`, `LevelConfig`, `RejectionReason`, `SubmitResult`, `PlayedWord`, `GameStatus`, `GameState`, `GameAction`
- [X] T009 [P] Create port interfaces in `src/ports/index.ts` from `contracts/ports.ts`: `Dictionary`, `RandomSource`, `Clock`, `ScoreStore`, `PersonalBest`
- [X] T010 [P] Create test fakes in `tests/support/`: `seededRandom.ts` (deterministic `RandomSource` from a seed), `fakeClock.ts` (manual `Clock` with `advance(ms)`), `memoryScoreStore.ts`, `fixtureDictionary.ts` (small in-memory `Dictionary` built from a word array), with `tests/support/fakes.test.ts` covering each
- [X] T011 [P] Write failing tests in `src/domain/levels.test.ts`: `levelConfig` gives allowance `max(15, 60 - 5 * (level - 1)) * 1000` ms, targets 30, 70, 120, 180 for levels 1 to 4 then `180 + 75 * (level - 4)`, multiplier `min(4, 1 + 0.25 * (level - 1))`; `levelForScore` returns the lowest level whose targetScore is greater than the score (0 gives 1, 29 gives 1, 30 gives 2, 70 gives 3, 255 gives 6) and is non-decreasing
- [X] T012 Implement `levelConfig` and `levelForScore` in `src/domain/levels.ts` as the only home of the level rules
- [X] T013 [P] Write failing tests in `scripts/wordFilter.test.ts` for the pure noun filter: keeps lemmas matching `^[a-z]{3,8}$` after lowercasing, drops lemmas with digits, hyphens, apostrophes or underscores, drops lemmas shorter than 3 or longer than 8, drops lemmas whose every noun sense is capitalised (proper nouns), de-duplicates and sorts
- [X] T014 Implement the pure filter in `scripts/wordFilter.ts` and the I/O shell in `scripts/build-wordlist.ts` that reads WordNet noun files from `wordnet-db`, applies the filter, writes `src/assets/nouns.txt` (one lowercase word per line), and prints word count and byte size (research R2)
- [X] T015 (generated and recorded; left uncommitted, as nothing in this repository has been committed yet) Run `npm run build:words`, commit the generated `src/assets/nouns.txt`, add the WordNet licence text as `public/licenses/WORDNET-LICENSE.txt`, and record word count and gzipped size against the 150 KB budget in `specs/001-nomen-noun-puzzle/research.md` R2
- [X] T016 [P] Write failing tests in `src/infrastructure/wordListDictionary.test.ts`: `has` is case-insensitive, `size` matches the input, `signatures()` groups anagrams under one sorted-letter signature (act and cat under `act`), blank lines are ignored
- [X] T017 Implement `createWordListDictionary(text)` and the async loader `loadDictionary()` in `src/infrastructure/wordListDictionary.ts`
- [X] T018 [P] Write failing tests in `src/infrastructure/cryptoRandom.test.ts` (values in `[0, 1)`, uses `crypto.getRandomValues`) and implement `src/infrastructure/cryptoRandom.ts`

**Checkpoint**: Foundation ready. Constants, types, ports, level rules, noun list and fakes exist and are tested.

---

## Phase 3: User Story 1 - Build a noun from the board and score it (Priority: P1) MVP

**Goal**: A player sees 12 valued tiles, spells a noun of 3 to 8 letters, scores it, and gets the used tiles refilled, with the vowel and solvability guarantees always holding.

**Independent Test**: Start a game, spell a known noun, submit, and confirm the score rises by the tile sum and only used tiles change. Submit a non-noun and confirm rejection with no score change. (quickstart scenario 1)

### Tests for User Story 1 (write first, must fail)

- [X] T019 [P] [US1] Unit tests in `src/domain/scoring.test.ts`: `letterValue` for every letter matches `LETTER_VALUES`; `wordScore` of C A T is 5; empty input is 0 (FR-002, FR-014)
- [X] T020 [P] [US1] Unit tests in `src/domain/letterBag.test.ts` with `seededRandom`: `draw` returns only A to Z; `drawVowel` returns only vowels; over 100,000 draws at level 1 frequencies track `LETTER_WEIGHTS` within tolerance (FR-001)
- [X] T021 [P] [US1] Unit tests in `src/domain/solvability.test.ts` with `fixtureDictionary`: counts distinct formable nouns of length 3 to 8; respects letter multiplicity (one E cannot form a two-E word); anagrams count separately; stops at `limit`; returns 0 when none (FR-004)
- [X] T022 [P] [US1] Unit tests in `src/domain/boardGenerator.test.ts`: `deal` returns 12 tiles with unique ids, at least `MIN_VOWELS` vowels and at least `MIN_FORMABLE_WORDS` formable nouns; `refill` changes exactly the used positions and keeps other tiles identical; refill after using all vowels restores at least 5; a `RandomSource` scripted to fail forces the redeal path and then the constructive fallback, and both still return a valid board (FR-001, FR-003, FR-004, FR-005, FR-015)
- [X] T023 [P] [US1] Unit tests in `src/domain/selection.test.ts`: `selectTile` appends an unselected tile, ignores an already selected tile, ignores unknown ids, and stops at 8; `selectLetter` picks the first unselected matching tile and returns the same selection when none; two E tiles can both be selected; `removeLast`; `canSubmit` only for 3 to 8; `shuffleOrder` returns a permutation (FR-006 to FR-011)
- [X] T024 [P] [US1] Unit tests in `src/domain/wordValidator.test.ts`: reasons `too-short` under 3, `too-long` over 8, `not-a-noun` when absent from the dictionary; accepts a listed noun; case-insensitive (FR-012, FR-013, FR-016)
- [X] T025 [P] [US1] Unit tests in `src/domain/gameReducer.test.ts` for `START`, `SELECT_TILE`, `SELECT_LETTER`, `REMOVE_LAST`, `CLEAR_SELECTION`, `SHUFFLE`, `WORD_ACCEPTED` (adds score, appends history, replaces board, clears selection), `WORD_REJECTED` (clears selection, score and board unchanged, records reason); actions illegal for the status return the same state object
- [X] T026 [P] [US1] Unit tests in `src/domain/gameEngine.test.ts` with fakes: `start` returns `START` with a valid board; `submit` returns `WORD_ACCEPTED` with `wordScore` and a board refilled only at used positions; returns `WORD_REJECTED` with the reason for a non-noun; returns null when not playing or the selection is not submittable; `shuffle` returns a permutation
- [X] T027 [P] [US1] Component tests in `src/ui/components/Tile.test.tsx`, `Board.test.tsx`, `WordTray.test.tsx`, `Controls.test.tsx`, `ScorePanel.test.tsx`, `StartScreen.test.tsx`, `Announcer.test.tsx` against `contracts/ui-contract.md`: tile is a button named like "E, 1 point" with `aria-pressed` when selected; board renders 12 tiles; tray shows letters and running total; Submit disabled outside 3 to 8; Delete, Clear and Shuffle call their handlers; score panel shows the total score; Play disabled until the dictionary is ready; announcer exposes accept and reject messages
- [X] T028 [P] [US1] Hook tests in `src/ui/hooks/useKeyboardInput.test.tsx` and `src/ui/hooks/useGame.test.tsx`: letters select, Backspace removes, Escape clears, Enter submits; a letter with no unselected tile changes nothing; `useGame` exposes state and intents built from injected dependencies
- [X] T029 [US1] Integration test in `tests/integration/coreLoop.test.tsx` rendering `App` with fakes: acceptance scenarios 1 to 9 of User Story 1, including CAT scoring 5 and only three tiles changing, rejection of a non-noun, and no reuse of a single tile

### Implementation for User Story 1

- [X] T030 [P] [US1] Implement `letterValue` and `wordScore` in `src/domain/scoring.ts`
- [X] T031 [P] [US1] Implement `createLetterBag(level, random)` in `src/domain/letterBag.ts` using `LETTER_WEIGHTS`, with hard letters scaled by `levelConfig(level).hardLetterMultiplier`
- [X] T032 [P] [US1] Implement `countFormableWords(letters, dictionary, limit)` in `src/domain/solvability.ts` using letter counts against `dictionary.signatures()` with early exit (research R4)
- [X] T033 [US1] Implement `createBoardGenerator`, `countVowels` and `isValidBoard` in `src/domain/boardGenerator.ts`: vowel-first draw, up to 50 refill attempts, up to 50 redeal attempts, then the constructive two-noun fallback (research R3); depends on T031, T032
- [X] T034 [P] [US1] Implement `selectTile`, `selectLetter`, `removeLast`, `selectedLetters`, `canSubmit`, `shuffleOrder` in `src/domain/selection.ts`
- [X] T035 [P] [US1] Implement `validateWord` in `src/domain/wordValidator.ts`
- [X] T036 [US1] Implement `initialGameState` and `gameReducer` in `src/domain/gameReducer.ts` for the actions tested in T025; depends on T034
- [X] T037 [US1] Implement `createGameEngine` with `start`, `submit` and `shuffle` in `src/domain/gameEngine.ts`; depends on T030, T033, T035, T036
- [X] T038 [US1] Implement `src/ui/hooks/useGame.ts` (useReducer over `gameReducer`, intents that call the engine and dispatch its actions). `src/ui/GameContext.tsx` was dropped: `App` is the only consumer, so it takes the engine as a prop (constitution VII)
- [X] T039 [P] [US1] Implement `src/ui/hooks/useKeyboardInput.ts`
- [X] T040 [P] [US1] Implement `src/ui/components/Tile.tsx` and `src/ui/components/Board.tsx`
- [X] T041 [P] [US1] Implement `src/ui/components/WordTray.tsx` and `src/ui/components/Controls.tsx`
- [X] T042 [P] [US1] Implement `src/ui/components/ScorePanel.tsx` (total score), `src/ui/components/StartScreen.tsx` and `src/ui/components/Announcer.tsx`
- [X] T043 [US1] Implement `src/ui/App.tsx` (ready and playing screens) and the composition root `src/main.tsx` wiring `loadDictionary`, `cryptoRandom` and the engine into `GameContext`
- [X] T044 [US1] Add base styles in `src/ui/styles/app.css`: 4 by 3 tile grid from 320 px, 44 px targets, selected-tile state not relying on colour, visible focus rings

**Checkpoint**: User Story 1 is playable as an untimed word puzzle and passes T019 to T029.

---

## Phase 4: User Story 2 - Race the clock (Priority: P2)

**Goal**: A per-word countdown that resets on a valid noun, ends the game at zero, and can be paused.

**Independent Test**: Wait without submitting and confirm game over at zero; submit a valid noun mid-countdown and confirm it resets to full. (quickstart scenario 2)

### Tests for User Story 2 (write first, must fail)

- [X] T045 [P] [US2] Unit tests in `src/infrastructure/browserClock.test.ts`: `now()` is monotonic and backed by `performance.now()`
- [X] T046 [P] [US2] Extend `src/domain/gameReducer.test.ts`: `START` sets `deadline = now + levelConfig(1).allowanceMs`; `WORD_ACCEPTED` resets the deadline to `now` plus the current level's allowance; `WORD_REJECTED` leaves the deadline unchanged; `PAUSE` stores `remainingMs = deadline - now` and clears the deadline; `RESUME` sets `deadline = now + remainingMs`; `EXPIRE` moves to `over`, clears selection and deadline; selection actions are ignored when `paused` or `over`
- [X] T047 [P] [US2] Extend `src/domain/gameEngine.test.ts` with `fakeClock`: `submit` returns null once `clock.now() >= deadline` (FR-019); `expireIfDue` returns `EXPIRE` only when due; `pause` and `resume` carry `clock.now()`
- [X] T048 [P] [US2] Hook tests in `src/ui/hooks/useCountdown.test.tsx` with `fakeClock`: reports remaining ms derived from the deadline, flags warning at `WARNING_SECONDS` or less, calls `onExpire` exactly once, freezes while paused, pauses on `visibilitychange` to hidden
- [X] T049 [P] [US2] Component tests in `src/ui/components/ClockBar.test.tsx`, `PauseOverlay.test.tsx`, `GameOver.test.tsx`: `timer` role named "Time remaining"; warning adds the "Hurry" text; overlay hides tile letters and offers Resume; game over shows final score, level, words played, best word and Play again
- [X] T050 [US2] Integration test in `tests/integration/clock.test.tsx`: acceptance scenarios 1 to 8 of User Story 2 by advancing `fakeClock`, including the submission at the deadline not counting

### Implementation for User Story 2

- [X] T051 [P] [US2] Implement `src/infrastructure/browserClock.ts`
- [X] T052 [US2] Add `deadline`, `remainingMs`, `PAUSE`, `RESUME` and `EXPIRE` handling to `src/domain/gameReducer.ts`
- [X] T053 [US2] Add the deadline guard to `submit`, and `expireIfDue`, `pause`, `resume` to `src/domain/gameEngine.ts`
- [X] T054 [US2] Implement `src/ui/hooks/useCountdown.ts` (deadline based, animation-frame display, visibility auto-pause; research R7)
- [X] T055 [P] [US2] Implement `src/ui/components/ClockBar.tsx` and `src/ui/components/PauseOverlay.tsx`
- [X] T056 [P] [US2] Implement `src/ui/components/GameOver.tsx`
- [X] T057 [US2] Wire the clock, pause control (button and P key), paused and over screens into `src/ui/App.tsx`, `src/ui/hooks/useGame.ts`, `src/ui/hooks/useKeyboardInput.ts`, `src/ui/components/Controls.tsx` and `src/main.tsx`; add time-warning, pause and game-over messages to `src/ui/components/Announcer.tsx`

**Checkpoint**: Stories 1 and 2 together form a complete timed game.

---

## Phase 5: User Story 3 - Climb through levels of rising difficulty (Priority: P3)

**Goal**: Score targets clear levels; each level shortens the clock and hardens the letter mix.

**Independent Test**: Reach 30 points and confirm level 2, a level-up notice and a 55 second countdown. (quickstart scenario 3)

### Tests for User Story 3 (write first, must fail)

- [X] T058 [P] [US3] Extend `src/domain/gameReducer.test.ts`: after `WORD_ACCEPTED`, `level === levelForScore(score)`; 26 points plus 5 moves to level 2 with deadline `now + 55000`; one word can cross two targets; `PlayedWord.level` records the level at the time of play
- [X] T059 [P] [US3] Extend `src/domain/gameEngine.test.ts`: `submit` refills using the post-score level and sets `leveledUpTo` on the accepted result only when the level rose
- [X] T060 [P] [US3] Extend `src/domain/letterBag.test.ts`: the share of `HARD_LETTERS` at level 10 exceeds the share at level 1 over 100,000 seeded draws, and the multiplier is capped at 4 from level 13
- [X] T061 [P] [US3] Property test in `src/domain/boardGenerator.property.test.ts`: across 100,000 seeded deals and refills spanning levels 1 to 20 against the real noun list, every board has at least 5 vowels and at least 2 formable nouns (SC-002)
- [X] T062 [P] [US3] Extend `src/ui/components/ScorePanel.test.tsx`: shows level, score and a `progressbar` named "Progress to next level" with correct value and bounds
- [X] T063 [US3] Integration test in `tests/integration/levels.test.tsx`: acceptance scenarios 1 to 6 of User Story 3, including the 15 second floor at level 10 and the level-up announcement

### Implementation for User Story 3

- [X] T064 [US3] Recompute level and use the new level's allowance on `WORD_ACCEPTED` in `src/domain/gameReducer.ts`
- [X] T065 [US3] Pass the post-score level to `refill` and populate `leveledUpTo` in `src/domain/gameEngine.ts`
- [X] T066 [P] [US3] Add level and progress-to-target display to `src/ui/components/ScorePanel.tsx`
- [X] T067 [P] [US3] Add the level-up announcement to `src/ui/components/Announcer.tsx` and a level-up visual notice in `src/ui/App.tsx` (suppressed animation under reduced motion)

**Checkpoint**: Difficulty rises with score; the board guarantees hold at every level.

---

## Phase 6: User Story 4 - Install and play offline on a phone (Priority: P4)

**Goal**: The game installs to a home screen, launches standalone, and plays fully offline.

**Independent Test**: Load once online, install, enable airplane mode, launch from the icon, play a full game. (quickstart scenario 4)

### Tests for User Story 4 (write first, must fail)

- [X] T068 [P] [US4] Component tests in `src/ui/components/UpdatePrompt.test.tsx`: shows "Update available" when a new version is waiting, hidden while `status` is `playing` or `paused`, calls the update handler on accept
- [X] T069 [P] [US4] Build check in `tests/integration/pwaBuild.test.ts`: the manifest in the PWA config has `name` "nōmən", `display` "standalone", 192 and 512 px icons and a maskable icon, and the precache glob includes the noun list

### Implementation for User Story 4

- [X] T070 [US4] Configure `vite-plugin-pwa` in `vite.config.ts`: `generateSW`, `registerType: 'prompt'`, precache app shell, icons and `nouns.txt`, manifest with name and short name `nōmən`, `display: standalone`, `orientation: portrait`, theme and background colours (research R9)
- [X] T071 [P] [US4] Add icons to `public/icons/` (192, 512, maskable 512, favicon, apple-touch-icon) and the related `<link>` and `<meta>` tags (theme-color, viewport with `viewport-fit=cover`) to `index.html`
- [X] T072 [US4] Implement `src/ui/components/UpdatePrompt.tsx` and register the service worker in `src/main.tsx`, offering updates only on the ready and game-over screens
- [X] T073 [US4] Complete responsive layout in `src/ui/styles/app.css`: no horizontal scroll at 320 px, 6 by 2 board at 720 px and up, safe-area insets, light and dark themes meeting WCAG 2.1 AA, `prefers-reduced-motion` handling (FR-032, FR-033). Superseded by Phase 10: the stylesheet is now `app.scss` on Bootstrap Lumen, light only
- [ ] T074 [US4] (automated parts done, see quickstart "Validation record"; **real-phone install and airplane-mode check still to do by hand**) Run quickstart scenario 4 against `npm run preview` (installability, offline reload, Lighthouse accessibility 90 or more, 320 px layout, real phone) and record results in `specs/001-nomen-noun-puzzle/quickstart.md`

**Checkpoint**: The game is an installable, offline-capable PWA.

---

## Phase 7: User Story 5 - Keep a personal best (Priority: P5)

**Goal**: Best score and highest level persist on the device and a new best is called out.

**Independent Test**: Finish a game, reload, confirm the best is shown; beat it and confirm the update. (quickstart scenario 5)

### Tests for User Story 5 (write first, must fail)

- [X] T075 [P] [US5] Unit tests in `src/infrastructure/localStorageScoreStore.test.ts`: round-trips a `PersonalBest` under key `nomen.best.v1`; returns null when missing, malformed JSON or wrong shape; `load` returns null and `save` returns false without throwing when `localStorage` throws
- [X] T076 [P] [US5] Extend `src/domain/gameEngine.test.ts` with `memoryScoreStore`: `expireIfDue` saves and sets `isNewBest: true` when the score exceeds the stored score or none is stored; does not save and sets false otherwise; `personalBest` returns the stored record
- [X] T077 [P] [US5] Extend `src/ui/components/StartScreen.test.tsx` and `src/ui/components/GameOver.test.tsx`: personal best shown when present, absent when null, new-best notice shown when `isNewBest`
- [X] T078 [US5] Integration test in `tests/integration/personalBest.test.tsx`: acceptance scenarios 1 to 5 of User Story 5

### Implementation for User Story 5

- [X] T079 [P] [US5] Implement `src/infrastructure/localStorageScoreStore.ts`
- [X] T080 [US5] Add personal-best save and `isNewBest` to `expireIfDue`, and `personalBest`, in `src/domain/gameEngine.ts`
- [X] T081 [US5] Show the personal best in `src/ui/components/StartScreen.tsx` and `src/ui/components/GameOver.tsx`, add the new-best announcement to `src/ui/components/Announcer.tsx`, and wire `localStorageScoreStore` in `src/main.tsx`

**Checkpoint**: All five user stories are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates and items that span stories

- [X] T082 [P] Add CI in `.github/workflows/ci.yml` running lint, typecheck, test with coverage and build on every push and pull request
- [X] T083 [P] Keyboard-only and touch-only full-game pass against `contracts/ui-contract.md`; fix gaps in `src/ui/components/` and add regression tests alongside (SC-008)
- [X] T084 [P] Add a performance test in `src/domain/performance.test.ts`: submit plus refill against the real noun list completes within the 100 ms budget and one solvability check within 10 ms (SC-003)
- [X] T085 Check bundle budgets after `npm run build` (initial JS under 200 KB gzipped excluding the word list; word list under 150 KB gzipped) and record the figures in `specs/001-nomen-noun-puzzle/plan.md`
- [X] T086 Review coverage report from `npm test`: confirm 80% or more on all four measures, domain modules at 95% or more, and add tests for any gap in `src/**` rather than adding exclusions (SC-009)
- [X] T087 DRY and SOLID review of `src/**`: no literal 12, 3, 8, 0.4 or letter values outside `src/domain/constants.ts`; no level formula outside `src/domain/levels.ts`; no domain import of React or browser APIs; concrete adapters named only in `src/main.tsx`
- [X] T088 [P] Write `README.md` with a description of the game, the rules, and links to the spec, plan and quickstart
- [ ] T089 (scenarios 1 to 5 exercised by automated tests and a headless-browser run; **blocked only on the manual phone steps of T074**) Run every scenario in `specs/001-nomen-noun-puzzle/quickstart.md` end to end and fix any failure

---

## Phase 9: Vowel cap (FR-003 revision, 2026-10-11)

**Purpose**: Play showed boards filling with vowels. FR-003 now requires 40% to 50% vowels (5 or 6 of 12).

**Independent Test**: Start several games and play words; every board shows 5 or 6 vowels.

### Tests (write first, must fail)

- [X] T090 [P] Extend `src/domain/constants.test.ts`: `MAX_VOWELS === 6`; `CONSONANTS` has 21 letters, none a vowel, and with `VOWELS` covers the alphabet
- [X] T091 [P] Rewrite `src/domain/letterBag.test.ts` for `drawVowel` and `drawConsonant`: each stays in its pool and tracks the Scrabble weights; hard consonants more than double by level 10; boost capped from level 13; vowel weights unchanged by level
- [X] T092 [P] Extend `src/domain/boardGenerator.test.ts`: deals and refills have between `MIN_VOWELS` and `MAX_VOWELS` vowels; both 5- and 6-vowel boards occur; a refill after using only consonants stays in range; the fallback board stays in range; `isValidBoard` rejects `MAX_VOWELS + 1` vowels
- [X] T093 Change the fixed boards in `tests/support/renderGame.tsx` and the tests that share them to boards with 5 or 6 vowels (`CATDOGEINUSE`, `QUIZJAZZETON`), and assert the upper bound in `tests/integration/coreLoop.test.tsx`

### Implementation

- [X] T094 Add `MAX_VOWEL_RATIO = 0.5`, derived `MAX_VOWELS = floor(BOARD_SIZE * MAX_VOWEL_RATIO)` and derived `CONSONANTS` to `src/domain/constants.ts`
- [X] T095 Add `drawConsonant()` to `src/domain/letterBag.ts` and remove the any-letter `draw()`, which no longer has a caller
- [X] T096 In `src/domain/boardGenerator.ts`, draw an exact vowel count within the allowed range for deals and refills, limit fallback nouns to 3 vowels each and pad with consonants, and make `isValidBoard` enforce the maximum
- [X] T097 Re-run the 100,000-board property test (`src/domain/boardGenerator.property.test.ts`, now checking 5 or 6 vowels) and record the vowel distribution and first-draw solvability by level in `specs/001-nomen-noun-puzzle/research.md` R3

---

## Phase 10: UX revision on Bootstrap Lumen (2026-10-11)

**Purpose**: Restyle the whole interface with Bootstrap 5 and the Bootswatch Lumen theme. Behaviour is unchanged.

**Independent Test**: Open the game: Lumen blue app bar, Source Sans Pro text, raised dark tiles, blue primary buttons; it still plays and installs offline, and no request leaves the device.

- [X] T098 Add `bootstrap`, `bootswatch`, `@fontsource/source-sans-pro` and dev dependency `sass-embedded` to `package.json`; silence Bootstrap's Sass deprecation warnings in `vite.config.ts`
- [X] T099 Write `tests/integration/theme.test.ts` (compiles the stylesheet): Lumen primary `#158cba` and Source Sans Pro present; the Bootstrap components in use are present; buttons have Lumen's raised uppercase style and a 44 px minimum; **no `@import url` and no external URL**
- [X] T100 [P] Extend component tests for the Bootstrap hooks: tile is `btn btn-dark` in `src/ui/components/Tile.test.tsx`; warning clock bar is `progress-bar-striped bg-danger` in `ClockBar.test.tsx`; feedback uses `text-success-emphasis` in `Announcer.test.tsx`; Submit is `btn btn-primary btn-lg` in `Controls.test.tsx`
- [X] T101 [P] Extend `tests/integration/pwaBuild.test.ts`: precache includes `woff2`; manifest `theme_color` is `#158cba`
- [X] T102 Replace `src/ui/styles/app.css` with `src/ui/styles/app.scss`: Lumen variables with `$web-font-path: false`, the needed Bootstrap partials, Lumen's overrides, then the game rules (tile grid, tray, 44 px targets, short-phone and wide layouts, reduced motion)
- [X] T103 Restyle `src/ui/App.tsx` (Lumen `navbar` app bar, `container`) and every component in `src/ui/components/` with Bootstrap classes: `card` panels, `btn` tiles and controls, `progress` score and clock bars, `alert` notices
- [X] T104 Import the bundled font and stylesheet in `src/main.tsx`; add `woff2` to the precache globs and the Lumen colours to the manifest in `pwa.config.ts`; update `theme-color` in `index.html`
- [X] T105 Verify in headless Chromium against `npm run preview`: layout at 320 by 568, 390 by 844 and 1024 by 768 (no overflow, no control under 44 px), font loaded, zero requests to other hosts, axe WCAG 2.1 AA on start, playing and paused screens, Lighthouse accessibility; record results in `specs/001-nomen-noun-puzzle/plan.md`

---

## Phase 11: User Story 6 - Read about the game and its rules (Priority: P6)

**Goal**: Two static pages, About nōmən and Game play rules, reachable from every screen and offline.

**Independent Test**: Open Rules and About from the navigation, check their content, return to the game; repeat offline. (quickstart scenario 6)

### Tests for User Story 6 (write first, must fail)

- [X] T106 [P] [US6] Unit tests in `src/ui/routes.test.ts`: the three routes with hashes `#/`, `#/rules`, `#/about`; `routeFromHash` falls back to the game for empty or unknown hashes
- [X] T107 [P] [US6] Hook tests in `src/ui/hooks/useHashRoute.test.tsx`: starts on the route in the address, follows `hashchange`, stops after unmount
- [X] T108 [P] [US6] Component tests in `src/ui/components/NavBar.test.tsx`: wordmark `h1`, `navigation` "Pages" with Play, Rules and About links, `aria-current="page"` on the current one only
- [X] T109 [P] [US6] Page tests in `src/ui/pages/RulesPage.test.tsx`: title takes focus; states 12 tiles, 5 or 6 vowels, at least 2 nouns, 3 to 8 letters, one use per tile; "Letter values" table lists all 26 letters under the value in `LETTER_VALUES`; "Levels" table rows equal `levelConfig(1..10)`; link back to the game
- [X] T110 [P] [US6] Page tests in `src/ui/pages/AboutPage.test.tsx`: title takes focus; says the Latin word means “name” and “noun”; at least 5 sections and more than 400 words; Latin marked with `lang="la"`; links to the rules and the game
- [X] T111 [US6] Integration test in `tests/integration/pages.test.tsx`: navigate to both pages and back; start-screen "Full rules" link; direct load on a page; leaving a game pauses it, loses no time, ignores typing, and needs Resume on return

### Implementation for User Story 6

- [X] T112 [P] [US6] Implement `src/ui/routes.ts` and `src/ui/hooks/useHashRoute.ts`
- [X] T113 [P] [US6] Implement `src/ui/components/NavBar.tsx` and the shared page frame `src/ui/pages/Page.tsx`
- [X] T114 [P] [US6] Implement `src/ui/pages/RulesPage.tsx`, taking every number, the letter table and the level table from `src/domain/constants.ts` and `src/domain/levels.ts`
- [X] T115 [P] [US6] Write `src/ui/pages/AboutPage.tsx`: *nōmen* as name and noun, the word's family in English, the Roman three names, *nomen est omen*, the game's spelling, and the game itself
- [X] T116 [US6] Wire routing into `src/ui/App.tsx` (pages, pause on leaving the game, keyboard input only on the game), add the "Full rules" link to `src/ui/components/StartScreen.tsx`, and style the navigation and pages in `src/ui/styles/app.scss`
- [X] T117 [US6] Verify in headless Chromium against `npm run preview` (quickstart scenario 6) and record the results in `specs/001-nomen-noun-puzzle/quickstart.md`

**Checkpoint**: Six user stories are functional.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Setup; blocks all user stories
- **US1 (Phase 3)**: depends on Foundational
- **US2 (Phase 4)**: depends on US1 (the clock wraps the word loop)
- **US3 (Phase 5)**: depends on US2 (level changes the clock allowance)
- **US4 (Phase 6)**: depends on US1 only; can run in parallel with US2 and US3
- **US5 (Phase 7)**: depends on US2 (needs game over)
- **Polish (Phase 8)**: depends on all stories to be shipped
- **Vowel cap (Phase 9)**: a revision of US1's board rules; depends on US1
- **UX revision (Phase 10)**: replaces the styling from T044 and T073; depends on all stories
- **US6 (Phase 11)**: depends on US2 (pause) and the Phase 10 styling

### Requirement Coverage

| Requirements | Tasks |
|---|---|
| FR-001 to FR-005 (board) | T007, T020 to T022, T031 to T033, T061, T090 to T097 |
| FR-006 to FR-011 (building a word) | T023, T027, T028, T034, T039 to T041 |
| FR-012 to FR-016 (validation, scoring) | T013 to T017, T019, T024 to T026, T030, T035 to T037 |
| FR-017 to FR-021 (clock) | T045 to T057 |
| FR-022 to FR-027 (levels) | T011, T012, T058 to T067 |
| FR-028, FR-029 (game over, records) | T049, T056, T075 to T081 |
| FR-030, FR-031 (install, offline) | T069 to T072, T074 |
| FR-032, FR-033 (responsive, accessible) | T027, T044, T073, T083, T098 to T105 |
| FR-034 (no accounts, no data leaves device) | T070 (no runtime network), T087, T099 and T105 (no external font request) |
| SC-002, SC-003, SC-008, SC-009 | T061, T084, T083, T003 and T086 |
| SC-004, SC-005, SC-006, SC-007 | T048 and T050, T074, T085, T074 |
| FR-035 to FR-038, SC-011 (information pages) | T106 to T117 |
| SC-001, SC-010 (playtest outcomes) | Measured in playtests after T089; not automatable |

### Within Each User Story

- Test tasks come first and MUST fail before the matching implementation task starts
- Pure domain before engine, engine before hooks, hooks before components, components before `App`
- The story's integration test passes last

### Parallel Opportunities

- Setup: T004, T005, T006 after T001
- Foundational: T008, T009, T010, T011, T013, T016, T018 after T007
- US1 tests T019 to T028 are all independent files; US1 implementation T030, T031, T032, T034, T035 in parallel, then T033, T036, T037 in order; components T039 to T042 in parallel
- US4 can be developed alongside US2 and US3 by a second person once US1 is done

---

## Parallel Example: User Story 1

```bash
# Write all US1 domain tests together:
Task: "Unit tests in src/domain/scoring.test.ts"
Task: "Unit tests in src/domain/letterBag.test.ts"
Task: "Unit tests in src/domain/solvability.test.ts"
Task: "Unit tests in src/domain/selection.test.ts"
Task: "Unit tests in src/domain/wordValidator.test.ts"

# Then implement the independent domain modules together:
Task: "Implement scoring in src/domain/scoring.ts"
Task: "Implement letter bag in src/domain/letterBag.ts"
Task: "Implement solvability in src/domain/solvability.ts"
Task: "Implement selection in src/domain/selection.ts"
Task: "Implement validator in src/domain/wordValidator.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: User Story 1
4. **Stop and validate**: quickstart scenario 1; an untimed but complete word puzzle

### Incremental Delivery

1. Setup + Foundational: foundation ready
2. US1: playable puzzle (MVP)
3. US2: timed game with an ending
4. US3: levels and rising difficulty
5. US4: installable and offline
6. US5: personal best
7. Polish: gates, budgets, review

Each step leaves `npm test` green with coverage at or above 80%.

---

## Notes

- [P] tasks touch different files and have no dependency on incomplete tasks
- Tasks that say "Extend" add cases to an existing test file and are not parallel with other tasks on that file
- Never lower the coverage threshold or add an exclusion to make a run pass
- Commit after each task or logical group; stop at any checkpoint to validate the story on its own
