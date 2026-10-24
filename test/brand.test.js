import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTokens, loadTokenTree, describeTokens, resolveTokens } from '../src/tokens.js';
import { oklchToHex, parseOklch } from '../src/color.js';
import { loadBrand, SCOPES } from '../src/brand.js';
import { tokensCss } from '../src/tokens-css.js';
import { FAMILIES, VARIANTS } from '../src/logo.js';

const tokens = loadTokens();
const described = describeTokens(loadTokenTree());

// Valori di DESIGN.md del sito (salento-dev/website @ fb3aab5): il test fissa l'import.
const DESIGN_MD = {
  'signal-cyan': 'oklch(71.5% 0.143 215.221)',
  'signal-cyan-deep': 'oklch(52% 0.105 223.128)',
  'signal-cyan-pale': 'oklch(86.5% 0.127 207.078)',
  'signal-cyan-wash': 'oklch(98.4% 0.019 200.873)',
  'reserve-violet': 'oklch(60.6% 0.25 292.717)',
  'reserve-fuchsia': 'oklch(66.7% 0.295 322.15)',
  'void-black': '#000000',
  'console-black': 'oklch(14.8% 0.004 228.8)',
  'panel-graphite': 'oklch(21.8% 0.008 223.9)',
  'control-graphite': 'oklch(27.5% 0.011 216.9)',
  'raised-graphite': 'oklch(37.8% 0.015 216)',
  'bracket-grey': 'oklch(45% 0.017 213.2)',
  'muted-mist': 'oklch(72.3% 0.014 214.4)',
  'body-mist': 'oklch(87.2% 0.007 219.6)',
  'soft-mist': 'oklch(92.5% 0.005 214.3)',
  'bright-mist': 'oklch(98.7% 0.002 197.1)',
  'whatsapp-green': 'oklch(79.2% 0.209 151.711)',
  'wip-amber': 'oklch(76.9% 0.188 70.08)',
};

test('i colori con nome di DESIGN.md risolvono e corrispondono all\'OKLCH del sito', () => {
  for (const [name, value] of Object.entries(DESIGN_MD)) {
    const t = described[`brand.color.${name}`];
    assert.ok(t, `manca brand.color.${name}`);
    assert.equal(t.ext.designMd, value, `${name}: designMd`);
    assert.ok(t.ext.name && t.description, `${name}: nome e ruolo`);
    const expected = value.startsWith('#') ? value : oklchToHex(parseOklch(value));
    assert.equal(tokens[`brand.color.${name}`], expected, name);
  }
});

test('ogni colore con nome ha una categoria nota e un hex', () => {
  const cats = new Set(['marchio', 'neutri', 'primario', 'riserva', 'funzionali', 'community']);
  for (const [name, t] of Object.entries(described).filter(([n]) => n.startsWith('brand.color.'))) {
    assert.ok(cats.has(t.ext.category), `${name}: categoria ${t.ext.category}`);
    assert.match(t.value, /^#[0-9a-f]{6}$/, name);
  }
});

test('typography: alias risolti dentro i valori composti', () => {
  assert.deepEqual(tokens['typography.display'].fontFamily, tokens['font.outfit']);
  assert.deepEqual(tokens['typography.telemetry'].fontFamily, ['Roboto Mono', 'ui-monospace', 'monospace']);
  assert.deepEqual(tokens['typography.display'].fontSize, { value: 4.5, unit: 'rem' });
  assert.equal(tokens['radius.xs'].value, 2);
  // le dimensioni {value, unit} non sono trattate come composti
  assert.deepEqual(resolveTokens({ a: { $value: { value: 1, unit: 'px' } }, b: { $value: '{a}' } }).b, { value: 1, unit: 'px' });
});

test('tokens.css: custom properties senza segnaposto', () => {
  const css = tokensCss(described);
  assert.match(css, /--brand-color-signal-cyan: #00b8db;/);
  assert.match(css, /--typography-telemetry-text-transform: uppercase;/);
  assert.match(css, /--radius-xs: 2px;/);
  assert.doesNotMatch(css, /--placeholder-/);
});

test('brand.yaml valido, regole con ambito e niente link di invito', () => {
  const brand = loadBrand();
  assert.equal(brand.identity.name, 'Salento.dev');
  for (const r of brand.rules) assert.ok(SCOPES.includes(r.scope));
  assert.ok(brand.rules.some((r) => r.id === 'one-signal' && r.scope === 'interfaccia'));
  assert.ok(brand.rules.some((r) => r.scope === 'community'));
  assert.doesNotMatch(JSON.stringify(brand), /chat\.whatsapp\.com/);
  for (const v of brand.logo.variants) for (const t of [v.ink, v.background]) assert.ok(tokens[t], t);
});

test('brand.yaml: logo con le 4 famiglie e le 3 varianti del media kit, provenienza e diritti', () => {
  const { logo } = loadBrand();
  assert.deepEqual(logo.families.map((f) => f.id), FAMILIES);
  assert.deepEqual(logo.variants.map((v) => v.id), VARIANTS);
  assert.equal(logo.provenance.url, 'https://salento.dev/sd-media-kit-2026/');
  assert.match(logo.rights.join(' '), /Tutti i diritti riservati/);
  assert.match(logo.rights.join(' '), /preventiva\s+autorizzazione/);
});

test('descrizioni ufficiali: tre testi, il nome si scrive Salento.dev', () => {
  const { descriptions, identity } = loadBrand();
  assert.deepEqual(descriptions.items.map((d) => d.id), ['breve', 'media', 'lunga']);
  for (const d of descriptions.items) {
    assert.match(d.text, /^Salento\.dev /);
    assert.doesNotMatch(d.text, /Salento\.Dev|Salento Dev/);
  }
  assert.ok(identity.naming.dont[0].includes('Salento.Dev'));
});

test('colori del marchio: Salento Cyan è il primario, Signal Cyan resta come colore attuale del sito', () => {
  assert.equal(tokens['brand.color.salento-cyan'], '#20d0ed');
  assert.equal(tokens['brand.color.salento-dark'], '#1d1e1c');
  assert.equal(tokens['brand.color.white'], '#ffffff');
  assert.equal(tokens['brand.color.black'], '#000000');
  assert.equal(tokens['semantic.primary'], '#20d0ed');
  assert.equal(tokens['semantic.accent'], '#20d0ed');
  assert.equal(tokens['brand.color.signal-cyan'], tokens['color.cyan.500']);
  assert.match(described['brand.color.signal-cyan'].description, /da migrare a Salento Cyan/);
  for (const n of ['salento-cyan', 'salento-dark', 'white', 'black']) assert.equal(described[`brand.color.${n}`].ext.category, 'marchio');
  // le superfici del sito non cambiano
  assert.equal(tokens['semantic.bg'], tokens['color.mist.950']);
  assert.equal(tokens['semantic.surface'], tokens['color.mist.900']);
  assert.equal(tokens['group.accents.cyan.accent'], tokens['color.cyan.400']);
});
