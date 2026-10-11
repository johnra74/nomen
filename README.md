# nōmən

A single-player word puzzle. Twelve letter tiles, a countdown, and one job: spell an English noun
before time runs out.

## Rules

- The board shows 12 tiles. Each has a letter and its Scrabble point value. Letters can repeat.
- Spell a noun of 3 to 8 letters by tapping tiles or typing. A tile can be used once per word.
- A valid noun scores the sum of its tiles, the used tiles are replaced, and the clock resets.
- An invalid word costs nothing but time.
- The board always has 5 or 6 vowels and at least 2 nouns you could spell.
- When the clock reaches zero the game is over.
- Reaching a level's score target moves you up: each level gives 5 seconds less per word (60 down
  to 15) and deals more J, K, Q, V, W, X and Z.

The app has two more pages, reachable from the bar at the top: **Rules**, the full rules with
letter values and the level table, and **About**, the story of the Latin word _nōmen_ ("name" and
"noun") behind the game's name.

Keyboard: letters pick tiles, Backspace removes the last one, Escape clears, Enter submits, Space
shuffles.

## Run it

Requires Node.js 22 or newer.

```bash
npm install
npm run dev        # development server
npm run dev:host   # same, reachable from other devices on your network
npm test           # unit and integration tests with the 80% coverage gate
npm run build      # type-check and production build
npm run preview    # serve the build, with the service worker, for install and offline checks
```

`npm run build:words` regenerates `src/assets/nouns.txt` from WordNet, and
`node scripts/make-icons.mjs` regenerates the app icons. Both outputs are checked in.

## How it is built

A React progressive web app with no backend, styled with [Bootstrap](https://getbootstrap.com/)
and the [Bootswatch Lumen](https://bootswatch.com/lumen/) theme. Lumen is compiled from source in
`src/ui/styles/app.scss` with its font bundled, so nothing is fetched from a CDN or Google Fonts
and the game still works offline. All game rules live in `src/domain` as pure
TypeScript; they reach time, randomness, the noun list and storage only through the small
interfaces in `src/ports`. Browser implementations are in `src/infrastructure`, React components
in `src/ui`, and `src/main.tsx` is the one place that wires them together.

The project follows [GitHub spec-kit](https://github.com/github/spec-kit):

- [Constitution](.specify/memory/constitution.md): SOLID, DRY, test-first, offline-first
- [Specification](specs/001-nomen-noun-puzzle/spec.md): what the game does
- [Plan](specs/001-nomen-noun-puzzle/plan.md) and [research](specs/001-nomen-noun-puzzle/research.md): how and why
- [Tasks](specs/001-nomen-noun-puzzle/tasks.md): build order and status
- [Quickstart](specs/001-nomen-noun-puzzle/quickstart.md): how to validate it

## Word list

Nouns come from [WordNet 3.1](https://wordnet.princeton.edu/) (Princeton University), whose
licence ships with the app in `public/licenses/WORDNET-LICENSE.txt`. WordNet lists base forms, so
most regular plurals ("cats") are not accepted.
