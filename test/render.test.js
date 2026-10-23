import { test } from 'node:test';
import assert from 'node:assert/strict';
import icon from '../formats/icon.js';
import { renderPng } from '../src/render.js';
import { loadTokens } from '../src/tokens.js';
import { loadDoodleSets } from '../src/doodles.js';

const ctx = { tokens: loadTokens(), sets: loadDoodleSets() };
const pngWidth = (buf) => buf.readUInt32BE(16); // IHDR
const perm = { slug: 'a', name: 'A', shortName: 'A', kind: 'permanent', subject: 'robot', accent: 'cyan', doodles: ['chip', 'brain'], status: 'active' };
const temp = { slug: 'b', name: 'B', shortName: 'B', kind: 'temporary', subject: 'train', starts: '2026-11-18', ends: '2026-11-19', status: 'active' };

test('il formato icon produce PNG 640 + anteprima 96 (permanente e temporaneo)', () => {
  for (const g of [perm, temp]) {
    const { png, previews } = renderPng(icon.render(g, ctx), icon);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(pngWidth(png), 640);
    assert.equal(pngWidth(previews[96]), 96);
  }
});

test('nessun testo nell\'icona', () => {
  assert.doesNotMatch(icon.render(perm, ctx), /<text/);
});

test('rendering deterministico: stesso input, stessi byte', () => {
  const a = renderPng(icon.render(perm, ctx), icon).png;
  const b = renderPng(icon.render({ ...perm }, ctx), icon).png;
  assert.ok(a.equals(b));
  // lo slug è il seed: un altro slug dà un altro wallpaper
  const c = renderPng(icon.render({ ...perm, slug: 'altro' }, ctx), icon).png;
  assert.ok(!a.equals(c));
});

test('i temporanei sono sempre pietra', () => {
  assert.match(icon.render(temp, ctx), /#e2b45a/);
  assert.doesNotMatch(icon.render(temp, ctx), new RegExp(ctx.tokens['color.cyan.400']));
});
