import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadTokens } from '../src/tokens.js';
import {
  expectedFiles, checkOfficialPack, lintOfficialSvg, readManifest, readOfficialSvg, barBoxes, moduleRatio, avatarSvg,
  sha256, FAMILIES, VARIANTS, MANIFEST, UPSTREAM_MANIFEST,
} from '../src/logo.js';
import { normalizeSvgNamespace } from '../scripts/import-logo-pack.js';
import { OFFICIAL_LOGO_DIR, LOGO_FILE } from '../src/paths.js';

const tokens = loadTokens();

test('logo pack: 72 file attesi (4 famiglie × 3 varianti × 2 padding × 3 formati)', () => {
  const files = expectedFiles();
  assert.equal(files.length, 72);
  assert.equal(new Set(files).size, 72);
  assert.ok(files.includes('logos/svg/padded/salentodev-horizontal-cyan-on-dark-padded.svg'));
  assert.ok(files.includes('logos/webp/no-padding/salentodev-pictogram-dark-on-light-no-padding.webp'));
});

test('logo pack vendorizzato: presente, checksum come in SHA256SUMS, SVG sicuri e nei colori della variante', () => {
  assert.deepEqual(checkOfficialPack(tokens), []);
});

test('PNG e WEBP identici agli originali del media kit (SHA256SUMS = SHA256SUMS.upstream)', () => {
  const ours = readManifest(fs.readFileSync(path.join(OFFICIAL_LOGO_DIR, MANIFEST), 'utf8'));
  const upstream = readManifest(fs.readFileSync(path.join(OFFICIAL_LOGO_DIR, UPSTREAM_MANIFEST), 'utf8'));
  assert.equal(upstream.size, 72);
  for (const [file, hash] of ours) {
    if (file.endsWith('.svg')) assert.notEqual(hash, upstream.get(file), `${file}: namespace normalizzato`);
    else assert.equal(hash, upstream.get(file), file);
  }
});

test('normalizzazione del namespace: cambia solo il prefisso ns0', () => {
  const original = '<ns0:svg xmlns:ns0="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><ns0:title>t</ns0:title><ns0:g><ns0:path fill="#FFFFFF" d="M 0 0 L 1 1 Z " /></ns0:g></ns0:svg>';
  assert.equal(normalizeSvgNamespace(original), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><title>t</title><g><path fill="#FFFFFF" d="M 0 0 L 1 1 Z " /></g></svg>');
});

test('lint SVG: rifiuta script, riferimenti esterni, elementi e colori non previsti', () => {
  const ok = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><g><path fill="#20D0ED" d="M 0 0 L 1 1 Z" /></g></svg>';
  assert.deepEqual(lintOfficialSvg(ok, '#20d0ed'), []);
  const bad = [
    ok.replace('<g>', '<g><script>alert(1)</script>'),
    ok.replace('<g>', '<g><image href="https://example.com/x.png"/>'),
    ok.replace('<g>', '<g><foreignObject></foreignObject>'),
    ok.replace('<g>', '<g onload="x()">'),
    ok.replace('fill="#20D0ED"', 'fill="url(#a)"'),
    ok.replace('#20D0ED', '#FF0000'),
    `<?xml version="1.0"?><!DOCTYPE svg [<!ENTITY x "y">]>${ok}`,
  ];
  for (const svg of bad) assert.notDeepEqual(lintOfficialSvg(svg, '#20d0ed'), [], svg);
});

test('assets/logo.svg (icone dei gruppi) ha la stessa geometria del pittogramma ufficiale', () => {
  const official = barBoxes(readOfficialSvg('pictogram', 'white-on-dark', 'no-padding'));
  const ours = barBoxes(fs.readFileSync(LOGO_FILE, 'utf8'));
  assert.equal(ours.length, official.length);
  ours.forEach((b, i) => b.forEach((v, j) => assert.ok(Math.abs(v - official[i][j]) < 0.2, `barra ${i}: ${v} vs ${official[i][j]}`)));
});

test('modulo del pittogramma ≈ 7.8% dell\'altezza', () => {
  const m = moduleRatio();
  assert.ok(m > 0.075 && m < 0.081, String(m));
});

test('avatar: pittogramma ufficiale incorporato senza modifiche, su Black', () => {
  const svg = avatarSvg(tokens);
  assert.match(svg, /<rect width="1024" height="1024" fill="#000000"\/>/);
  const official = readOfficialSvg('pictogram', 'white-on-dark', 'no-padding');
  for (const [, d] of official.matchAll(/ d="([^"]+)"/g)) assert.ok(svg.includes(d));
  assert.ok(svg.includes(official.match(/viewBox="([^"]+)"/)[1]));
});

test('ogni famiglia e variante ha il file SVG con padding (usato dalla pagina)', () => {
  for (const f of FAMILIES) for (const v of VARIANTS) assert.ok(readOfficialSvg(f, v, 'padded').length > 100);
  assert.equal(sha256(Buffer.from('')).length, 64);
});
