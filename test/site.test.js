import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createZip, readZip, crc32 } from '../src/zip.js';
import { buildSite } from '../scripts/site.js';
import { KIT_ROOT, KIT_ZIP, LOGO_PACK_ROOT, LOGO_PACK_ZIP } from '../src/kit.js';
import { expectedFiles, FAMILIES } from '../src/logo.js';

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

  for (const f of ['index.html', 'icone/index.html', KIT_ZIP, LOGO_PACK_ZIP, 'assets/brand.css', 'assets/tokens.css', 'fonts/fonts.css',
    'kit/LEGGIMI.txt', 'kit/logo-pack/README.md', 'kit/logo-pack/SHA256SUMS', 'kit/logo-pack/logos/svg/padded/salentodev-horizontal-white-on-dark-padded.svg',
    'kit/avatar/salentodev-avatar.svg', 'kit/avatar/salentodev-avatar-1024.png', 'kit/token/tokens.json']) {
    assert.ok(fs.existsSync(path.join(out, f)), `manca ${f}`);
  }
  const woff2 = fs.readdirSync(path.join(out, 'fonts')).filter((f) => f.endsWith('.woff2'));
  assert.ok(woff2.length >= 3, 'font woff2 self-hosted');

  // kit: contenuto atteso, con il logo pack ufficiale identico ai file del repo
  const kit = readZip(fs.readFileSync(path.join(out, KIT_ZIP)));
  const names = kit.map((f) => f.name);
  for (const n of ['LEGGIMI.txt', 'token/tokens.json', 'token/tokens.css', 'avatar/salentodev-avatar.svg', 'avatar/salentodev-avatar-512.png', 'logo-pack/README.md', 'logo-pack/SHA256SUMS', ...expectedFiles().map((f) => `logo-pack/${f}`)]) {
    assert.ok(names.includes(`${KIT_ROOT}/${n}`), `zip: manca ${n}`);
  }
  assert.ok(names.every((n) => n.startsWith(`${KIT_ROOT}/`)));
  assert.ok(!names.some((n) => /salento-dev-logo-|logo\/svg\//.test(n)), 'niente loghi rigenerati');
  const official = (f) => fs.readFileSync(path.join('assets/logo/official', f));
  for (const f of expectedFiles()) assert.ok(kit.find((e) => e.name === `${KIT_ROOT}/logo-pack/${f}`).data.equals(official(f)), f);
  const leggimi = kit.find((e) => e.name === `${KIT_ROOT}/LEGGIMI.txt`).data.toString();
  assert.match(leggimi, /Tutti i diritti riservati/);
  assert.match(leggimi, /Salento Cyan #20D0ED/);
  assert.match(leggimi, /Salento\.dev è una community tech/);

  // logo pack da solo: stessa struttura del media kit
  const pack = readZip(fs.readFileSync(path.join(out, LOGO_PACK_ZIP))).map((f) => f.name);
  assert.deepEqual(pack.sort(), ['README.md', 'SHA256SUMS', ...expectedFiles()].map((f) => `${LOGO_PACK_ROOT}/${f}`).sort());
  for (const z of [KIT_ZIP, LOGO_PACK_ZIP]) {
    if (hasUnzip) assert.match(execFileSync('unzip', ['-t', path.join(out, z)], { encoding: 'utf8' }), /No errors detected/);
  }

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
  for (const id of ['essenza', 'descrizioni', 'logo', 'colori', 'tipografia', 'forme', 'community', 'regole', 'partner', 'download']) {
    assert.match(book, new RegExp(`<section class="module[^"]*" id="${id}"`), `sezione ${id}`);
  }
  assert.match(book, /Signal Cyan/);
  assert.match(book, /Salento Cyan/);
  assert.match(book, /ADR-0012/);
  // logo: 4 famiglie, ognuna con 3 varianti × SVG/PNG/WEBP × con/senza padding scaricabili, file esistenti
  for (const f of FAMILIES) assert.match(book, new RegExp(`id="logo-${f}"`), f);
  const downloads = [...book.matchAll(/href="(kit\/logo-pack\/logos\/[^"]+)" download/g)].map((m) => m[1]);
  assert.equal(new Set(downloads).size, 72);
  for (const d of downloads) assert.ok(fs.existsSync(path.join(out, d)), d);
  assert.match(book, new RegExp(`href="${LOGO_PACK_ZIP}"`));
  assert.match(book, /Quale logo usare dove/);
  assert.match(book, /Tutti i diritti riservati/);
  assert.match(book, /<link rel="icon" href="kit\/avatar\/salentodev-avatar\.svg"/);
  // descrizioni ufficiali copiabili, nome scritto Salento.dev
  assert.equal([...book.matchAll(/class="copy copy-text" data-copy="Salento\.dev /g)].length, 3);
  assert.doesNotMatch(book.replace(/<img[^>]*>/g, ''), /Salento\.Dev[^,]/);
  fs.rmSync(out, { recursive: true, force: true });
});
