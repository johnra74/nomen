import type { ReactNode } from 'react';
import { BOARD_SIZE, MIN_FORMABLE_WORDS } from '../../domain/constants';
import { Page } from './Page';

/** A Latin word or phrase, marked up so screen readers pronounce it as Latin. */
const La = ({ children }: { readonly children: ReactNode }) => <i lang="la">{children}</i>;

export function AboutPage() {
  return (
    <Page
      title="About nōmən"
      links={[
        { to: 'game', label: 'Play the game', primary: true },
        { to: 'rules', label: 'Read the rules' },
      ]}
    >
      <p className="lead">
        <La>Nōmen</La> is the Latin word for “name”. It is also the Latin word for “noun”. This game
        is named after a word that means both, because finding nouns is all you do here.
      </p>

      <h3>A noun is a name</h3>
      <p>
        To the Romans there was no difference between the two ideas. When Roman grammarians set out
        to describe their own language, they borrowed the framework the Greeks had already built,
        and translated the Greek term <i lang="grc-Latn">ónoma</i>, “name”, as <La>nōmen</La>. The{' '}
        <La>nōmen</La> was the part of speech that names things: a person, a place, an animal, an
        object, an idea. <em>Dog</em> is the name of a kind of animal. <em>River</em> is the name of
        a kind of place. <em>Hope</em> is the name of a feeling. Every word you will ever spell on
        the board is, at bottom, a name for something.
      </p>
      <p>
        English still carries the same word. Latin <La>nōmen</La> became <i lang="fro">nom</i> in
        Old French, crossed the Channel with the Normans as <i lang="xno">noun</i>, and has been the
        English grammar term ever since. So when you play a noun, you are playing a <La>nōmen</La>{' '}
        in the most literal sense.
      </p>

      <h3>An old and very large family</h3>
      <p>
        <La>Nōmen</La> and the English word <em>name</em> are cousins. Both descend from the same
        ancient root, shared across the Indo-European languages, which is why the Greek{' '}
        <i lang="grc-Latn">ónoma</i> and the Sanskrit <i lang="sa-Latn">nāman</i> sound so alike.
        People have been asking each other’s names with recognisably the same sound for thousands of
        years.
      </p>
      <p>
        Latin then handed English a second helping. The stem of <La>nōmen</La> is <La>nōmin-</La>{' '}
        (its plural is <La>nōmina</La>), and it turns up wherever naming is going on. To{' '}
        <em>nominate</em> is to name someone for a role. <em>Nominal</em> means in name only. A{' '}
        <em>nomenclature</em> is a system of names. A <em>denomination</em> is a named value or
        group. A <em>misnomer</em> is a wrong name, <em>ignominy</em> is the loss of a good name,
        and <em>renown</em> is a name that is known everywhere.
      </p>

      <h3>Three names for every Roman</h3>
      <p>
        The word had a specific job in daily Roman life too. A Roman citizen of standing typically
        carried three names, the <La>tria nōmina</La>. The <La>praenomen</La> was the personal name,
        used by family and friends. The <La>cognomen</La> marked a branch of a family, and often
        began as a nickname. Between them sat the <La>nomen</La> proper: the name of the{' '}
        <La>gens</La>, the clan a person was born into. In Gaius Julius Caesar, Gaius is the{' '}
        <La>praenomen</La>, Julius is the <La>nomen</La> and Caesar is the <La>cognomen</La>. The{' '}
        <La>nomen</La> was the part that told the world who your people were.
      </p>

      <h3>The name is a sign</h3>
      <p>
        The Romans also suspected that names had power. Their proverb <La>nomen est omen</La>, “the
        name is a sign”, grew out of a pun in a comedy by the playwright Plautus, and it captures an
        old hunch that what a thing is called says something about what it is. Anyone who has stared
        at a rack of tiles and suddenly seen a word leap out of them knows a little of that feeling.
      </p>

      <h3>Why it is spelled that way</h3>
      <p>
        In Latin dictionaries the word is written <La>nōmen</La>. The line over the <em>o</em> is a
        macron, and it marks a long vowel: “NOH-men”, not “NOM-en”. The title of this game takes one
        small liberty and swaps the <em>e</em> for <em>ə</em>. That symbol is a schwa, the phonetic
        sign for the short, relaxed vowel most English speakers use in the second syllable when they
        say the word aloud: “NOH-mən”.
      </p>
      <p>
        So the title is half dictionary entry and half pronunciation guide. It is not how a Roman
        would have written it, but both marks sit on vowels, which seemed fitting for a game that
        counts its vowels so carefully.
      </p>

      <h3>The game</h3>
      <p>
        nōmən turns all of this into a race. You are shown {BOARD_SIZE} letter tiles and a clock.
        Somewhere in those letters there are always at least {MIN_FORMABLE_WORDS} nouns, and your
        job is to name one before time runs out. Each letter is worth its Scrabble value, each noun
        you find resets the clock, and each level gives you less time and harder letters.
      </p>
      <p className="mb-0">
        The nouns come from WordNet, a dictionary of English built at Princeton University. It is
        bundled into the game, so your words can be checked without a connection. There are no
        accounts and nothing to sign up for, and nothing you do leaves your device. Add the game to
        your home screen and it works on a plane, in a tunnel, or anywhere else you have a minute
        and a few letters to spare.
      </p>
    </Page>
  );
}
