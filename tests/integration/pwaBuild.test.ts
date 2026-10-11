// @vitest-environment node
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { manifest, precacheGlobs } from '../../pwa.config';

describe('PWA configuration', () => {
  it('describes an installable standalone app named nōmən', () => {
    expect(manifest.name).toBe('nōmən');
    expect(manifest.short_name).toBe('nōmən');
    expect(manifest.display).toBe('standalone');
    expect(manifest.orientation).toBe('portrait');
  });

  it('provides 192 and 512 px icons and a maskable icon that exist on disk', () => {
    const icons = manifest.icons ?? [];
    expect(icons.some((icon) => icon.sizes === '192x192')).toBe(true);
    expect(icons.some((icon) => icon.sizes === '512x512' && !icon.purpose)).toBe(true);
    expect(icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
    for (const icon of icons) expect(existsSync(`public/${icon.src}`), icon.src).toBe(true);
  });

  it('precaches the bundled font so the theme renders offline', () => {
    expect(precacheGlobs.join(',')).toMatch(/\bwoff2\b/);
  });

  it('uses the Lumen primary colour for the browser chrome', () => {
    expect(manifest.theme_color).toBe('#158cba');
  });

  it('precaches the noun list so word validation works offline', () => {
    expect(precacheGlobs.join(',')).toMatch(/\btxt\b/);
    expect(existsSync('src/assets/nouns.txt')).toBe(true);
  });
});
