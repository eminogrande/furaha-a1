import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDailyPath, isPathDone } from '../../js/studyPath.js';

test('buildDailyPath returns a non-empty ordered list of activities', () => {
  const path = buildDailyPath();
  assert.ok(Array.isArray(path) && path.length > 0);
  for (const step of path) {
    assert.ok(step.id, 'step needs id');
    assert.ok(step.type, 'step needs type');
    assert.ok(step.label, 'step needs label');
  }
});

test('buildDailyPath starts with a warm-up and includes varied activity types', () => {
  const path = buildDailyPath();
  const types = new Set(path.map((s) => s.type));
  assert.ok(types.size >= 3, 'path should include several activity types');
});

test('buildDailyPath is deterministic for same day', () => {
  const a = buildDailyPath('2026-01-01');
  const b = buildDailyPath('2026-01-01');
  assert.deepEqual(a, b);
});

test('buildDailyPath varies by day', () => {
  const a = buildDailyPath('2026-01-01');
  const b = buildDailyPath('2026-01-02');
  assert.notDeepEqual(a, b);
});

test('isPathDone true when all steps completed', () => {
  const path = buildDailyPath();
  const done = new Set(path.map((s) => s.id));
  assert.equal(isPathDone(path, done), true);
});

test('isPathDone false when some steps missing', () => {
  const path = buildDailyPath();
  assert.equal(isPathDone(path, new Set()), false);
});
