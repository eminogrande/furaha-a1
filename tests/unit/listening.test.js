import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildListeningQuiz } from '../../js/listening.js';
import { vocabulary } from '../../data/vocabulary.js';

test('listening quiz builds <count> questions with 4 unique EN-meaning options', () => {
  const qs = buildListeningQuiz(vocabulary, 8);
  assert.equal(qs.length, 8);
  for (const q of qs) {
    assert.equal(new Set(q.options).size, 4, 'options unique');
    assert.ok(q.options.includes(q.correct), 'correct EN meaning among options');
    assert.ok(q.audioText, 'audio text present so player can speak it');
    assert.ok(q.transcript, 'transcript captured for post-answer reveal');
  }
});

test('listening quiz options are the English meanings, not the German words', () => {
  const qs = buildListeningQuiz(vocabulary, 8);
  for (const q of qs) {
    assert.notEqual(q.options[0], q.audioText, 'meaning options, not the German audio text');
  }
});

test('correct answer equals the audio text meaning (objectiveness testable)', () => {
  const qs = buildListeningQuiz(vocabulary, 8);
  const sourceById = new Map(vocabulary.map((w) => [w.id, w]));
  for (const q of qs) {
    const src = sourceById.get(q.id.replace('list-', ''));
    assert.equal(q.correct, src.en);
  }
});

test('respects requested count and does not exceed available words', () => {
  assert.equal(buildListeningQuiz(vocabulary, 3).length, 3);
  assert.ok(buildListeningQuiz(vocabulary, 9999).length <= vocabulary.length);
});
