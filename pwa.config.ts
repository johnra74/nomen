import type { ManifestOptions } from 'vite-plugin-pwa';

export const manifest: Partial<ManifestOptions> = {
  name: 'nōmən',
  short_name: 'nōmən',
  description: 'Spell nouns from twelve letter tiles before the clock runs out.',
  lang: 'en',
  display: 'standalone',
  orientation: 'portrait',
  start_url: '.',
  scope: '.',
  theme_color: '#158cba',
  background_color: '#ffffff',
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    {
      src: 'icons/icon-maskable-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
};

/** Everything the game needs offline, including the noun list (.txt) and the font (.woff2). */
export const precacheGlobs = ['**/*.{js,css,html,png,svg,ico,txt,woff2,webmanifest}'];
