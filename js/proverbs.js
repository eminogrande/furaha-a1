// Proverbs logic (pure, no DOM): filtering, search and a meaning-matching quiz.
// The quiz reuses the shared quiz session engine (js/quiz.js) for feedback
// and retry; options here are the proverb MEANINGS, so a learner matches a
// phrase to what it means rather than identifying the phrase itself.

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function filterProverbs(list, type) {
  if (!type || type === 'all') return list;
  return list.filter((p) => p.type === type);
}

export function searchProverbs(list, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return list;
  return list.filter((p) => {
    const haystack = [
      p.phrase, p.literal || '', p.en || '', p.sw || '', p.de || '',
      p.example ? p.example.de : '', p.example ? p.example.en : '', p.example ? p.example.sw : '',
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

// Build `count` meaning-matching questions. Each question quotes a proverb and
// offers 4 unique MEANINGS (EN) drawn from the real collection.
export function buildProverbQuiz(list, count) {
  const pool = shuffle(list.slice());
  const n = Math.min(count, pool.length);
  const questions = [];
  for (let i = 0; i < n; i++) {
    const target = pool[i];
    const otherMeanings = shuffle(list
      .filter((p) => p.id !== target.id)
      .map((p) => p.en)
      .filter((m) => m && m !== target.en));
    const distractors = [...new Set(otherMeanings)].slice(0, 3);
    const options = shuffle([target.en, ...distractors]);
    questions.push({
      id: target.id,
      prompt: `What does "${target.phrase}" mean?`,
      options,
      correct: target.en,
      explanation: `${target.phrase} = ${target.en} (${target.sw}).`,
    });
  }
  return questions;
}

export default { filterProverbs, searchProverbs, buildProverbQuiz };
