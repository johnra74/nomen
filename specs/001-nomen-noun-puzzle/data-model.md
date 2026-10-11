# Data Model: nōmən

Phase 1 output. All entities are in-memory values except `PersonalBest`, which is persisted. Type
signatures are in [contracts/domain.ts](./contracts/domain.ts).

## Constants (single source of truth, `src/domain/constants.ts`)

| Name | Value | Source |
|---|---|---|
| `BOARD_SIZE` | 12 | FR-001 |
| `MIN_WORD_LENGTH` / `MAX_WORD_LENGTH` | 3 / 8 | FR-010, FR-012 |
| `VOWELS` | A E I O U | FR-003 |
| `MIN_VOWEL_RATIO` | 0.4 | FR-003 |
| `MIN_VOWELS` | `ceil(BOARD_SIZE * MIN_VOWEL_RATIO)` = 5 (derived) | FR-003 |
| `MAX_VOWEL_RATIO` | 0.5 | FR-003 |
| `MAX_VOWELS` | `floor(BOARD_SIZE * MAX_VOWEL_RATIO)` = 6 (derived) | FR-003 |
| `CONSONANTS` | the 21 letters not in `VOWELS` (derived) | FR-003 |
| `MIN_FORMABLE_WORDS` | 2 | FR-004 |
| `LETTER_VALUES` | A1 B3 C3 D2 E1 F4 G2 H4 I1 J8 K5 L1 M3 N1 O1 P3 Q10 R1 S1 T1 U1 V4 W4 X8 Y4 Z10 | FR-002 |
| `LETTER_WEIGHTS` | A9 B2 C2 D4 E12 F2 G3 H2 I9 J1 K1 L4 M2 N6 O8 P2 Q1 R6 S4 T6 U4 V2 W2 X1 Y2 Z1 | research R5 |
| `HARD_LETTERS` | J K Q V W X Z | FR-025 |
| `WARNING_SECONDS` | 10 | FR-021 |

## Entities

### Tile

| Field | Type | Rules |
|---|---|---|
| `id` | string | Unique within a game; a refilled position gets a new id |
| `letter` | `Letter` (A to Z) | Uppercase |

Point value is not stored; it is derived with `letterValue(letter)`.

### Board

An ordered list of exactly `BOARD_SIZE` tiles. Order is display position.

Invariants, true whenever the game is in `playing` or `paused`:

- Length is 12 (FR-001).
- Between `MIN_VOWELS` and `MAX_VOWELS` tiles are vowels, inclusive (FR-003).
- At least `MIN_FORMABLE_WORDS` distinct dictionary nouns of length 3 to 8 can be formed (FR-004).

### Selection

An ordered list of tile ids, 0 to `MAX_WORD_LENGTH` long.

- Every id refers to a tile on the current board.
- No id appears twice (FR-007).
- The spelled word is the letters of those tiles in order.

### LevelConfig

Derived from the level number by `levelConfig(n)`; never stored.

| Field | Type | Rule |
|---|---|---|
| `level` | integer, 1 or more | |
| `allowanceMs` | integer | `max(15, 60 - 5 * (level - 1)) * 1000` (FR-023) |
| `targetScore` | integer | 30, 70, 120, 180 for levels 1 to 4; then `180 + 75 * (level - 4)` (FR-024) |
| `hardLetterMultiplier` | number | `min(4, 1 + 0.25 * (level - 1))` (FR-025) |

`levelForScore(score)` returns the lowest level whose `targetScore` is greater than `score`. It is
non-decreasing in score.

| Level | Allowance (s) | Target (total score) | Hard-letter multiplier |
|---|---|---|---|
| 1 | 60 | 30 | 1.00 |
| 2 | 55 | 70 | 1.25 |
| 3 | 50 | 120 | 1.50 |
| 4 | 45 | 180 | 1.75 |
| 5 | 40 | 255 | 2.00 |
| 6 | 35 | 330 | 2.25 |
| 7 | 30 | 405 | 2.50 |
| 8 | 25 | 480 | 2.75 |
| 9 | 20 | 555 | 3.00 |
| 10 | 15 | 630 | 3.25 |
| 13+ | 15 | +75 per level | 4.00 |

### PlayedWord

| Field | Type |
|---|---|
| `word` | string (uppercase) |
| `score` | integer |
| `level` | integer, the level the player was on when it was played |

### GameState

| Field | Type | Rules |
|---|---|---|
| `status` | `'ready' \| 'playing' \| 'paused' \| 'over'` | See state machine |
| `board` | `Board` | Empty in `ready` |
| `selection` | tile id list | Empty in `ready` and `over`; kept (hidden) while `paused` |
| `score` | integer, 0 or more | Sum of `history` scores |
| `level` | integer, 1 or more | Equals `levelForScore(score)` |
| `deadline` | number or null | Clock time at which the countdown expires; set only in `playing` |
| `remainingMs` | number or null | Set only in `paused` |
| `history` | `PlayedWord[]` | In order played |
| `lastResult` | `SubmitResult` or null | Drives feedback and announcements |
| `isNewBest` | boolean | Set on entering `over` |

Derived, not stored: current word text, progress to next target, best word, words played.

### SubmitResult

Either `{ kind: 'accepted', word, score, leveledUpTo? }` or `{ kind: 'rejected', word, reason }`
where `reason` is `'too-short' | 'too-long' | 'not-a-noun'`.

### PersonalBest (persisted)

| Field | Type |
|---|---|
| `score` | integer |
| `level` | integer |
| `achievedAt` | ISO 8601 date string |

Stored as JSON under the key `nomen.best.v1`. A missing, unreadable or malformed record is treated
as no record. Updated when a finished game's score exceeds the stored score, or exceeds zero when
nothing is stored (FR-029). A scoreless game is never recorded as a best.

### Dictionary (read-only reference data)

The noun list: lowercase words matching `^[a-z]{3,8}$`. Exposed through the `Dictionary` port as a
membership test and an iteration grouped by sorted-letter signature.

## State machine

```text
            START                 EXPIRE
  ready ------------> playing ------------> over
                       ^   |                  |
                RESUME |   | PAUSE            | START
                       |   v                  v
                      paused               playing (new game)
```

| Action | From | To | Effect |
|---|---|---|---|
| `START { board, now }` | ready, over | playing | Score 0, level 1, empty history and selection, deadline = now + level 1 allowance |
| `SELECT_TILE { tileId }` | playing | playing | Append if tile is on the board, not selected, and selection is shorter than 8 |
| `SELECT_LETTER { letter }` | playing | playing | Append the first unselected tile with that letter, if any |
| `REMOVE_LAST` | playing | playing | Drop the last selected tile |
| `CLEAR_SELECTION` | playing | playing | Empty the selection |
| `SHUFFLE { order }` | playing | playing | Reorder the board by the given permutation; selection and deadline unchanged |
| `WORD_ACCEPTED { word, score, board, now }` | playing | playing | Add score; recompute level; append to history; replace board; clear selection; deadline = now + new level's allowance |
| `WORD_REJECTED { word, reason }` | playing | playing | Clear selection; record result; deadline unchanged |
| `PAUSE { now }` | playing | paused | remainingMs = deadline - now; deadline cleared |
| `RESUME { now }` | paused | playing | deadline = now + remainingMs |
| `EXPIRE { isNewBest }` | playing | over | Clear selection and deadline |

Any action not listed for the current status is ignored and returns the same state object.

## Validation rules

| Rule | Where enforced | Requirement |
|---|---|---|
| Selection length at most 8 | `selection`, reducer | FR-010 |
| A tile selected at most once | `selection`, reducer | FR-007 |
| Letter must have an unselected tile | `selection` | FR-008 |
| Word length 3 to 8 | `wordValidator` | FR-012 |
| Word is in the noun list | `wordValidator` via `Dictionary` | FR-012, FR-013 |
| Submission only while time remains | `gameEngine.submit` compares `clock.now()` with `deadline` | FR-019 |
| Board has 5 or 6 vowels and at least 2 formable nouns | `boardGenerator` | FR-003, FR-004, FR-005 |
| Only used tiles change on refill unless a redeal is forced | `boardGenerator.refill` | FR-015 |
