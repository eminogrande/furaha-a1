// Listening comprehension quiz built from real vocabulary + the audio manifest.
// The learner listens (audio plays the German word) and picks the ENGLISH meaning.
// The meaning/transcript are hidden BEFORE answering — they only surface in the
// explanation after the chosen answer is submitted. Reuses the shared QuizSession
// engine so mistakes can be retried and feedback is consistent.

function shuffle(arr, rng) {
  const a = arr.slice();
  const r = rng || Math.random;
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildListeningQuiz(words, count, rng) {
  const pool = shuffle(words, rng);
  const n = Math.min(count, pool.length);
  const all = words;
  const out = [];
  for (let i = 0; i < n; i++) {
    const target = pool[i];
    const distractors = shuffle(all.filter((w) => w.id !== target.id), rng)
      .map((w) => w.en)
      .filter((en) => en !== target.en);
    const uniq = [...new Set(distractors)].slice(0, 3);
    const options = shuffle([target.en, ...uniq], rng);
    out.push({
      id: `list-${target.id}`,
      audioText: target.de, // played via the audio manifest (exact German text)
      options,
      correct: target.en,
      transcript: target.de, // revealed only after answering
      explanation: `${target.de} = ${target.en} (${target.sw}). ${target.example.de}`,
    });
  }
  return out;
}

export default { buildListeningQuiz };
