# Feature Specification: nōmən, a noun-building puzzle game

**Feature Branch**: `001-nomen-noun-puzzle`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "The name of the game is `nōmən`. The game genre is puzzle. It is a single player game. The player must type in a valid English noun from 3 to 8 characters. Player is presented with 12 characters. Game engine can present duplicate letters on the board. Player must compose an English noun using only the letters on the board. Once player selects the letter, player cannot reselect, duplicating it. Each letter follows the Scrabble points system. Once valid noun has been entered, numbers associated with letters are added up. Used letters on the board are replaced. Replacement should ensure at least 40% of the letters on the board are vowels. The board should always ensure at least 2 words can be formed with the letters available. Game also has a game clock. Player must enter a noun before time runs out. When player enters a valid English noun, the game clock resets. Game should have levels with difficulty increasing. Progressive web application written using ReactJS that can be saved as an HTML5 mobile application. Must follow SOLID and DRY principles with unit test coverage of 80% or higher."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build a noun from the board and score it (Priority: P1)

A player opens the game and sees a board of 12 letter tiles, each showing its point value. They
pick tiles to spell an English noun of 3 to 8 letters and submit it. If the noun is valid, the
tiles' points are added to their score and the used tiles are replaced with new letters. If it is
not valid, they are told why and can try again.

**Why this priority**: This is the game. Without it nothing else has meaning, and on its own it is
already a playable (untimed) word puzzle.

**Independent Test**: Start a game, spell a known noun from the tiles shown, submit, and confirm the
score rises by the sum of the tile values and only the used tiles change. Submit a non-noun and
confirm it is rejected with no score change.

**Acceptance Scenarios**:

1. **Given** a new game, **When** the board appears, **Then** it shows exactly 12 letter tiles, each
   with its point value, 5 or 6 of which are vowels, and at least 2 different valid nouns can
   be formed from them.
2. **Given** a board containing C, A and T, **When** the player selects those three tiles in order
   and submits, **Then** "CAT" is accepted, 5 points (3 + 1 + 1) are added to the score, and those
   three tiles are replaced with new letters while the other nine are unchanged.
3. **Given** a board with exactly one E, **When** the player has already selected that E, **Then**
   it cannot be selected again and typing E has no effect.
4. **Given** a board with two E tiles, **When** the player spells a word containing two Es, **Then**
   both tiles are used, one for each E.
5. **Given** the player has spelled letters that are not a valid noun (for example the verb-only
   "ATE"), **When** they submit, **Then** the word is rejected with a visible reason, the score is
   unchanged, the board is unchanged, and the selection is cleared.
6. **Given** fewer than 3 tiles are selected, **When** the player tries to submit, **Then**
   submission is not possible.
7. **Given** 8 tiles are selected, **When** the player tries to select a ninth, **Then** the ninth
   is not added.
8. **Given** tiles are selected, **When** the player removes the last letter or clears the
   selection, **Then** those tiles return to the board with no penalty.
9. **Given** any valid word has just been scored, **When** the board is refilled, **Then** it again
   has 5 or 6 vowels and at least 2 formable nouns.

---

### User Story 2 - Race the clock (Priority: P2)

A countdown runs while the player searches for a noun. Every valid noun resets the clock. If the
clock reaches zero, the game ends and the player sees their result and can start again.

**Why this priority**: The clock turns the word puzzle into a game with tension and an ending. It
depends on Story 1 but adds the core challenge.

**Independent Test**: Start a game and wait without submitting; confirm the game ends when the
countdown reaches zero. Start again, submit a valid noun partway through, and confirm the countdown
returns to its full value.

**Acceptance Scenarios**:

1. **Given** a game has started, **When** the board appears, **Then** a visible countdown begins
   from the current level's time allowance.
2. **Given** the countdown is running, **When** the player submits a valid noun, **Then** the
   countdown resets to the full allowance of the level they are now on.
3. **Given** the countdown is running, **When** the player submits an invalid word, **Then** the
   countdown keeps running without reset or penalty.
4. **Given** the countdown reaches zero, **When** time expires, **Then** the game ends immediately,
   no further tiles can be selected, and a summary shows final score, level reached, number of
   words and the highest-scoring word.
5. **Given** the game-over summary, **When** the player chooses to play again, **Then** a new game
   starts at level 1 with score 0 and a fresh board.
6. **Given** 10 seconds or fewer remain, **When** the countdown is displayed, **Then** it shows a
   warning state that does not rely on colour alone.
7. **Given** a game in progress, **When** the player pauses, **Then** the countdown stops and the
   letters are hidden; **When** they resume, **Then** the countdown continues from where it stopped
   with the same board.
8. **Given** a game in progress, **When** the app is sent to the background or the screen locks,
   **Then** the game pauses automatically.

---

### User Story 3 - Climb through levels of rising difficulty (Priority: P3)

As the player's score grows they clear levels. Each level gives less time per word and deals
harder letters, so the game becomes steadily more demanding.

**Why this priority**: Levels give long-term progression and replay value, but the game is playable
without them.

**Independent Test**: Play until the score reaches the level 1 target and confirm the level
indicator shows 2, the next countdown is shorter, and a level-up notice appears.

**Acceptance Scenarios**:

1. **Given** a new game, **When** it starts, **Then** the player is on level 1 with 60 seconds per
   word and a target of 30 points shown.
2. **Given** the player is on level 1 with 26 points, **When** they score a 5-point word, **Then**
   they advance to level 2, a level-up notice appears, and the countdown resets to 55 seconds.
3. **Given** a single word takes the score past more than one target, **When** it is scored,
   **Then** the player advances to the highest level whose entry target has been reached.
4. **Given** the player is on level 10 or above, **When** the countdown resets, **Then** it is 15
   seconds, the shortest allowance.
5. **Given** a higher level, **When** tiles are replaced, **Then** high-value consonants appear more
   often than at level 1, and the board still has 5 or 6 vowels and at least 2 formable nouns.
6. **Given** any level, **When** the player looks at the screen, **Then** they can see their level,
   score and progress toward the next level target.

---

### User Story 4 - Install and play offline on a phone (Priority: P4)

A player adds the game to their phone's home screen and plays it like a native app, including on a
plane or with no signal.

**Why this priority**: Installation and offline play are delivery qualities. They matter for
retention but are not needed to prove the game works.

**Independent Test**: Load the game once online, install it to the home screen, switch the device
to airplane mode, launch from the home screen icon, and play a full game.

**Acceptance Scenarios**:

1. **Given** a supported mobile or desktop browser, **When** the player visits the game, **Then**
   they can install it to their home screen or app launcher.
2. **Given** the game is installed, **When** it is launched from its icon, **Then** it opens
   full-screen without browser address bar, showing the game's name and icon.
3. **Given** the game has been loaded once, **When** the device has no network, **Then** the game
   starts and is fully playable, including word validation.
4. **Given** a phone screen 320 px wide in portrait, **When** the game is shown, **Then** all 12
   tiles, the current word, the countdown, the score and the controls are visible without
   horizontal scrolling.
5. **Given** a newer version has been published, **When** the player next opens the game online,
   **Then** they are offered the update without losing a game in progress.

---

### User Story 5 - Keep a personal best (Priority: P5)

The game remembers the player's best score and highest level on their device and celebrates when
they beat it.

**Why this priority**: A personal best gives a reason to return, but it is the least essential
piece.

**Independent Test**: Finish a game, note the score, close and reopen the game, and confirm the
best score is shown. Finish a higher-scoring game and confirm the best updates and is called out.

**Acceptance Scenarios**:

1. **Given** no previous games, **When** the first game ends, **Then** its score and level are
   stored as the personal best.
2. **Given** a stored best of 120, **When** a game ends with 150, **Then** the best becomes 150 and
   the summary indicates a new personal best.
3. **Given** a stored best of 120, **When** a game ends with 90, **Then** the best stays 120.
4. **Given** a stored best, **When** the game is closed and reopened, **Then** the best is still
   shown.
5. **Given** the device does not allow saving data, **When** a game ends, **Then** the game still
   works and simply shows no saved best.

---

### User Story 6 - Read about the game and its rules (Priority: P6)

A curious or first-time player opens a page explaining where the name nōmən comes from, and
another setting out the full rules of play, and can get back to the game from either.

**Why this priority**: The game is playable without them (the start screen carries a short
summary), but the pages answer the two questions new players ask: "what does the name mean?" and
"what exactly counts?".

**Independent Test**: From the start screen, open the rules page and confirm it states the board
size, word length, letter values and level table; open the about page and confirm it explains the
Latin word; return to the game. Repeat with the network off.

**Acceptance Scenarios**:

1. **Given** any screen, **When** the player looks at the top of the app, **Then** they see
   navigation to Play, Rules and About, with the current one marked.
2. **Given** the navigation, **When** the player chooses About, **Then** a page explains that the
   Latin word *nōmen* means both "name" and "noun", and tells the longer story of the word and of
   the game's name.
3. **Given** the navigation, **When** the player chooses Rules, **Then** a page sets out the board,
   how to build a word, what counts as a noun, scoring with every letter's value, the clock, the
   levels with their time and score targets, the keyboard controls and the personal best.
4. **Given** the rules page, **When** a game rule's number is changed in the game, **Then** the page
   shows the new number without separate editing.
5. **Given** either page, **When** the player chooses Play or the page's play button, **Then** they
   return to the game exactly as they left it.
6. **Given** a game in progress, **When** the player opens a page, **Then** the game pauses, no
   time is lost, and on return they must choose Resume to continue.
7. **Given** the game has been loaded once, **When** the device is offline, **Then** both pages
   still open, including when the app is opened directly on one of them.
8. **Given** a screen reader, **When** a page opens, **Then** focus moves to the page title.

---

### Edge Cases

- **Refill cannot meet the guarantees**: the randomly drawn replacement letters leave the board
  with fewer than 2 formable nouns. The game draws again, and if needed
  replaces the whole board. The player never sees a board that breaks either guarantee.
- **Player uses many vowels**: a word that uses most of the board's vowels forces the replacement
  letters to include enough vowels to restore the minimum.
- **Player uses only consonants**: on a board already at the vowel maximum, every replacement
  letter is a consonant, so vowels never accumulate from one word to the next.
- **Submission at the buzzer**: a word submitted at the instant the clock reaches zero. A
  submission counts only if it is made while time remains; at zero the game is over.
- **Typed letter not on the board**, or with all matching tiles already selected: ignored, with
  brief feedback, and no penalty.
- **Letter with several matching tiles**: typing picks one unselected matching tile; the player may
  also tap a specific tile.
- **Same noun twice**: a noun already played in this game may be played again if the letters are
  available. Repeats are allowed.
- **Word valid as a noun and as another part of speech** (for example "RUN"): accepted, since it is
  a noun.
- **Proper nouns, abbreviations, hyphenated or multi-word terms**: not accepted.
- **Device rotates or window resizes mid-game**: layout adapts; game state and clock are unaffected.
- **App reloaded or closed mid-game**: the game in progress is not restored; the personal best is.
- **Device clock changes or the app is suspended**: the countdown measures elapsed play time, so
  suspension triggers a pause rather than silently consuming time.
- **Very long sessions**: levels have no upper limit; time allowance stays at its floor and targets
  keep growing.

## Requirements *(mandatory)*

### Functional Requirements

**Board**

- **FR-001**: The game MUST present a board of exactly 12 tiles, each showing one letter A to Z. The
  same letter MAY appear on more than one tile.
- **FR-002**: Each tile MUST display its point value using the standard English Scrabble letter
  values: A1 B3 C3 D2 E1 F4 G2 H4 I1 J8 K5 L1 M3 N1 O1 P3 Q10 R1 S1 T1 U1 V4 W4 X8 Y4 Z10.
- **FR-003**: Every board presented to the player MUST have at least 40% and at most 50% vowel
  tiles, that is 5 or 6 of 12. Vowels are A, E, I, O and U; Y is not counted as a vowel.
- **FR-004**: Every board presented to the player MUST allow at least 2 different valid nouns to be
  formed, each obeying the word rules in FR-012.
- **FR-005**: When a refill cannot satisfy FR-003 and FR-004, the game MUST draw different
  replacement letters and, if necessary, replace the whole board. A board violating FR-003 or
  FR-004 MUST never be shown.

**Building a word**

- **FR-006**: Players MUST be able to add a tile to their word by tapping or clicking it, and by
  typing its letter on a keyboard.
- **FR-007**: A tile MUST be usable at most once in a word. A word containing a repeated letter
  needs a separate tile for each occurrence.
- **FR-008**: Players MUST NOT be able to use a letter that has no unselected tile on the board; the
  attempt is ignored with brief feedback.
- **FR-009**: Players MUST be able to remove the last selected letter and to clear the whole
  selection, with no penalty.
- **FR-010**: A selection MUST NOT exceed 8 tiles, and submission MUST be available only when 3 to 8
  tiles are selected.
- **FR-011**: Players MUST be able to shuffle the positions of the tiles. Shuffling MUST NOT change
  which letters are on the board, the current selection, or the countdown.

**Validation and scoring**

- **FR-012**: A submitted word MUST be accepted only if it is 3 to 8 letters long, is spelled
  entirely from distinct tiles on the current board, and appears in the game's noun list.
- **FR-013**: The noun list MUST consist of English common nouns that are single words made only of
  the letters A to Z. Proper nouns, abbreviations, and hyphenated or multi-word terms MUST be
  excluded. The list MUST be available without a network connection.
- **FR-014**: When a word is accepted, its score MUST be the sum of the point values of its tiles,
  and that score MUST be added to the player's total.
- **FR-015**: When a word is accepted, exactly the tiles used MUST be replaced with new letters in
  the same positions, and unused tiles MUST stay as they are, except where FR-005 requires more to
  change.
- **FR-016**: When a word is rejected, the game MUST show the reason, leave the score and board
  unchanged, clear the selection, and let the countdown continue.

**Clock**

- **FR-017**: A visible countdown MUST run while a game is in play, starting from the current
  level's time allowance.
- **FR-018**: When a word is accepted, the countdown MUST reset to the full allowance of the level
  the player is on after scoring.
- **FR-019**: When the countdown reaches zero the game MUST end immediately. Input MUST be disabled,
  and a submission not made while time remained MUST NOT count.
- **FR-020**: Players MUST be able to pause and resume. While paused the countdown MUST stop and
  tile letters MUST be hidden. The game MUST pause automatically when it is no longer visible.
- **FR-021**: The countdown MUST show a warning state during the final 10 seconds that is
  perceivable without relying on colour.

**Levels**

- **FR-022**: A game MUST start at level 1. A level is cleared when the player's total score reaches
  that level's target, and the player then moves to the next level. One word MAY clear more than
  one level.
- **FR-023**: The time allowance per word MUST be 60 seconds at level 1 and reduce by 5 seconds each
  level, down to a minimum of 15 seconds from level 10 onward.
- **FR-024**: Level targets, as total score, MUST be 30, 70, 120 and 180 for levels 1 to 4, and
  increase by 75 for each level after that.
- **FR-025**: Replacement letters MUST become harder with level: the high-value consonants J, K, Q,
  V, W, X and Z MUST be more likely to appear at higher levels than at level 1. FR-003 and FR-004
  MUST still hold.
- **FR-026**: The game MUST always show the current level, total score and progress toward the next
  target, and MUST announce each level-up.
- **FR-027**: Levels MUST have no upper limit.

**Game over and records**

- **FR-028**: At game over the game MUST show final score, level reached, number of words played and
  the highest-scoring word, and MUST offer to start a new game.
- **FR-029**: The game MUST store the player's best score and highest level on the device, show them
  when available, and indicate when a game sets a new best. If storage is unavailable the game
  MUST still be fully playable.

**Delivery**

- **FR-030**: The game MUST be installable to a home screen or app launcher on mobile and desktop
  and MUST launch from there in its own full-screen window with its own name and icon.
- **FR-031**: After one successful load, the game MUST be fully playable with no network connection.
- **FR-032**: The game MUST be usable on screens from 320 px wide in portrait up to desktop sizes,
  with touch targets of at least 44 by 44 px and no horizontal scrolling.
- **FR-033**: The game MUST be operable entirely by keyboard, expose labels and live announcements
  (word result, score, level-up, time warning, game over) to assistive technology, meet WCAG 2.1 AA
  contrast, and reduce animation when the user's device requests reduced motion.
- **FR-034**: The game MUST NOT require an account and MUST NOT send gameplay or personal data off
  the device.

**Information pages**

- **FR-035**: The game MUST provide an About page explaining that the Latin word *nōmen* means
  both "name" and "noun", with a longer account of the word's history, its relatives in English,
  the game's spelling of the name, and what the game is.
- **FR-036**: The game MUST provide a Rules page covering the board, building a word, what counts
  as a noun, scoring with the value of every letter, the clock, levels with their time allowances
  and score targets, keyboard controls and the personal best. Every figure on it MUST match the
  rules the game enforces.
- **FR-037**: Play, Rules and About MUST be reachable from every screen through persistent
  navigation that marks the current one, and each page MUST offer a way back to the game. Both
  pages MUST work offline and be addressable directly.
- **FR-038**: Opening a page during a game MUST pause the game, and the game MUST continue only
  when the player chooses to resume.

### Key Entities

- **Tile**: one position on the board holding a letter and its point value; may be selected into
  the current word.
- **Board**: the 12 tiles currently on offer, subject to the vowel and solvability guarantees.
- **Selection (current word)**: the ordered tiles the player has picked, 0 to 8 long.
- **Noun list**: the set of words the game accepts.
- **Level**: a number with a time allowance, a score target and a letter-difficulty setting.
- **Game**: one play session with its state (ready, playing, paused, over), board, selection,
  score, level, remaining time and history of accepted words.
- **Personal best**: the best score and highest level reached on this device.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time player completes their first valid word within 60 seconds of opening the
  game, without reading instructions, in at least 90% of usability trials.
- **SC-002**: Across 100,000 automatically generated boards and refills spanning levels 1 to 20,
  100% have 5 or 6 vowels and at least 2 formable nouns.
- **SC-003**: Feedback on a submitted word (accepted or rejected) and the refilled board appear
  within 100 ms on a mid-range phone.
- **SC-004**: The displayed countdown is accurate to within 250 ms over a 60 second period, and
  game over occurs within 250 ms of the true expiry.
- **SC-005**: After one online visit, the game starts and plays a complete game in airplane mode on
  100% of attempts on supported devices.
- **SC-006**: The game is interactive within 3 seconds on a mid-range phone on a 4G connection for a
  first visit, and within 1 second on repeat visits.
- **SC-007**: The game passes the browser's installability criteria and scores at least 90 for
  accessibility in an automated audit.
- **SC-008**: A complete game can be played using only a keyboard, and separately using only touch.
- **SC-009**: Automated unit tests cover at least 80% of lines, branches, functions and statements,
  and the build fails below that level.
- **SC-010**: In playtests, median first-session length is at least 3 minutes and median level
  reached is between 3 and 6, indicating the difficulty curve is neither trivial nor punishing.
- **SC-011**: Both information pages open in under 1 second from any screen, online or offline, and
  have no accessibility violations in an automated WCAG 2.1 AA check.

## Assumptions

- **Single player, single device**: no multiplayer, accounts, leaderboards or cloud sync. The
  personal best is per device and per browser.
- **Language**: English only; interface text in English.
- **Noun source**: the noun list is derived from an openly licensed English lexical database
  (WordNet). Words are accepted if that source lists them as nouns, which includes some uncommon
  words and excludes regular plurals that the source does not list separately (for example "CATS").
  This trade-off is recorded as an open tuning item in `research.md`.
- **Vowels**: A, E, I, O, U. Y counts as a consonant for the vowel range. The 50% maximum was
  added on 2026-10-11 after play showed that a minimum alone let boards fill with vowels.
- **"At least 2 words"** means 2 different nouns; two anagrams of each other count as 2.
- **Timeout**: a single expiry ends the game. There are no lives.
- **Invalid words**: carry no penalty other than the time spent.
- **Level numbers** (allowances, targets, letter difficulty) are starting values to be tuned after
  playtesting; they are held as data so tuning does not alter the rules.
- **Game in progress** is not saved across reloads; only the personal best persists.
- **Visual design**: the interface uses the Bootstrap framework with the Bootswatch "Lumen" theme
  (requested 2026-10-11). Lumen is a light theme, so the game has a single light appearance and
  does not follow the device's dark-mode setting.
- **No sound** in this version; feedback is visual and via assistive-technology announcements.
- **Supported platforms**: current versions of Chrome, Edge, Safari and Firefox on Android, iOS and
  desktop. Installation uses each platform's standard add-to-home-screen flow.
- **Engineering constraints** given with the request (React, progressive web application, SOLID,
  DRY, 80% unit test coverage) are recorded in the project constitution and the implementation
  plan rather than here, since this document describes behaviour only.
- **Native app-store packaging** is out of scope.
