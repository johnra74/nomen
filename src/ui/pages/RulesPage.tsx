import {
  BOARD_SIZE,
  HARD_LETTERS,
  LETTERS,
  LETTER_VALUES,
  MAX_VOWELS,
  MAX_WORD_LENGTH,
  MIN_FORMABLE_WORDS,
  MIN_VOWELS,
  MIN_WORD_LENGTH,
  VOWELS,
  WARNING_SECONDS,
} from '../../domain/constants';
import { levelConfig } from '../../domain/levels';
import { plural } from '../messages';
import { Page } from './Page';

/** How many levels the table spells out; the pattern simply continues after that. */
const LEVELS_SHOWN = 10;

const listOf = (items: readonly string[]): string =>
  `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

// Every number on this page comes from the rules the game actually runs on.
const lettersByValue = [...new Set(Object.values(LETTER_VALUES))]
  .sort((a, b) => a - b)
  .map((value) => ({
    value,
    letters: LETTERS.filter((letter) => LETTER_VALUES[letter] === value),
  }));
const levels = Array.from({ length: LEVELS_SHOWN }, (_, index) => levelConfig(index + 1));
const fastest = levels[levels.length - 1]!;
const targetStep = levelConfig(LEVELS_SHOWN + 1).targetScore - fastest.targetScore;

export function RulesPage() {
  return (
    <Page title="Game play rules" links={[{ to: 'game', label: 'Play the game', primary: true }]}>
      <p className="lead">
        Spell an English noun from the tiles before the clock runs out. Then do it again, faster.
      </p>

      <h3>The board</h3>
      <ul>
        <li>
          The board always shows {BOARD_SIZE} letter tiles. The same letter can appear more than
          once.
        </li>
        <li>
          {MIN_VOWELS} or {MAX_VOWELS} of them are vowels ({listOf(VOWELS)}). Y counts as a
          consonant.
        </li>
        <li>
          There are always at least {MIN_FORMABLE_WORDS} nouns you could spell, so the board is
          never a dead end.
        </li>
      </ul>

      <h3>Building a word</h3>
      <ul>
        <li>
          Your word must be {MIN_WORD_LENGTH} to {MAX_WORD_LENGTH} letters long and use only letters
          on the board.
        </li>
        <li>
          Each tile can be used only once per word. To spell a word with a double letter you need
          two tiles showing that letter.
        </li>
        <li>Tap tiles in order, or type on a keyboard. Press Submit when the word is ready.</li>
        <li>
          Delete removes the last letter, Clear removes them all, and Shuffle rearranges the tiles
          without changing them. None of these costs anything.
        </li>
      </ul>

      <h3>What counts as a noun</h3>
      <ul>
        <li>
          Single English words that a dictionary lists as a noun. A word that is also a verb or
          adjective, such as RUN, still counts.
        </li>
        <li>Proper nouns, abbreviations and hyphenated words do not count.</li>
        <li>
          Most regular plurals do not count either: play CAT, not CATS. The word list holds the base
          form of each noun.
        </li>
        <li>A wrong guess is simply rejected. You lose no points, only the time you spent.</li>
      </ul>

      <h3>Scoring</h3>
      <p>
        Each tile shows its value, the same as in Scrabble. A word scores the sum of its tiles, so
        CAT is worth 3 + 1 + 1 = 5.
      </p>
      <table className="table table-sm" aria-label="Letter values">
        <thead>
          <tr>
            <th scope="col">Points</th>
            <th scope="col">Letters</th>
          </tr>
        </thead>
        <tbody>
          {lettersByValue.map(({ value, letters }) => (
            <tr key={value}>
              <th scope="row">{value}</th>
              <td>
                {letters.map((letter) => (
                  <span key={letter} className="letter">
                    {letter}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        After a valid word, the tiles you used are replaced with new letters. The rest stay put.
      </p>

      <h3>The clock</h3>
      <ul>
        <li>You have a fixed time to find each word. A valid noun resets the clock to full.</li>
        <li>
          In the last {WARNING_SECONDS} seconds the clock turns red, striped and says “Hurry”.
        </li>
        <li>When the clock reaches zero the game is over. There are no extra lives.</li>
        <li>
          Pause stops the clock and hides the tiles. The game also pauses by itself if you switch
          away from it or open another page.
        </li>
      </ul>

      <h3>Levels</h3>
      <p>
        You move up a level each time your total score reaches the target. Each level gives you less
        time per word, and deals the high-value letters {listOf(HARD_LETTERS)} more often.
      </p>
      <table className="table table-sm" aria-label="Levels">
        <thead>
          <tr>
            <th scope="col">Level</th>
            <th scope="col">Time per word</th>
            <th scope="col">Score to clear it</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((config) => (
            <tr key={config.level}>
              <th scope="row">{config.level}</th>
              <td>{config.allowanceMs / 1000} s</td>
              <td>{config.targetScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        There is no last level. Beyond level {LEVELS_SHOWN} the time stays at{' '}
        {plural(fastest.allowanceMs / 1000, 'second')} and each target is {targetStep} points higher
        than the one before.
      </p>

      <h3>Keyboard</h3>
      <ul>
        <li>Letter keys pick a matching tile.</li>
        <li>Backspace removes the last letter and Escape clears the word.</li>
        <li>Enter submits and Space shuffles.</li>
      </ul>

      <h3>Your best</h3>
      <p className="mb-0">
        When a game ends you see your score, the level you reached and your best word. Your highest
        score is kept on this device and shown the next time you play.
      </p>
    </Page>
  );
}
