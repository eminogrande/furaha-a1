// Quiz engine: builds multiple-choice questions with nonduplicated options,
// checks answers with explanations, and supports retrying mistakes.

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build `count` questions. Each question asks for the meaning of a German word
// with 4 unique options drawn from the real vocabulary.
export function buildQuiz(words, count) {
  const pool = shuffle(words);
  const n = Math.min(count, pool.length);
  const questions = [];
  for (let i = 0; i < n; i++) {
    const target = pool[i];
    const distractors = shuffle(pool.filter((w) => w.id !== target.id)).slice(0, 3);
    const options = shuffle([target, ...distractors]).map((w) => w.de);
    const correct = target.de;
    questions.push({
      id: target.id,
      prompt: `What does "${target.de}" mean?`,
      options,
      correct,
      explanation: `${target.de} = ${target.en} (${target.sw}). ${target.example.de}`,
    });
  }
  return questions;
}

export function checkAnswer(question, chosen) {
  const correct = chosen === question.correct;
  return { correct, explanation: question.explanation };
}

export class QuizSession {
  constructor(questions) {
    this.questions = questions;
    this.answered = 0;
    this.score = 0;
    this.mistakes = [];
    this._seen = new Set();
  }

  get total() {
    return this.questions.length;
  }

  answer(question, chosen) {
    if (!this.questions.some((q) => q.id === question.id)) return null;
    if (this._seen.has(question.id)) return null;
    this._seen.add(question.id);
    this.answered += 1;
    const r = checkAnswer(question, chosen);
    if (r.correct) {
      this.score += 1;
      this.mistakes = this.mistakes.filter((m) => m.id !== question.id);
    } else {
      this.mistakes.push(question);
    }
    return r;
  }

  retryQuiz() {
    // allow the mistake items to be answered again
    for (const m of this.mistakes) this._seen.delete(m.id);
    return this.mistakes.slice();
  }
}

export default { buildQuiz, checkAnswer, QuizSession };
