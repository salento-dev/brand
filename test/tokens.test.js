import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolveTokens, loadTokens, themeFor, accentNames, iconPalette } from '../src/tokens.js';
import { contrastRatio, ICON_RULES } from '../src/contrast.js';
import { oklchToHex, parseOklch, darkShade } from '../src/color.js';
import { TOKENS_FILE } from '../src/paths.js';

const tokens = loadTokens();

test('risolve alias annidati ed eredita $type', () => {
  const t = resolveTokens({
    color: { $type: 'color', cyan: { 500: { $value: '#00b8db' } } },
    semantic: { accent: { $value: '{color.cyan.500}' }, link: { $value: '{semantic.accent}' } },
  });
  assert.equal(t['semantic.accent'], '#00b8db');
  assert.equal(t['semantic.link'], '#00b8db');
});

test('alias mancante o circolare lancia errore', () => {
  assert.throws(() => resolveTokens({ a: { $value: '{b}' } }), /sconosciuto/);
  assert.throws(() => resolveTokens({ a: { $value: '{b}' }, b: { $value: '{a}' } }), /circolare/);
});

test('accenti ammessi e palette per gruppo', () => {
  assert.deepEqual(accentNames(tokens), ['cyan', 'violet', 'fuchsia', 'emerald', 'lime']);
  const fuchsia = iconPalette(tokens, { kind: 'permanent', accent: 'fuchsia' });
  assert.equal(fuchsia.accent, tokens['color.fuchsia.400']);
  assert.equal(fuchsia['accent-dark'], tokens['color.fuchsia.700']);
  assert.equal(fuchsia.bg, tokens['color.mist.900']);
  assert.equal(fuchsia.highlight, tokens['color.mist.50']);
  assert.equal(iconPalette(tokens, { kind: 'permanent', accent: 'lime' }).accent, tokens['color.lime.500']);
  // i temporanei sono sempre pietra, qualunque cosa ci sia in accent
  const temp = iconPalette(tokens, { kind: 'temporary', accent: 'cyan' });
  assert.equal(temp.accent, '#e2b45a');
  assert.equal(temp['accent-dark'], tokens['color.pietra-dark']);
  assert.throws(() => iconPalette(tokens, { kind: 'permanent', accent: 'rosso' }));
  assert.equal(themeFor(tokens).bg, tokens['color.mist.950']);
});

test('ogni accento rispetta le regole di contrasto', () => {
  for (const group of [...accentNames(tokens).map((accent) => ({ kind: 'permanent', accent })), { kind: 'temporary' }]) {
    const pal = iconPalette(tokens, group);
    for (const { fg, bg, min } of ICON_RULES) assert.ok(contrastRatio(pal[fg], pal[bg]) >= min, `${group.accent ?? 'pietra'} ${fg}/${bg}`);
  }
});

test('gli hex delle primitive corrispondono all\'OKLCH di Tailwind', () => {
  const tree = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
  for (const [fam, scale] of Object.entries(tree.color)) {
    if (fam.startsWith('$') || !scale['500']) continue;
    for (const [step, t] of Object.entries(scale)) {
      assert.equal(oklchToHex(parseOklch(t.$extensions['dev.salento'].oklch)), t.$value, `${fam}-${step}`);
    }
  }
  assert.equal(tokens['color.pietra-dark'], darkShade(tokens['color.pietra']));
});

test('contrasto WCAG noto', () => {
  assert.equal(contrastRatio('#000000', '#ffffff').toFixed(0), '21');
});
