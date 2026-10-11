# Research: nōmən

Phase 0 output. Each entry records a decision, why, and what was rejected. Items marked
**Verify at implementation** are assumptions about third-party packages that must be confirmed
when the dependency is installed; none of them blocks the design.

## R1. Build tooling and UI framework

- **Decision**: React 19 with TypeScript (strict), built by Vite.
- **Rationale**: React is a stated requirement. Vite gives a fast dev loop, first-class TypeScript,
  and shares its config with Vitest so tests and build agree on module resolution.
- **Alternatives considered**: Next.js (server features unused by an offline client-only game);
  Create React App (unmaintained).

## R2. Noun source and word list

- **Decision**: Extract nouns from WordNet at build time with `scripts/build-wordlist.ts`, write
  `src/assets/nouns.txt` (one lowercase word per line, sorted), and bundle it. The script reads the
  WordNet noun files through the `wordnet-db` npm package as a dev dependency.
- **Filter**: keep a lemma when it (a) has at least one noun sense, (b) matches `^[a-z]{3,8}$` after
  lowercasing, so no digits, hyphens, apostrophes or underscores (multi-word terms), and (c) is not
  exclusively a proper noun. Proper nouns are detected from the noun data file, where lemmas keep
  their capitalisation: a word is dropped when every noun sense spells it with a capital letter.
- **Rationale**: Confirmed with the requester. WordNet's licence permits redistribution with its
  notice, the result works offline, and a local list is the only way to compute the "at least 2
  formable nouns" guarantee on the device.
- **Alternatives considered**: online dictionary API (breaks offline play and the board guarantee);
  a Scrabble word list (no part-of-speech data, and the common lists are not freely licensed);
  WordNet intersected with a frequency list (friendlier vocabulary, but offered and not chosen).
- **Open tuning item, regular plurals**: WordNet indexes base forms, so "CAT" is listed but "CATS"
  is not, except for plurals that have their own entry. Players will reasonably try plurals,
  especially with S worth 1 point and common on the board. As approved, v1 accepts only what
  WordNet lists. If playtests show frustration, the build script is the single place to change:
  generate regular plurals for count nouns, or reduce the weight of S. No game code changes.
- **Open tuning item, obscure words**: WordNet contains rare nouns. This only makes the game more
  permissive, and makes boards slightly easier to certify as solvable with words a player may not
  know. If that feels unfair, the solvability check can use a smaller "common" subset while
  validation uses the full list; `solvability` already takes its dictionary as a parameter.
- **Verified at implementation**: `wordnet-db` 3.1.14 exposes `path` pointing at `dict/data.noun`
  (WordNet 3.1). The filter yields **21,898 nouns**, 158.1 KB raw and 62.4 KB gzipped, well inside
  the 150 KB budget. The WordNet licence ships as `public/licenses/WORDNET-LICENSE.txt`.
  Spot checks: "cat", "china", "quiz", "idea" are in; "cats", "children", "paris" are out. Some
  irregular plurals with their own entry (for example "men") are in.

## R3. Guaranteeing vowels and solvability

- **Decision**: Generate-and-test with a constructive fallback.
  1. Count vowels among tiles that stay. Work out how many of the new tiles must be vowels
     (`MIN_VOWELS - staying`) and how many may be (`MAX_VOWELS - staying`), pick a number in that
     range at random, and draw exactly that many from the vowel bag and the rest from the
     consonant bag.
  2. Test solvability. If it passes, done.
  3. Otherwise redraw the new tiles, up to 50 attempts.
  4. If still failing, redeal all 12 tiles the same way, up to 50 attempts.
  5. If still failing, build a board constructively: pick two nouns from the dictionary whose
     combined letters fit in 12 tiles (each at most 6 letters, 3 vowels and 3 consonants), place
     them, pad with vowels to reach the minimum and then with consonants.
     This always succeeds, so the function always terminates with a valid board.
- **Rationale**: Random draws with five or six vowels almost always admit two short nouns, so step
  1 normally succeeds on the first try and the board feels random. The fallback makes the
  guarantee unconditional rather than probabilistic, which SC-002 requires.
- **Revision, 2026-10-11 (vowel maximum)**: the first version forced 5 vowels and drew the other 7
  tiles from the full Scrabble-weighted bag, which is itself about 43% vowels (42 of 98). Boards
  averaged about 8 vowels, and refills drifted the same way, which play showed to be too easy.
  FR-003 now caps vowels at 50%, and vowels and consonants are drawn from separate bags so the
  split is exact. Measured on the real noun list over 4,000 boards per level: every board has 5 or
  6 vowels (about half each); a first random draw is solvable 100.00% of the time at levels 1 to
  10 and 99.98% at levels 13 and 20, so the fallback is effectively never needed; boards offer on
  average 166 formable nouns at level 1 and about 100 at level 20.
- **Alternatives considered**: always constructing boards around hidden words (boards feel
  engineered and refills would disturb unused tiles); unbounded retry (no termination guarantee).

## R4. Solvability check

- **Decision**: At load, index the noun list by sorted-letter signature (for example `act` maps to
  `act`, `cat`). To test a board, compute its 26 letter counts and scan the signatures, counting
  words whose letter counts fit within the board's. Stop as soon as 2 are found.
- **Rationale**: A few tens of thousands of comparisons of small count vectors is well under the
  10 ms budget, needs no clever data structure, and early exit makes the common case far faster.
- **Alternatives considered**: trie with backtracking over the board (faster in theory, more code,
  not needed at this size); enumerating all subsets of the board (up to 4,017 multisets of size 3
  to 8 from 12 tiles is fine, but the scan is simpler and already fast enough).

## R5. Letter distribution and difficulty

- **Decision**: Base weights are the standard English Scrabble tile counts (A9 B2 C2 D4 E12 F2 G3
  H2 I9 J1 K1 L4 M2 N6 O8 P2 Q1 R6 S4 T6 U4 V2 W2 X1 Y2 Z1), without blanks. For level `n`, the
  weights of the hard letters J, K, Q, V, W, X, Z are multiplied by `min(4, 1 + 0.25 * (n - 1))`.
- **Rationale**: Scrabble's distribution is tuned for English word formation and matches the
  scoring system already in use. A single multiplier is one number to tune.
- **Alternatives considered**: uniform letters (unplayable boards); English text frequency (very
  similar outcome, but a second table to maintain alongside the Scrabble values).

## R6. Level curve

- **Decision**: `allowanceSeconds(n) = max(15, 60 - 5 * (n - 1))`. Cumulative score target to clear
  level `n`: 30, 70, 120, 180 for `n` = 1 to 4, then `180 + 75 * (n - 4)`. A level is a pure
  function of total score.
- **Rationale**: Confirmed levers are a shrinking clock, score targets and harder letters. A typical
  short noun scores 5 to 8 points, so early levels take about 5 words each. The numbers are
  starting values in one table, to be tuned from playtests against SC-010.
- **Alternatives considered**: rising minimum word length and word-count targets (offered, not
  chosen); lives instead of sudden death (offered, not chosen).

## R7. Timer accuracy

- **Decision**: Deadline-based countdown. On start or reset, store `deadline = clock.now() +
  allowance`. Remaining time is `deadline - clock.now()`, read on each animation frame for display.
  Expiry is detected from the same calculation. Pausing stores remaining milliseconds; resuming
  sets a new deadline. `clock.now()` is monotonic (`performance.now()` in the browser adapter).
  As built, the display repaints from a 100 ms interval rather than every animation frame: the
  clock shows whole seconds, expiry is still detected within 100 ms (SC-004 allows 250 ms), and an
  interval is simpler to test deterministically.
- **Rationale**: Interval timers drift and are throttled in background tabs. A deadline is immune
  to both, which is what SC-004 needs. Auto-pause on `visibilitychange` stops a backgrounded app
  from silently running out the clock.
- **Alternatives considered**: `setInterval` decrementing a counter (drifts, throttled);
  `Date.now()` (jumps if the device clock changes).

## R8. State management

- **Decision**: React `useReducer` with a pure `gameReducer`, held by the `useGame` hook in `App`
  (no context: there is a single consumer). Commands
  that need ports (start, submit) go through `gameEngine` in event handlers and dispatch plain
  result actions.
- **Rationale**: One screen and one state object do not justify a state library. Keeping
  randomness out of the reducer keeps it pure and deterministic.
- **Alternatives considered**: Redux Toolkit or Zustand (extra dependency, no benefit at this
  size); reducer factory closing over the ports (impure; Strict Mode calls reducers twice).

## R9. PWA delivery

- **Decision**: `vite-plugin-pwa` in `generateSW` mode with `registerType: 'prompt'`. Precache the
  app shell, icons and `nouns.txt`. Manifest: name and short name `nōmən`, `display: standalone`,
  `orientation: portrait`, theme and background colours, icons at 192 and 512 px plus a maskable
  icon. An in-app prompt offers updates; it never reloads during a game.
- **Rationale**: The plugin generates the service worker and manifest from the Vite build with
  little configuration. Prompted updates satisfy User Story 4 scenario 5.
- **Alternatives considered**: hand-written service worker (more code to test and maintain);
  auto-update (could reload mid-game).
- **"Saved as an HTML5 mobile application"**: met by PWA installation on Android (install prompt)
  and iOS (Add to Home Screen). Store packaging through a wrapper such as Capacitor is possible
  later without changing game code, and is out of scope.
- **Verify at implementation**: the non-ASCII name renders correctly on Android and iOS home
  screens; if not, keep `nōmən` as `name` and use `nomen` as `short_name`.

## R10. Testing strategy and the 80% gate

- **Decision**: Vitest with v8 coverage and thresholds of 80 for lines, branches, functions and
  statements in `vite.config.ts`, so `npm test` fails below the bar. React Testing Library and
  `user-event` for components. Fakes in `tests/support`: a seeded `RandomSource`, a manual
  `Clock`, an in-memory `ScoreStore`, and a small fixture `Dictionary`.
- **Layers**: unit tests colocated with every domain module, adapter, hook and component;
  property-style tests that generate many boards from seeds to check FR-003 and FR-004;
  integration tests that play whole games through the rendered app.
- **Rationale**: Injected time and randomness make every test deterministic (constitution III).
- **Alternatives considered**: Jest (separate transform config from Vite); browser end-to-end
  tests as the primary layer (slow, and coverage is required at unit level). A manual
  installability and offline check is in the quickstart instead.

## R11. Randomness

- **Decision**: `RandomSource` port with one method, `next(): number` in `[0, 1)`. The browser
  adapter uses `crypto.getRandomValues`; tests use a seeded generator.
- **Rationale**: One tiny seam makes board generation reproducible in tests.
- **Alternatives considered**: calling `Math.random()` directly in the domain (untestable without
  global mocking, violates constitution IV).

## R12. Styling

- **Decision (revised 2026-10-11)**: Bootstrap 5.3 with the Bootswatch **Lumen** theme, as
  requested. The stylesheet `src/ui/styles/app.scss` compiles Lumen from its Sass source, imports
  only the Bootstrap partials the game uses (reboot, type, containers, grid, buttons, navbar, card,
  progress, alert, helpers, utilities), and adds a small set of game rules: the tile grid (4 by 3
  in portrait, 6 by 2 wide), word tray, touch-target minimum and reduced-motion handling.
  Components use Bootstrap classes directly; no Bootstrap JavaScript or React component library
  is needed because the game has no dropdowns, modals or tooltips.
- **Why compile from source instead of using Bootswatch's prebuilt CSS**: the prebuilt file starts
  with an `@import` of Google Fonts. That is a network request at runtime, which breaks
  offline-first (constitution V) and sends the player's address to a third party (FR-034).
  Bootswatch exposes `$web-font-path`; setting it to `false` removes the import. Lumen's typeface,
  Source Sans Pro, is bundled through `@fontsource/source-sans-pro` (weights 400 and 700, latin)
  and precached. A test compiles the stylesheet and asserts it contains no external URL.
- **How Lumen maps onto the game**:
  - App bar: `navbar bg-primary`, carrying the wordmark.
  - Tiles: `btn btn-dark`. Lumen's buttons have a thick bottom edge and press down when tapped,
    which reads as a physical letter tile. Dark tiles give white-on-#555 text at 7.5:1, so the
    small point value is legible; Lumen's primary blue would only reach 3.9:1.
  - Primary actions (Play, Submit, Resume, Play again): `btn btn-primary btn-lg`, bold 20 px,
    which meets AA as large text. Secondary actions: `btn btn-secondary`.
  - Score and clock: `progress` bars; the clock turns `bg-danger progress-bar-striped` and adds
    the word "Hurry" in its last 10 seconds.
  - Panels (start, pause, game over): `card`. Notices: `alert`.
  - Feedback text uses Bootstrap's `-emphasis` shades, because Lumen's plain success green and
    danger red are too pale for text on white.
- **Consequences**: Lumen is light only, so the dark theme of the first version is gone. Sass
  prints deprecation warnings for Bootstrap 5.3's use of `@import`; they are silenced in
  `vite.config.ts` and will need attention when Bootstrap 6 or Sass 3 arrives.
- **Alternatives considered**: prebuilt Bootswatch CSS (runtime Google Fonts request);
  `react-bootstrap` (adds JavaScript for components the game does not use); keeping the original
  hand-written CSS (not what was asked for).
