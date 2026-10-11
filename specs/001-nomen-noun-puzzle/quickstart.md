# Quickstart: nōmən

How to run the game and prove it works. Commands assume the scripts defined by task T001 to T006
in [tasks.md](./tasks.md). Rules are in [spec.md](./spec.md); types in
[contracts/](./contracts/); numbers in [data-model.md](./data-model.md).

## Prerequisites

- Node.js 22 LTS or newer and npm
- A current Chrome or Edge for the installability check; a phone for the on-device check

## Setup

```bash
npm install
npm run build:words   # generates src/assets/nouns.txt from WordNet
```

Expected: `build:words` prints the number of nouns written and the file size. The file contains
only lowercase lines matching `^[a-z]{3,8}$`.

## Run

```bash
npm run dev           # development server
npm run build         # type-check and production build into dist/
npm run preview       # serve dist/ locally, service worker active
```

## Automated validation

```bash
npm run lint          # ESLint, including the domain import boundary rule
npm run typecheck     # tsc --noEmit
npm test              # all unit and integration tests with coverage
```

Expected:

- All tests pass.
- The coverage summary shows 80% or more for statements, branches, functions and lines. Lowering
  coverage below 80% makes `npm test` exit non-zero (SC-009).
- The board-guarantee property test reports 100,000 generated boards and refills across levels 1
  to 20 with zero violations (SC-002).

## Manual validation scenarios

Run against `npm run preview`.

### 1. Core loop (User Story 1)

1. Press **Play**. Confirm 12 tiles with point values, 5 or 6 of them vowels.
2. Spell a noun you can see, by tapping. Press **Submit**.
3. Confirm the score rises by the sum of the tile values, exactly the used tiles change, and the
   others stay in place.
4. Spell a non-noun of 3 or more letters and submit. Confirm a rejection message, unchanged score
   and board, and an empty tray.
5. Select a tile, then try to select it again. Confirm it cannot be reused.
6. Play the same loop using only the keyboard: letters, Backspace, Escape, Enter.

### 2. Clock (User Story 2)

1. Start a game. Confirm the countdown starts at 60 and falls.
2. Submit a valid noun. Confirm the countdown returns to full.
3. Press **Pause**. Confirm the countdown stops and letters are hidden. Resume and confirm it
   continues from the same value.
4. Switch to another tab for 10 seconds and return. Confirm the game is paused and no time was lost.
5. Let the countdown reach zero. Confirm the game-over summary and that tiles no longer respond.
6. Check the final 10 seconds show the warning state.

### 3. Levels (User Story 3)

1. Play until the score reaches 30. Confirm level 2, a level-up notice, and a 55 second countdown.
2. Confirm the progress bar tracks the next target (70).

### 4. Install and offline (User Story 4)

1. In Chrome DevTools, Application panel: confirm the manifest has no installability errors and
   the service worker is activated.
2. Install the app. Confirm it opens in its own window with the game's name and icon.
3. Tick **Offline** in the Network panel and reload. Confirm the game loads and a full game,
   including word validation, works.
4. Run a Lighthouse audit. Confirm the accessibility score is 90 or more (SC-007).
5. In device emulation at 320 by 568, confirm nothing scrolls horizontally and all controls are
   visible.
6. On a real phone: open the preview URL over HTTPS (or a tunnel), add to home screen, enable
   airplane mode, launch from the icon and play.

### 5. Personal best (User Story 5)

1. Finish a game. Confirm the score is shown as the personal best.
2. Reload. Confirm the best is still shown on the start screen.
3. Finish a higher-scoring game. Confirm the new-best notice and updated value.
4. In a private window with storage blocked, confirm the game still plays.

### 6. About and Rules pages (User Story 6)

1. From the start screen choose **Rules**. Confirm the board, word, scoring, clock and level
   sections, the letter-value table and the level table (level 1: 60 s, 30; level 10: 15 s, 630).
2. Choose **About**. Confirm it explains that *nōmen* means "name" and "noun" and tells the longer
   story.
3. Use the browser's back button and the **Play** link; confirm both return to the game.
4. Start a game, wait a few seconds, open **Rules**, wait, return. Confirm the game is paused with
   the same time remaining, and continues only after **Resume**.
5. Go offline and reload while on `#/about`. Confirm the page still appears.

## Validation record (2026-10-11)

Run against `npm run preview` with headless Chromium, plus the automated suite.

| Check | Result |
|---|---|
| `npm run lint`, `npm run typecheck` | Clean |
| `npm test` | 200 tests pass; coverage 99.5% statements, 97.9% branches, 100% functions, 99.7% lines |
| Board-guarantee property test | 100,000 boards and refills, levels 1 to 20, 0 violations |
| Scenario 1, core loop | Pass in the browser: 12 tiles, 7 vowels, a typed noun scored and only its tiles changed; a non-noun was rejected |
| Scenario 2, clock | Pass in integration tests (fake clock); pause hides tiles in the browser |
| Scenario 3, levels | Pass in integration tests |
| Scenario 4, service worker and offline | Pass: worker activated; with the network disabled the page reloaded and a noun was validated and scored |
| Scenario 4, layout | Pass at 320 by 568, 390 by 844 and 1024 by 768: no horizontal or vertical overflow, no control under 44 px, 4 columns narrow and 6 wide |
| Scenario 4, Lighthouse | Accessibility 100, best practices 100 (start screen) |
| Scenario 4, install on a real phone, airplane mode | **Not done**: needs a physical device |
| Scenario 5, personal best | Pass in integration tests, including blocked storage |
| Scenario 6, pages | Pass in the browser at 320 px: navigation fits, focus lands on the page title, leaving a game pauses it and returning shows the pause screen, back button works, offline direct load of `#/about` works, axe reports 0 violations on both pages, no external requests |

## Troubleshooting

| Symptom | Check |
|---|---|
| **Play** stays disabled | `src/assets/nouns.txt` missing; run `npm run build:words` |
| No install prompt | Must be served over HTTPS or `localhost`, from `npm run preview` (not `dev`) |
| Offline reload fails | Load once online first so the service worker can precache |
| `npm test` fails on coverage only | Add tests; do not lower the threshold (constitution III) |
