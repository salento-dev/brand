import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createZip, readZip, crc32 } from '../src/zip.js';
import { buildSite } from '../scripts/site.js';
import { KIT_ROOT, KIT_ZIP } from '../src/kit.js';

const hasUnzip = spawnSync('unzip', ['-v']).status === 0;
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'brand-'));

test('crc32 noto', () => {
  assert.equal(crc32(Buffer.from('123456789')), 0xcbf43926);
});

test('zip: andata e ritorno, store e deflate, byte stabili con data fissa', () => {
  const date = new Date('2026-10-24T10:00:00Z');
  const entries = [
    { name: 'a/testo.txt', data: 'ciao '.repeat(200) }, // comprimibile -> deflate
    { name: 'b/rumore.bin', data: Buffer.from(Array.from({ length: 64 }, (_, i) => (i * 97) % 256)) }, // store
    { name: 'è.txt', data: 'utf-8' },
  ];
  const zip = createZip(entries, { date });
  const files = readZip(zip);
  assert.deepEqual(files.map((f) => f.name), entries.map((e) => e.name));
  assert.equal(files[0].data.toString(), 'ciao '.repeat(200));
  assert.ok(createZip(entries, { date }).equals(zip));
  assert.throws(() => createZip([{ name: '../x', data: '' }]), /non valido/);
  assert.throws(() => createZip([{ name: 'x', data: '' }, { name: 'x', data: '' }]), /duplicato/);
});

test('zip: leggibile da unzip', { skip: !hasUnzip && 'unzip non disponibile' }, () => {
  const dir = tmp();
  const file = path.join(dir, 't.zip');
  fs.writeFileSync(file, createZip([{ name: 'cartella/file.txt', data: 'contenuto '.repeat(50) }]));
  assert.match(execFileSync('unzip', ['-t', file], { encoding: 'utf8' }), /No errors detected/);
  execFileSync('unzip', ['-q', file, '-d', path.join(dir, 'x')]);
  assert.equal(fs.readFileSync(path.join(dir, 'x', 'cartella', 'file.txt'), 'utf8'), 'contenuto '.repeat(50));
});

test('sito: pagine, kit e nessuna risorsa esterna', async () => {
  const out = tmp();
  await buildSite({ outDir: out, log: () => {} });

  for (const f of ['index.html', 'icone/index.html', KIT_ZIP, 'assets/brand.css', 'assets/tokens.css', 'fonts/fonts.css',
    'kit/LEGGIMI.txt', 'kit/logo/svg/salento-dev-logo-bianco.svg', 'kit/logo/png/salento-dev-logo-nero-2048.png', 'kit/logo/avatar/salento-dev-avatar-1024.png', 'kit/token/tokens.json']) {
    assert.ok(fs.existsSync(path.join(out, f)), `manca ${f}`);
  }
  const woff2 = fs.readdirSync(path.join(out, 'fonts')).filter((f) => f.endsWith('.woff2'));
  assert.ok(woff2.length >= 3, 'font woff2 self-hosted');

  // kit: contenuto atteso
  const names = readZip(fs.readFileSync(path.join(out, KIT_ZIP))).map((f) => f.name);
  for (const n of ['LEGGIMI.txt', 'token/tokens.json', 'token/tokens.css', 'logo/svg/salento-dev-logo-cyan.svg', 'logo/png/salento-dev-logo-bianco-512.png', 'logo/avatar/salento-dev-avatar-512.png']) {
    assert.ok(names.includes(`${KIT_ROOT}/${n}`), `zip: manca ${n}`);
  }
  assert.ok(names.every((n) => n.startsWith(`${KIT_ROOT}/`)));
  if (hasUnzip) assert.match(execFileSync('unzip', ['-t', path.join(out, KIT_ZIP)], { encoding: 'utf8' }), /No errors detected/);

  // nessuna richiesta esterna: script, fogli di stile, immagini, font e url() solo relativi
  const external = /^(https?:)?\/\//i;
  for (const page of ['index.html', 'icone/index.html']) {
    const html = fs.readFileSync(path.join(out, page), 'utf8');
    const refs = [...html.matchAll(/<(?:script|img|link|iframe|source)\b[^>]*?\s(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(refs.length > 0);
    for (const r of refs) assert.doesNotMatch(r, external, `${page}: risorsa esterna ${r}`);
    assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/);
    assert.doesNotMatch(html, /chat\.whatsapp\.com/);
    assert.match(html, /<html lang="it">/);
  }
  for (const css of ['assets/brand.css', 'fonts/fonts.css']) {
    const text = fs.readFileSync(path.join(out, css), 'utf8');
    for (const [, u] of text.matchAll(/url\(\s*['"]?([^'")]+)/g)) assert.doesNotMatch(u, external, `${css}: ${u}`);
    assert.doesNotMatch(text, /@import/);
  }

  // il brand book contiene le sezioni attese
  const book = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
  for (const id of ['essenza', 'logo', 'colori', 'tipografia', 'forme', 'community', 'regole', 'partner', 'download']) {
    assert.match(book, new RegExp(`<section class="module[^"]*" id="${id}"`), `sezione ${id}`);
  }
  assert.match(book, /Signal Cyan/);
  assert.match(book, /ADR-0012/);
  fs.rmSync(out, { recursive: true, force: true });
});
