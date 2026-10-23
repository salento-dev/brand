import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatRange } from '../src/dates.js';

test('intervallo di date compatto', () => {
  assert.equal(formatRange('2026-11-12', '2026-11-12'), '12 NOV 26');
  assert.equal(formatRange('2026-11-12', '2026-11-14'), '12–14 NOV 26');
  assert.equal(formatRange('2026-10-30', '2026-11-02'), '30 OTT–2 NOV 26');
  assert.equal(formatRange('2026-12-30', '2027-01-02'), '30 DIC 26–2 GEN 27');
});
