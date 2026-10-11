// Generates src/assets/nouns.txt from WordNet. Run with `npm run build:words`.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { filterNouns, lemmasOfDataLine } from './wordFilter';

const require = createRequire(import.meta.url);
const wordnet = require('wordnet-db') as { path: string; version: string };
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'src/assets/nouns.txt');
const licenceDir = join(root, 'public/licenses');

const lines = readFileSync(join(wordnet.path, 'data.noun'), 'utf8').split('\n');
const nouns = filterNouns(lines.flatMap(lemmasOfDataLine));
const text = nouns.join('\n') + '\n';

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, text);
mkdirSync(licenceDir, { recursive: true });
copyFileSync(join(wordnet.path, '..', 'LICENSE'), join(licenceDir, 'WORDNET-LICENSE.txt'));

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;
console.log(`WordNet ${wordnet.version}: wrote ${nouns.length} nouns to src/assets/nouns.txt`);
console.log(`Size: ${kb(text.length)} raw, ${kb(gzipSync(text).length)} gzipped`);
