import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { lintSubject, subjectNames, subjectPath, subjectInner, colorizeSubject } from '../src/subjects.js';
import { loadTokens, placeholders } from '../src/tokens.js';
import { subjectMaxRadius, SAFE_RADIUS } from '../formats/icon.js';

const tokens = loadTokens();
const ph = placeholders(tokens);
const svg = (body, viewBox = '0 0 160 160') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`;
const lint = (s) => lintSubject(s, ph);

test('i soggetti del repo passano il lint e stanno nel cerchio sicuro', () => {
  const names = subjectNames();
  assert.ok(names.length >= 6);
  for (const n of names) {
    assert.deepEqual(lint(fs.readFileSync(subjectPath(n), 'utf8')), [], n);
    assert.ok(subjectMaxRadius(n, tokens) <= SAFE_RADIUS, n);
  }
});

test('segnaposto validi (anche maiuscoli e corti) passano', () => {
  assert.deepEqual(lint(svg('<rect width="1" height="1" fill="#FF00FF" stroke="#000"/><path d="M0 0h1" stroke="#800080" fill="none"/><circle r="1" fill="#fff"/>')), []);
});

test('colore non segnaposto fallisce', () => {
  assert.ok(lint(svg('<rect width="10" height="10" fill="#00b8db"/>')).some((e) => e.includes('non è un segnaposto')));
  assert.ok(lint(svg('<rect width="10" height="10" stroke="red"/>')).some((e) => e.includes('non è un segnaposto')));
  assert.ok(lint(svg('<rect width="10" height="10" fill="currentColor"/>')).some((e) => e.includes('currentColor')));
});

test('style e class non ammessi (i colori vanno negli attributi)', () => {
  assert.ok(lint(svg('<rect width="10" height="10" style="fill:#ff00ff"/>')).some((e) => e.includes('style')));
});

test('immagine raster fallisce', () => {
  assert.ok(lint(svg('<image href="data:image/png;base64,AAAA" width="10" height="10"/>')).some((e) => e.includes('<image>')));
});

test('testo, script e riferimenti esterni falliscono', () => {
  const errors = lint(svg('<text>ciao</text><script>alert(1)</script><path d="M0 0" fill="url(https://x.y/a.svg#b)"/>'));
  assert.ok(errors.some((e) => e.includes('<text>')));
  assert.ok(errors.some((e) => e.includes('<script>')));
  assert.ok(errors.some((e) => e.includes('esterno')));
});

test('viewBox diverso da 0 0 160 160 fallisce', () => {
  assert.ok(lint(svg('', '0 0 48 48')).some((e) => e.includes('viewBox')));
  assert.ok(lint(svg('', '0 0 160 120')).some((e) => e.includes('viewBox')));
});

test('file troppo grande fallisce', () => {
  assert.ok(lint(svg(`<path d="${'M0 0h1'.repeat(6000)}" fill="#ff00ff"/>`)).some((e) => e.includes('KB')));
});

test('colorize sostituisce i segnaposto e rinomina gli id', () => {
  const pal = { accent: '#111111', 'accent-dark': '#222222', highlight: '#333333', bg: '#444444' };
  const out = colorizeSubject(subjectInner(svg('<clipPath id="c0"><rect/></clipPath><g clip-path="url(#c0)"><rect fill="#FF00FF" stroke="#000"/></g><path fill="#800080"/><path fill="#ffffff"/>')), ph, pal, 's-x');
  assert.match(out, /fill="#111111" stroke="#444444"/);
  assert.match(out, /fill="#222222"/);
  assert.match(out, /fill="#333333"/);
  assert.match(out, /id="s-x-c0"/);
  assert.match(out, /url\(#s-x-c0\)/);
});
