import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProgress } from '../../js/progress.js';

function memBackend() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    _m: m,
  };
}

test('progress records a completed activity', () => {
  const p = createProgress(memBackend());
  p.record('quiz', 'food');
  const s = p.stats();
  assert.equal(s.total, 1);
});

test('progress stats count by type', () => {
  const p = createProgress(memBackend());
  p.record('quiz', 'food');
  p.record('quiz', 'food');
  p.record('reading', 'travel');
  const s = p.stats();
  assert.equal(s.total, 3);
  assert.equal(s.byType.quiz, 2);
  assert.equal(s.byType.reading, 1);
});

test('progress persists across instances', () => {
  const b = memBackend();
  const p1 = createProgress(b);
  p1.record('quiz', 'food');
  const p2 = createProgress(b);
  assert.equal(p2.stats().total, 1);
});

test('progress reset clears all data', () => {
  const b = memBackend();
  const p = createProgress(b);
  p.record('quiz', 'food');
  p.reset();
  assert.equal(p.stats().total, 0);
});

test('progress handles corrupt stored data gracefully', () => {
  const b = memBackend();
  b._m.set('furaha.progress', '{corrupt');
  const p = createProgress(b);
  assert.equal(p.stats().total, 0);
  p.record('quiz', 'food');
  assert.equal(p.stats().total, 1);
});

test('progress tracks last activity date', () => {
  const p = createProgress(memBackend());
  p.record('quiz', 'food', '2026-01-05');
  assert.equal(p.stats().lastDate, '2026-01-05');
});
