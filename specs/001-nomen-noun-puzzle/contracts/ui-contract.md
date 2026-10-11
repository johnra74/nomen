# UI Contract: nōmən

The interface the game exposes to the player. Component tests assert against this contract through
accessible roles and names, not through implementation details.

## Navigation and pages

An app bar is always present: the wordmark `nōmən` (the page's `h1`) and a `navigation` landmark
named "Pages" with three links.

| Link | Address | Shows |
|---|---|---|
| Play | `#/` | The game (screens below) |
| Rules | `#/rules` | `region` "Game play rules" |
| About | `#/about` | `region` "About nōmən" |

- The current link has `aria-current="page"` and an underline.
- An unknown address shows the game.
- Opening a page moves focus to its `h2` title.
- Each page ends with a "Play the game" button; About also has "Read the rules". The start screen
  has a "Full rules" link.
- Opening a page while playing pauses the game. Returning shows the pause screen; nothing resumes
  by itself.
- Rules page tables: `table` "Letter values" (points, letters) and `table` "Levels" (level, time
  per word, score to clear it).

## Screens (by game status)

| Status | Shown |
|---|---|
| `ready` | Game name, short how-to-play text, personal best if any, **Play** button. Play is disabled with a loading note until the noun list is ready. |
| `playing` | Score panel, countdown, board, word tray, controls |
| `paused` | Pause overlay with **Resume**; board letters hidden; score panel visible |
| `over` | Final score, level reached, words played, best word, new-best notice if earned, personal best, **Play again** |

## Regions and accessible names

| Region | Role / name | Content |
|---|---|---|
| Score panel | `region` "Score" | Level, total score, progress bar to next target (`progressbar` "Progress to next level") |
| Countdown | `timer` "Time remaining" | Seconds remaining as text plus a bar; adds the text "Hurry" and a pattern change in the final 10 s |
| Board | `group` "Letter tiles" | 12 buttons |
| Tile | `button` "E, 1 point" | `aria-pressed="true"` and visually dimmed when selected; `disabled` when not playing |
| Word tray | `group` "Current word" | Selected letters in order, running point total |
| Feedback | `status` (polite live region) | Latest word result or game status |
| Time warning | visually hidden `aria-live="assertive"` region | "10 seconds left." |

## Controls

| Control | Pointer | Keyboard | Enabled when |
|---|---|---|---|
| Select tile | Tap or click the tile | Type its letter (A to Z, any case); or focus the tile and press Enter or Space | Playing, tile unselected, fewer than 8 selected |
| Remove last letter | **Delete** button | Backspace | Playing, selection not empty |
| Clear | **Clear** button | Escape | Playing, selection not empty |
| Submit | **Submit** button | Enter (when focus is not on a tile button) | Playing, 3 to 8 tiles selected |
| Shuffle | **Shuffle** button | Space (when focus is not on a button) | Playing |
| Pause / Resume | **Pause** / **Resume** button | Tab to the button, then Enter (no letter shortcut: every letter key picks a tile) | Playing / paused |
| Play / Play again | Button | Enter | Ready / over |

Typing a letter with no unselected tile produces a brief shake of the tray (suppressed under
reduced motion) and no state change.

## Announcements (live region)

| Event | Text |
|---|---|
| Word accepted | "CAT, 5 points. Score 31." |
| Rejected, not a noun | "ATE is not in the noun list." |
| Rejected, too short | "Words need at least 3 letters." |
| 10 seconds left | "10 seconds left." (once per countdown) |
| Paused | "Paused." |
| Game over | "Time's up. Final score 142, level 4." followed by "New personal best." when earned |
| Level up | appended to the accepted-word message: "CAT, 5 points. Score 31. Level 2. 55 seconds per word." |

## Layout

- Portrait from 320 px wide: board is 4 columns by 3 rows; order top to bottom is score panel,
  countdown, word tray, board, controls. Nothing scrolls horizontally.
- Wide (landscape or 720 px and up): board is 6 columns by 2 rows, centred with a maximum width.
- Every interactive target is at least 44 by 44 CSS px with at least 8 px spacing.
- Respects safe-area insets when installed.

## Visual states

- Selected tile: hollowed out, flattened and given a dashed outline, not colour alone. It stays focusable (`aria-disabled`).
- Countdown warning: colour change plus the "Hurry" label and a striped bar.
- Focus: a visible focus ring on every control.
- Reduced motion: no shake, no tile flip; changes are instant.
- Theme: Bootstrap with Bootswatch Lumen, light only, meeting WCAG 2.1 AA contrast. Tiles are dark
  raised buttons with white letters; primary actions are Lumen blue; the app bar is Lumen blue.

## Install and update

- Web app manifest: name `nōmən`, standalone display, portrait orientation, 192 and 512 px icons
  and a maskable icon.
- When a new version is waiting, a non-blocking **Update available** prompt is shown on the ready
  and game-over screens only, never during play.
