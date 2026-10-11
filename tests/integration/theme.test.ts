// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { compile } from 'sass-embedded';

// Compiled once: this is the stylesheet the app ships.
const css = compile('src/ui/styles/app.scss', {
  loadPaths: ['node_modules'],
  quietDeps: true,
  silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
}).css;

describe('Bootstrap Lumen theme', () => {
  it('uses the Lumen palette and typeface', () => {
    expect(css).toMatch(/--bs-primary:\s*#158cba/i);
    expect(css).toContain('"Source Sans Pro"');
  });

  it('includes the Bootstrap components the game is built from', () => {
    for (const selector of [
      '.btn-primary',
      '.btn-dark',
      '.card-body',
      '.progress-bar',
      '.alert-success',
      '.navbar',
      '.visually-hidden',
    ]) {
      expect(css, selector).toContain(selector);
    }
  });

  it("gives buttons Lumen's raised, uppercase look", () => {
    expect(css).toMatch(/\.btn\s*\{[^}]*border-width:\s*0 1px 4px 1px/);
    expect(css).toMatch(/\.btn\s*\{[^}]*text-transform:\s*uppercase/);
  });

  it('makes no network request for fonts, so the game stays offline-capable', () => {
    expect(css).not.toMatch(/@import\s+url/);
    expect(css).not.toContain('googleapis');
    // The only URLs left are SVG namespace strings inside inline data: icons.
    expect(css).not.toMatch(/url\(["']?https?:/);
  });

  it('keeps every button at least 44px for touch', () => {
    expect(css).toMatch(/\.btn\s*\{[^}]*min-height:\s*44px/);
  });
});
