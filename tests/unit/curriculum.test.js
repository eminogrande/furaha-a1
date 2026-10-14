import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { parseCurriculum, prepareQuestions, toQuizQuestions } from '../../js/curriculum.js';

const fixture = {
  meta: { languages: ['en', 'sw', 'de'] },
  lessons: [
    {
      id: 'l1', track: 'swahili', type: 'language',
      title: { en: 'Greetings', sw: 'Salamu' },
      body: { en: 'body', sw: 'mwili' },
      phrases: [{ sw: 'Jambo!', en: 'Hello!' }, { sw: 'Habari?', en: 'How are you?' }],
      questions: [
        {
          prompt: { en: 'Meaning?', sw: 'Maana?' },
          options: [{ en: 'A', sw: 'a' }, { en: 'B', sw: 'b' }, { en: 'C', sw: 'c' }, { en: 'D', sw: 'd' }],
          correctIndex: 0, explanation: { en: 'exp', sw: 'eleza' },
        },
        {
          prompt: { en: 'Which?', sw: 'Gani?' },
          options: [{ en: 'W', sw: 'w' }, { en: 'X', sw: 'x' }, { en: 'Y', sw: 'y' }, { en: 'Z', sw: 'z' }],
          correctIndex: 3, explanation: { en: 'e', sw: 'f' },
        },
      ],
      sources: [{ title: 'src', url: 'https://x' }],
    },
    {
      id: 'l2', track: 'german', type: 'roadmap',
      title: { en: 'Levels', sw: 'Viwango' },
      body: { en: 'b', sw: 'b2' },
      phrases: [{ de: 'Ich lerne.', en: 'I learn.' }],
      questions: [
        {
          prompt: { en: 'How many?', sw: 'Ngapi?' },
          options: [{ en: 'Six', sw: 'sita' }, { en: 'Four', sw: 'nne' }, { en: 'Two', sw: 'mbili' }],
          correctIndex: 0, explanation: { en: 'x', sw: 'y' },
        },
      ],
      sources: [],
    },
  ],
};

test('parseCurriculum groups lessons by track and preserves counts', () => {
  const c = parseCurriculum(fixture);
  assert.equal(c.lessons.length, 2);
  assert.equal(c.byTrack.swahili.length, 1);
  assert.equal(c.byTrack.german.length, 1);
  assert.equal(c.lessonCount, 2);
  assert.equal(c.questionCount, 3);
});

test('prepareQuestions shuffles option display but keeps one correct answer', () => {
  const c = parseCurriculum(fixture);
  const qs = prepareQuestions(c.byTrack.swahili[0], (() => { const s = [0.9, 0.1, 0.6, 0.4]; let i = 0; return () => s[i++ % s.length]; })());
  assert.equal(qs.length, 2);
  for (const q of qs) {
    assert.equal(new Set(q.options.map((o) => o.en)).size, q.options.length, 'options distinct');
    assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length, 'valid display index');
  }
});

test('correct option is always present and matches the original correctIndex', () => {
  const c = parseCurriculum(fixture);
  // deterministic reverse shuffle helper
  const reverseRng = (() => { let i = 0; return () => { i += 0.5; return 0; }; })();
  const lesson = c.byTrack.swahili[0];
  const qs = prepareQuestions(lesson);
  const originalSecond = lesson.questions[1]; // correctIndex 3 (option 'Z')
  const q1 = qs[1];
  assert.equal(q1.options[q1.correctIndex].en, 'Z', 'correct display option is the originally-correct one');
});

test('correct index is not always the first remaining position (learners cannot just pick first)', () => {
  const c = parseCurriculum(fixture);
  const qs = prepareQuestions(c.byTrack.swahili[0], () => 0.9); // strong bias pushes item not to 0
  const nonzero = qs.filter((q) => q.correctIndex !== 0);
  assert.ok(nonzero.length > 0, 'shuffle must not leave every correct answer first');
});

test('toQuizQuestions yields QuizSession-compatible plain questions', () => {
  const c = parseCurriculum(fixture);
  const qs = toQuizQuestions(c.byTrack.swahili[0], 'en');
  assert.equal(qs.length, 2);
  for (const q of qs) {
    assert.ok(q.id && q.prompt && q.explanation);
    assert.ok(Array.isArray(q.options) && q.options.includes(q.correct), 'correct among options');
  }
});

test('real curriculum file matches the spec (15 lessons / 45 four-option MCQs)', { skip: !existsSync('data/learning-curriculum.json') }, () => {
  const json = JSON.parse(readFileSync('data/learning-curriculum.json', 'utf8'));
  const c = parseCurriculum(json);
  assert.equal(c.lessonCount, 15);
  assert.equal(c.questionCount, 45);
  assert.equal(c.byTrack.swahili.length, 10); // 6 beginner + 4 history
  assert.equal(c.byTrack.german.length, 5); // 1 roadmap + 4 history
  for (const l of c.lessons) for (const q of l.questions) assert.ok(q.options.length >= 4, `question must have 4 options (${q.id})`);
});
