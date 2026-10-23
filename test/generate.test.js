import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selection } from '../scripts/generate.js';

test('--only: un YAML cambiato genera solo quel gruppo', () => {
  assert.deepEqual([...selection(['content/groups/ai-corner.yaml', 'README.md']).groups], ['ai-corner']);
});

test('--only: token/formati/soggetti/doodle/codice rigenerano tutto', () => {
  for (const f of ['tokens/tokens.json', 'formats/icon.js', 'assets/subjects/robot.svg', 'assets/doodles/sets.yaml', 'src/wallpaper.js', 'package-lock.json']) {
    assert.equal(selection([f]), null, f);
  }
});

test('--only: nessun file rilevante non genera nulla', () => {
  assert.deepEqual(selection(['docs/README.md']), {});
});
