import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createReview } from '../../js/review.js';

function memBackend() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    _m: m,
  };
}

test('track normalization maps german/furaha to de and swahili/emin to sw', () => {
  const r = createReview(memBackend());
  assert.equal(r.track('de'), 'de');
  assert.equal(r.track('german'), 'de');
  assert.equal(r.track('furaha'), 'de');
  assert.equal(r.track('sw'), 'sw');
  assert.equal(r.track('swahili'), 'sw');
  assert.equal(r.track('emin'), 'sw');
  assert.equal(r.track('unknown'), 'de');
});

test('objective check records attempt and correctness separately', () => {
  const r = createReview(memBackend());
  r.recordCheck('de', 'vocab', 'p01', true, '2026-01-01');
  const e = r.get('de', 'p01');
  assert.equal(e.attempts, 1);
  assert.equal(e.correct, 1);
  assert.equal(e.weak, false);
});

test('objective wrong answer marks item weak but does not clear past corrects', () => {
  const r = createReview(memBackend());
  r.recordCheck('de', 'vocab', 'p01', true, '2026-01-01');
  r.recordCheck('de', 'vocab', 'p01', false, '2026-01-02');
  const e = r.get('de', 'p01');
  assert.equal(e.attempts, 2);
  assert.equal(e.correct, 1);
  assert.equal(e.weak, true);
});

test('flashcard Got it sets self-reported familiarity but NOT objective correctness', () => {
  const r = createReview(memBackend());
  r.recordFlash('de', 'p01', 'gotit', '2026-01-01');
  const e = r.get('de', 'p01');
  assert.equal(e.selfFam, true);
  assert.equal(e.attempts, 0, 'self-report must not count as an objective attempt');
  assert.equal(e.correct, 0, 'self-report must not create fake mastery');
  assert.equal(e.flashGotIt, 1);
});

test('flashcard Again does not clear a weak objective status', () => {
  const r = createReview(memBackend());
  r.recordCheck('de', 'vocab', 'p01', false, '2026-01-01');
  r.recordFlash('de', 'p01', 'gotit', '2026-01-02');
  assert.equal(r.get('de', 'p01').weak, true, 'self-report cannot clear objective weakness');
});

test('due dates: correct -> later, wrong -> today, again -> +1, gotit -> +4', () => {
  const r = createReview(memBackend());
  r.recordCheck('de', 'vocab', 'a', true, '2026-01-10');
  assert.equal(r.get('de', 'a').due, '2026-01-13');
  r.recordCheck('de', 'vocab', 'b', false, '2026-01-10');
  assert.equal(r.get('de', 'b').due, '2026-01-10');
  r.recordFlash('de', 'c', 'again', '2026-01-10');
  assert.equal(r.get('de', 'c').due, '2026-01-11');
  r.recordFlash('de', 'd', 'gotit', '2026-01-10');
  assert.equal(r.get('de', 'd').due, '2026-01-14');
});

test('isDue true when due date is on or before today', () => {
  const r = createReview(memBackend());
  r.recordCheck('de', 'vocab', 'a', false, '2026-01-10'); // due today
  assert.equal(r.isDue('de', 'a', '2026-01-10'), true);
  r.recordCheck('de', 'vocab', 'b', true, '2026-01-10'); // due +3
  assert.equal(r.isDue('de', 'b', '2026-01-12'), false);
  assert.equal(r.isDue('de', 'b', '2026-01-13'), true);
});

test('buildFlashQueue mixes due, weak, then new items, deduplicated', () => {
  const r = createReview(memBackend());
  // due: 'due1' (wrong -> due today); weak: 'weak1' (wrong -> weak+due today);
  // new: 'new1','new2' (never attempted); rest: 'rest1' (correct -> due later, not weak)
  r.recordCheck('de', 'vocab', 'due1', false, '2026-01-10');
  r.recordCheck('de', 'vocab', 'weak1', false, '2026-01-10');
  r.recordCheck('de', 'vocab', 'rest1', true, '2026-01-10');
  const ids = r.buildFlashQueue('de', ['due1', 'weak1', 'new1', 'new2', 'rest1'], '2026-01-10', 10);
  assert.equal(new Set(ids).size, ids.length, 'no duplicates');
  assert.equal(ids[0], 'due1');
  assert.equal(ids[1], 'weak1');
  assert.ok(ids.indexOf('new1') < ids.indexOf('rest1'), 'new items review before merely-seen items');
  assert.ok(ids.includes('new1') && ids.includes('new2'));
});

test('buildFlashQueue respects size limit', () => {
  const r = createReview(memBackend());
  const ids = r.buildFlashQueue('de', ['a', 'b', 'c', 'd'], '2026-01-10', 2);
  assert.equal(ids.length, 2);
});

test('daily activity counts distinct items attempted that day', () => {
  const r = createReview(memBackend());
  r.recordCheck('de', 'grammar', 'g1', true, '2026-01-01');
  r.recordCheck('de', 'grammar', 'g1', false, '2026-01-01'); // same item twice
  r.recordCheck('de', 'grammar', 'g2', true, '2026-01-01');
  assert.equal(r.activityCount('de', 'grammar', '2026-01-01'), 2, 'distinct items only');
  assert.equal(r.activityCount('de', 'grammar', '2026-01-02'), 0, 'other day empty');
});

test('isActivityDone requires real attempts, never just opening the screen', () => {
  const r = createReview(memBackend());
  assert.equal(r.isActivityDone('de', 'reading', '2026-01-01'), false, 'no attempt -> not done');
  r.recordCheck('de', 'reading', 'rq1', true, '2026-01-01');
  assert.equal(r.isActivityDone('de', 'reading', '2026-01-01'), true);
  assert.equal(r.isActivityDone('de', 'reading', '2026-01-02'), false, 'not done on next day');
});

test('recordPractice counts writing/speaking self-practice but no objective correctness', () => {
  const r = createReview(memBackend());
  r.recordPractice('de', 'writing', 'w1', '2026-01-01');
  const e = r.get('de', 'w1');
  assert.equal(e.attempts, 0, 'self practice is not an objective answer');
  assert.equal(r.activityCount('de', 'writing', '2026-01-01'), 1);
  assert.equal(r.isActivityDone('de', 'writing', '2026-01-01'), true);
});

test('progress persists per track across instances', () => {
  const b = memBackend();
  const r1 = createReview(b);
  r1.recordCheck('de', 'vocab', 'p01', true, '2026-01-01');
  r1.recordCheck('sw', 'vocab', 'h1', true, '2026-01-01');
  const r2 = createReview(b);
  assert.equal(r2.get('de', 'p01').attempts, 1);
  assert.equal(r2.get('sw', 'h1').attempts, 1);
  assert.equal(r2.get('de', 'h1'), null, 'tracks are isolated');
});

test('stats reports objective correctness and due/weak counts honestly', () => {
  const r = createReview(memBackend());
  r.recordCheck('de', 'vocab', 'a', true, '2026-01-01');
  r.recordCheck('de', 'vocab', 'b', false, '2026-01-01');
  r.recordFlash('de', 'c', 'gotit', '2026-01-01');
  const s = r.stats('de', '2026-01-01');
  assert.equal(s.objective.attempts, 2);
  assert.equal(s.objective.correct, 1);
  assert.equal(s.weak, 1);
  assert.equal(s.dueToday, 1); // only b (wrong, due today) is due; a and c are scheduled later
});

test('reset clears all review data', () => {
  const r = createReview(memBackend());
  r.recordCheck('de', 'vocab', 'a', true, '2026-01-01');
  r.reset();
  assert.equal(r.get('de', 'a'), null);
});
