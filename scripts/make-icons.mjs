// Draws the app icons in the Lumen theme's colours, matching the game: a dark letter tile
// with a white "n̄" on Lumen blue. Writes them as PNGs.
// Run with `node scripts/make-icons.mjs`. Dependency-free: a tiny rasteriser plus zlib.
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BLUE = [0x15, 0x8c, 0xba]; // Lumen $primary, the app bar
const TILE = [0x55, 0x55, 0x55]; // Lumen $dark, the letter tiles
const EDGE = [0x4d, 0x4d, 0x4d]; // the tiles' raised bottom edge
const INK = [0xff, 0xff, 0xff];
const SAMPLES = 4; // supersampling per axis

const inRect = (x, y, [x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1;

function inRoundedRect(x, y, [x0, y0, x1, y1], radius) {
  if (!inRect(x, y, [x0, y0, x1, y1])) return false;
  const dx = Math.max(x0 + radius - x, 0, x - (x1 - radius));
  const dy = Math.max(y0 + radius - y, 0, y - (y1 - radius));
  return dx * dx + dy * dy <= radius * radius;
}

// The glyph, in unit coordinates. The tile sits inside the maskable safe zone.
function inGlyph(x, y) {
  const macron = inRect(x, y, [0.4, 0.315, 0.6, 0.365]);
  const leftStem = inRect(x, y, [0.37, 0.44, 0.44, 0.69]);
  const rightStem = inRect(x, y, [0.56, 0.57, 0.63, 0.69]);
  const distance = Math.hypot(x - 0.5, y - 0.57);
  const arch = y <= 0.57 && distance <= 0.13 && distance >= 0.06;
  return macron || leftStem || rightStem || arch;
}

function colourAt(x, y) {
  if (!inRoundedRect(x, y, [0.22, 0.22, 0.78, 0.78], 0.08)) return BLUE;
  if (y > 0.745) return EDGE;
  return inGlyph(x, y) ? INK : TILE;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff;
  for (const byte of body) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  const out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE((crc ^ 0xffffffff) >>> 0, body.length + 4);
  return out;
}

function png(size) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let py = 0; py < size; py++) {
    const row = py * (size * 3 + 1);
    for (let px = 0; px < size; px++) {
      const sum = [0, 0, 0];
      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const colour = colourAt(
            (px + (sx + 0.5) / SAMPLES) / size,
            (py + (sy + 0.5) / SAMPLES) / size,
          );
          for (let c = 0; c < 3; c++) sum[c] += colour[c];
        }
      }
      for (let c = 0; c < 3; c++) raw[row + 1 + px * 3 + c] = Math.round(sum[c] / SAMPLES ** 2);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 2, 0, 0, 0], 8); // 8-bit RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#158cba"/>
  <rect x="22" y="22" width="56" height="56" rx="8" fill="#4d4d4d"/>
  <rect x="22" y="22" width="56" height="52.5" rx="8" fill="#555"/>
  <g fill="#fff">
    <rect x="40" y="31.5" width="20" height="5"/>
    <rect x="37" y="44" width="7" height="25"/>
    <rect x="56" y="57" width="7" height="12"/>
    <path d="M37 57a13 13 0 0 1 26 0h-7a6 6 0 0 0-12 0z"/>
  </g>
</svg>
`;

mkdirSync('public/icons', { recursive: true });
for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['icon-maskable-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  writeFileSync(`public/icons/${name}`, png(size));
}
writeFileSync('public/icons/favicon.svg', svg);
console.log('Wrote icons to public/icons');
