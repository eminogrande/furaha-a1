import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grammarLessons } from '../../data/grammar.js';
import { readingPassages } from '../../data/reading.js';
import { writingPrompts } from '../../data/writing.js';
import { speakingPrompts } from '../../data/speaking.js';

test('grammar covers all required A1 topics', () => {
  const ids = grammarLessons.map((l) => l.id);
  const required = ['sein', 'haben', 'present', 'question-words', 'yes-no', 'negation',
    'accusative', 'modal', 'separable', 'perfect', 'dative', 'imperative', 'time-numbers'];
  for (const r of required) {
    assert.ok(ids.includes(r), `missing grammar lesson ${r}`);
  }
});

test('grammar lessons have en+sw explanations and practice', () => {
  for (const l of grammarLessons) {
    assert.ok(l.title && l.en && l.sw, `lesson ${l.id} missing text`);
    assert.ok(Array.isArray(l.practice) && l.practice.length > 0, `lesson ${l.id} no practice`);
    for (const p of l.practice) {
      assert.ok(p.q && p.options && p.correct && p.why, `practice item broken in ${l.id}`);
      assert.ok(p.options.includes(p.correct), `correct not in options in ${l.id}`);
      assert.equal(new Set(p.options).size, p.options.length, `dup options in ${l.id}`);
    }
  }
});

test('reading passages have de/en/sw and questions', () => {
  for (const r of readingPassages) {
    assert.ok(r.title && r.de && r.en && r.sw, `passage ${r.id} missing text`);
    assert.ok(r.questions.length >= 3, `passage ${r.id} needs >=3 questions`);
    for (const q of r.questions) {
      assert.ok(q.q && q.options && q.correct && q.why, `question broken in ${r.id}`);
      assert.ok(q.options.includes(q.correct), `correct not in options in ${r.id}`);
      assert.equal(new Set(q.options).size, q.options.length, `dup options in ${r.id}`);
    }
  }
});

test('writing prompts have prompt, sw prompt, and model examples', () => {
  for (const w of writingPrompts) {
    assert.ok(w.title && w.prompt && w.promptSw, `writing ${w.id} missing prompt`);
    assert.ok(w.model && w.modelEn, `writing ${w.id} missing model`);
  }
});

test('speaking prompts have prompt, sw prompt, and model answers', () => {
  for (const s of speakingPrompts) {
    assert.ok(s.title && s.prompt && s.promptSw, `speaking ${s.id} missing prompt`);
    assert.ok(s.model && s.modelEn, `speaking ${s.id} missing model`);
  }
});
