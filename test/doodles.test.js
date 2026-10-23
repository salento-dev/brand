import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { lintDoodle, loadDoodleSets, checkDoodleSets, doodleRole } from '../src/doodles.js';
import { DOODLES_DIR } from '../src/paths.js';

const svg = (body, root = 'fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" ${root}>${body}</svg>`;

test('i doodle del repo passano il lint', () => {
  for (const f of fs.readdirSync(DOODLES_DIR).filter((n) => n.endsWith('.svg'))) {
    assert.deepEqual(lintDoodle(fs.readFileSync(path.join(DOODLES_DIR, f), 'utf8')), [], f);
  }
});

test('sets.yaml valido', () => {
  assert.deepEqual(checkDoodleSets(loadDoodleSets()), []);
  assert.ok(checkDoodleSets({ base: ['filler-dot'], fillers: ['sun'] }).length === 2);
  assert.ok(checkDoodleSets({ base: ['non-esiste'], fillers: ['filler-dot'] }).some((e) => e.includes('non esiste')));
});

test('ruolo dal prefisso', () => {
  assert.equal(doodleRole('sun'), 'doodle');
  assert.equal(doodleRole('filler-dot'), 'filler');
  assert.equal(doodleRole('hero-boat-sea'), 'scene');
});

test('colori, tag e archi non ammessi falliscono', () => {
  assert.ok(lintDoodle(svg('<path d="M0 0L10 10" stroke="#ff0000"/>')).some((e) => e.includes('currentColor')));
  assert.ok(lintDoodle(svg('<text>ciao</text>')).some((e) => e.includes('<text>')));
  assert.ok(lintDoodle(svg('<path d="M0 0A5 5 0 0 1 10 10"/>')).some((e) => e.includes('archi')));
  assert.ok(lintDoodle(svg('<path d="M0 0L10 10"/>', 'fill="none" stroke="currentColor"')).some((e) => e.includes('round')));
  assert.deepEqual(lintDoodle(svg('<path d="M0 0C5 5 5 5 10 10"/><circle cx="5" cy="5" r="2" fill="currentColor" stroke="none"/>')), []);
});
