import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseGroup, accentWarnings } from '../src/groups.js';

const H = '# yaml-language-server: $schema=../../schema/group.schema.json\n';
const yes = () => true;
const parse = (file, yaml, opts = { hasSubject: yes, hasDoodle: yes }) => parseGroup(file, H + yaml, opts);
const PERM = 'name: AI Corner\nshortName: AI Corner\nkind: permanent\nsubject: robot\naccent: cyan\n';
const TEMP = 'name: Trasferta\nshortName: Trasferta\nkind: temporary\nsubject: train\n';
const has = (errors, prefix) => errors.some((e) => e.startsWith(prefix));

test('gruppo permanent valido', () => {
  const { group, errors } = parse('ai-corner.yaml', `${PERM}doodles: [chip, brain]\n`);
  assert.deepEqual(errors, []);
  assert.equal(group.slug, 'ai-corner'); // slug = nome file
  assert.equal(group.status, 'active'); // default
  assert.deepEqual(group.doodles, ['chip', 'brain']);
});

test('gruppo temporary valido (senza accent)', () => {
  const { errors } = parse('trasferta.yaml', `${TEMP}starts: 2026-11-18\nends: 2026-11-19\n`);
  assert.deepEqual(errors, []);
});

test('permanent senza accent fallisce', () => {
  const { errors } = parse('p.yaml', PERM.replace('accent: cyan\n', ''));
  assert.ok(has(errors, 'accent:'));
});

test('accento fuori elenco fallisce', () => {
  const { errors } = parse('p.yaml', PERM.replace('cyan', 'rosso'));
  assert.ok(errors.some((e) => e.startsWith('accent:') && e.includes('cyan')));
});

test('temporary con accent fallisce (pietra obbligatoria)', () => {
  const { errors } = parse('t.yaml', `${TEMP}accent: cyan\nstarts: 2026-11-18\nends: 2026-11-19\n`);
  assert.ok(errors.some((e) => e.startsWith('accent:') && e.includes('pietra')));
});

test('temporary senza date fallisce', () => {
  const { errors } = parse('t.yaml', TEMP);
  assert.ok(has(errors, 'starts:'));
  assert.ok(has(errors, 'ends:'));
});

test('temporary con ends prima di starts fallisce', () => {
  const { errors } = parse('t.yaml', `${TEMP}starts: 2026-11-19\nends: 2026-11-18\n`);
  assert.ok(has(errors, 'ends:'));
});

test('permanent con date fallisce', () => {
  const { errors } = parse('p.yaml', `${PERM}starts: 2026-11-18\n`);
  assert.ok(errors.some((e) => e.includes('non ammesso per i gruppi permanent')));
});

test('shortName obbligatorio e al massimo 14 caratteri', () => {
  assert.ok(has(parse('p.yaml', PERM.replace('shortName: AI Corner\n', '')).errors, 'shortName:'));
  assert.ok(has(parse('p.yaml', PERM.replace('shortName: AI Corner', 'shortName: Quindici lettere')).errors, 'shortName:'));
  assert.deepEqual(parse('p.yaml', PERM.replace('shortName: AI Corner', 'shortName: Quattordici ab')).errors, []);
});

test('nome oltre 32 caratteri fallisce', () => {
  assert.ok(has(parse('p.yaml', PERM.replace('name: AI Corner', `name: ${'x'.repeat(33)}`)).errors, 'name:'));
});

test('nome file non kebab-case (slug non valido) fallisce', () => {
  for (const file of ['AI_Corner.yaml', 'caffè.yaml', 'ai--corner.yaml']) {
    assert.ok(parse(file, PERM).errors.some((e) => e.includes('kebab-case')), file);
  }
});

test('soggetto inesistente fallisce', () => {
  const { errors } = parse('x.yaml', PERM, { hasSubject: () => false, hasDoodle: yes });
  assert.ok(errors.some((e) => e.startsWith('subject:') && e.includes('non esiste')));
});

test('doodle inesistente, ripetuto o non adatto fallisce', () => {
  assert.ok(has(parse('x.yaml', `${PERM}doodles: [chip]\n`, { hasSubject: yes, hasDoodle: () => false }).errors, 'doodles:'));
  assert.ok(has(parse('x.yaml', `${PERM}doodles: [chip, chip]\n`).errors, 'doodles:'));
  assert.ok(has(parse('x.yaml', `${PERM}doodles: [filler-dot]\n`).errors, 'doodles:'));
  assert.ok(has(parse('x.yaml', `${PERM}doodles: [hero-boat-sea]\n`).errors, 'doodles:'));
});

test('soggetto e doodle reali del repo', () => {
  assert.deepEqual(parseGroup('x.yaml', `${H}${PERM}doodles: [chip]\n`).errors, []);
  assert.ok(has(parseGroup('x.yaml', `${H}${PERM.replace('robot', 'non-esiste')}`).errors, 'subject:'));
  assert.ok(has(parseGroup('x.yaml', `${H}${PERM}doodles: [non-esiste]\n`).errors, 'doodles:'));
});

test('chiavi sconosciute (es. link di invito) falliscono', () => {
  assert.ok(parse('x.yaml', `${PERM}invite: https://chat.whatsapp.com/abc\n`).errors.length > 0);
});

test('avviso se due permanenti attivi condividono l\'accento', () => {
  const g = (slug, accent, extra = {}) => ({ slug, kind: 'permanent', accent, status: 'active', ...extra });
  assert.equal(accentWarnings([g('a', 'cyan'), g('b', 'violet')]).length, 0);
  assert.equal(accentWarnings([g('a', 'cyan'), g('b', 'cyan', { status: 'archived' })]).length, 0);
  const w = accentWarnings([g('a', 'cyan'), g('b', 'cyan')]);
  assert.equal(w.length, 1);
  assert.match(w[0], /a, b/);
});
