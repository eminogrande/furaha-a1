import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import {
  loadGuide,
  getLevel,
  localize,
  checkAnswer,
  recordAttempt,
  getProgress,
  recordSelfCheck,
  getSelfChecks,
} from '../../js/levels.js';

// In-memory localStorage stand-in (mirrors storage.test.js).
function makeBackend() {
  const store = new Map();
  return {
    getItem(k) { return store.has(k) ? store.get(k) : null; },
    setItem(k, v) { store.set(k, String(v)); },
    removeItem(k) { store.delete(k); },
    _store: store,
  };
}

const LEVEL_IDS = ['A2', 'B1', 'B2', 'C1', 'C2'];

test('loadGuide returns the five A2–C2 levels in order', () => {
  const guide = loadGuide(JSON.parse(readFileSync('data/level-guide.json', 'utf8')));
  assert.deepEqual(guide.levels.map((l) => l.id), LEVEL_IDS);
});

test('loadGuide rejects a guide missing a level', () => {
  assert.throws(() => loadGuide({ levels: [{ id: 'A2' }] }), /A2.*C2|five|levels/i);
});

test('getLevel returns the requested level and undefined for unknown', () => {
  const guide = loadGuide(JSON.parse(readFileSync('data/level-guide.json', 'utf8')));
  assert.equal(getLevel(guide, 'B1').id, 'B1');
  assert.equal(getLevel(guide, 'D3'), undefined);
});

test('localize returns the requested language and falls back to en', () => {
  assert.equal(localize({ en: 'Hello', sw: 'Habari' }, 'sw'), 'Habari');
  assert.equal(localize({ en: 'Hello', sw: 'Habari' }, 'en'), 'Hello');
  assert.equal(localize({ en: 'Hello' }, 'sw'), 'Hello', 'missing sw falls back to en');
});

test('checkAnswer marks the correct index right and others wrong with feedback', () => {
  const q = {
    options: [{ de: 'a' }, { de: 'b' }, { de: 'c' }],
    correctIndex: 1,
    feedback: { en: 'fb', sw: 'fbsw' },
  };
  assert.equal(checkAnswer(q, 1).correct, true);
  assert.equal(checkAnswer(q, 0).correct, false);
  assert.equal(checkAnswer(q, 2).correct, false);
  assert.equal(checkAnswer(q, 1).feedback.en, 'fb');
});

test('checkAnswer rejects an out-of-range index', () => {
  const q = { options: [{ de: 'a' }, { de: 'b' }, { de: 'c' }], correctIndex: 0, feedback: { en: 'x' } };
  assert.equal(checkAnswer(q, 5).correct, false);
  assert.equal(checkAnswer(q, -1).correct, false);
});

test('recordAttempt persists per level and never labels mastery', () => {
  const b = makeBackend();
  recordAttempt(b, 'A2', 'q1', true);
  recordAttempt(b, 'A2', 'q2', false);
  recordAttempt(b, 'B1', 'q1', true);
  const a2 = getProgress(b, 'A2');
  const b1 = getProgress(b, 'B1');
  assert.equal(a2.attempts, 2);
  assert.equal(a2.correct, 1);
  assert.equal(b1.attempts, 1);
  assert.equal(b1.correct, 1);
  assert.equal(a2.mastery, undefined, 'must not expose a mastery label');
  assert.equal(a2.level, 'A2');
});

test('getProgress returns zeros for a level with no attempts', () => {
  const b = makeBackend();
  const p = getProgress(b, 'C2');
  assert.equal(p.attempts, 0);
  assert.equal(p.correct, 0);
});

test('recordSelfCheck persists separately from question attempts', () => {
  const b = makeBackend();
  recordAttempt(b, 'B2', 'q1', true);
  recordSelfCheck(b, 'B2', 'writing');
  recordSelfCheck(b, 'B2', 'speaking');
  const checks = getSelfChecks(b, 'B2');
  assert.deepEqual(checks.sort(), ['speaking', 'writing']);
  // question attempts untouched by self-checks
  assert.equal(getProgress(b, 'B2').attempts, 1);
});

test('real guide data is complete and internally consistent', () => {
  const guide = loadGuide(JSON.parse(readFileSync('data/level-guide.json', 'utf8')));
  for (const l of guide.levels) {
    assert.ok(l.name && l.name.en && l.name.sw, `${l.id} needs bilingual name`);
    assert.ok(l.outcomes && l.outcomes.reading && l.outcomes.writing, `${l.id} needs outcomes`);
    assert.ok(Array.isArray(l.studyPlan.units) && l.studyPlan.units.length >= 5, `${l.id} study plan`);
    assert.ok(Array.isArray(l.examPractice) && l.examPractice.length >= 1, `${l.id} exam practice links`);
    assert.ok(Array.isArray(l.freeCourses) && l.freeCourses.length >= 1, `${l.id} free course links`);
    // practice block
    const p = l.practice;
    assert.ok(p.situation && p.situation.de, `${l.id} needs a German situation`);
    assert.ok(p.explanation && p.explanation.en && p.explanation.sw, `${l.id} needs EN+SW explanation`);
    assert.equal(p.questions.length, 3, `${l.id} must have exactly 3 MCQs`);
    for (const q of p.questions) {
      assert.equal(q.options.length, 3, `${l.id} MCQ must have 3 options`);
      const texts = q.options.map((o) => o.de);
      assert.equal(new Set(texts).size, 3, `${l.id} MCQ options must be distinct`);
      assert.ok(q.correctIndex >= 0 && q.correctIndex < 3, `${l.id} valid correctIndex`);
      assert.ok(q.feedback && q.feedback.en && q.feedback.sw, `${l.id} MCQ needs EN+SW feedback`);
    }
    assert.ok(p.writing && p.writing.prompt && p.writing.model && p.writing.selfCheck, `${l.id} writing block`);
    assert.ok(p.speaking && p.speaking.prompt && p.speaking.model && p.speaking.selfCheck, `${l.id} speaking block`);
  }
});

test('real guide data has no weak third-party grammar sources', () => {
  const guide = loadGuide(JSON.parse(readFileSync('data/level-guide.json', 'utf8')));
  const all = JSON.stringify(guide);
  for (const bad of ['scribd', 'podtext', 'grammarmama', 'github.com/AhsanSheraz']) {
    assert.ok(!all.toLowerCase().includes(bad), `must not reference weak source: ${bad}`);
  }
});

test('real guide data does not claim to be a complete course or exam', () => {
  const guide = loadGuide(JSON.parse(readFileSync('data/level-guide.json', 'utf8')));
  const all = JSON.stringify(guide).toLowerCase();
  assert.ok(all.includes('not a complete course') || all.includes('partial'), 'must state partial scope');
  assert.ok(all.includes('demonstration') || all.includes('sample'), 'must label practice as demonstration');
});
