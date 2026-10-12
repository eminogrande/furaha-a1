import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildQuiz, checkAnswer, QuizSession } from '../../js/quiz.js';
import { vocabulary } from '../../data/vocabulary.js';

test('buildQuiz produces 4 nonduplicated options including the correct one', () => {
  const q = buildQuiz(vocabulary, 10);
  assert.equal(q.length, 10);
  for (const item of q) {
    assert.equal(item.options.length, 4);
    assert.equal(new Set(item.options).size, 4, 'options must be unique');
    assert.ok(item.options.includes(item.correct), 'correct answer must be among options');
    assert.ok(item.prompt, 'prompt required');
  }
});

test('buildQuiz options are all real vocabulary words', () => {
  const q = buildQuiz(vocabulary, 5);
  const allWords = new Set(vocabulary.map((w) => w.de));
  for (const item of q) {
    for (const opt of item.options) {
      assert.ok(allWords.has(opt), `option ${opt} not in vocabulary`);
    }
  }
});

test('buildQuiz respects requested count and does not exceed available', () => {
  const q = buildQuiz(vocabulary, 3);
  assert.equal(q.length, 3);
  const big = buildQuiz(vocabulary, 9999);
  assert.ok(big.length <= vocabulary.length);
});

test('checkAnswer returns correct:true for right answer', () => {
  const q = buildQuiz(vocabulary, 1)[0];
  const r = checkAnswer(q, q.correct);
  assert.equal(r.correct, true);
  assert.ok(r.explanation, 'explanation required');
});

test('checkAnswer returns correct:false with explanation for wrong answer', () => {
  const q = buildQuiz(vocabulary, 1)[0];
  const wrong = q.options.find((o) => o !== q.correct);
  const r = checkAnswer(q, wrong);
  assert.equal(r.correct, false);
  assert.ok(r.explanation, 'explanation required');
});

test('QuizSession tracks mistakes and retry returns only wrong items', () => {
  const q = buildQuiz(vocabulary, 5);
  const s = new QuizSession(q);
  // answer all wrong
  for (const item of q) {
    const wrong = item.options.find((o) => o !== item.correct);
    s.answer(item, wrong);
  }
  assert.equal(s.mistakes.length, 5);
  const retry = s.retryQuiz();
  assert.equal(retry.length, 5);
  // answer retry correctly
  for (const item of retry) {
    s.answer(item, item.correct);
  }
  assert.equal(s.mistakes.length, 0);
});

test('QuizSession counts score and tracks answered', () => {
  const q = buildQuiz(vocabulary, 4);
  const s = new QuizSession(q);
  s.answer(q[0], q[0].correct);
  s.answer(q[1], q[1].options.find((o) => o !== q[1].correct));
  assert.equal(s.score, 1);
  assert.equal(s.answered, 2);
  assert.equal(s.total, 4);
});

test('QuizSession ignores answers to unknown items', () => {
  const q = buildQuiz(vocabulary, 2);
  const s = new QuizSession(q);
  const fake = { id: 'nope', correct: 'x', options: ['x', 'y'] };
  s.answer(fake, 'x');
  assert.equal(s.answered, 0);
});
