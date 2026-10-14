// Curriculum loader + question builder. Reads data/learning-curriculum.json
// (bilingual lessons) without hard-coding the file itself, so it stays ready for
// the parent's content, and renders exercises defensively if the file is absent.
//
// Schema (supplied by parent):
//   { meta, lessons: [{ id, track:'german'|'swahili', type:'language'|'history'|'roadmap',
//       title:{en,sw}, body:{en,sw}, phrases:[{de?,sw,en}],
//       questions:[{prompt:{en,sw}, options:[{en,sw}], correctIndex, explanation:{en,sw}}],
//       sources:[{title,url}] }] }
//
// Key rule: option display is SHUFFLED while preserving which one is correct, so a
// learner cannot exploit the source's frequent correctIndex===0 and always pick first.

function defaultRng() { return Math.random(); }

export function shuffle(arr, rng) {
  const a = arr.slice();
  const r = rng || defaultRng;
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function parseCurriculum(json) {
  const lessons = [];
  const byTrack = { german: [], swahili: [] };
  const list = (json && Array.isArray(json.lessons)) ? json.lessons : [];
  for (const raw of list) {
    if (!raw || !raw.id) continue;
    const lesson = {
      id: raw.id,
      track: raw.track === 'swahili' ? 'swahili' : 'german',
      type: raw.type || 'language',
      title: raw.title || { en: '', sw: '' },
      body: raw.body || { en: '', sw: '' },
      phrases: Array.isArray(raw.phrases) ? raw.phrases : [],
      questions: (Array.isArray(raw.questions) ? raw.questions : []).map((q, i) => ({
        id: `${raw.id}-q${i}`,
        prompt: q.prompt || { en: '', sw: '' },
        options: Array.isArray(q.options) ? q.options : [],
        correctIndex: Number.isInteger(q.correctIndex) ? q.correctIndex : 0,
        explanation: q.explanation || { en: '', sw: '' },
      })),
      sources: Array.isArray(raw.sources) ? raw.sources : [],
    };
    lessons.push(lesson);
    if (byTrack[lesson.track]) byTrack[lesson.track].push(lesson);
  }
  return {
    meta: (json && json.meta) || null,
    lessons,
    byTrack,
    lessonCount: lessons.length,
    questionCount: lessons.reduce((n, l) => n + l.questions.length, 0),
  };
}

// Return quiz questions with a shuffled, de-duplicated option display and the
// correct answer located at `.correctIndex` in that display order.
export function prepareQuestions(lesson, rng) {
  const r = rng || defaultRng;
  return lesson.questions.map((q) => {
    const idxs = q.options.map((_, i) => i);
    const order = shuffle(idxs, r);
    const correctDisplay = order.indexOf(q.correctIndex);
    return {
      id: q.id,
      prompt: q.prompt,
      options: order.map((i) => q.options[i]),
      correctIndex: correctDisplay,
      explanation: q.explanation,
    };
  });
}

// Produce QuizSession-compatible plain questions (string options in a chosen
// interface language), so the shared quiz engine gives feedback + retry.
export function toQuizQuestions(lesson, lang, rng) {
  const parts = prepareQuestions(lesson, rng);
  return parts.map((q) => {
    const correctOpt = q.options[q.correctIndex];
    return {
      id: q.id,
      prompt: (q.prompt && q.prompt[lang]) || '',
      options: q.options.map((o) => (o && o[lang]) || ''),
      correct: (correctOpt && correctOpt[lang]) || '',
      explanation: (q.explanation && q.explanation[lang]) || '',
    };
  });
}

export function lessonLabel(lang) { return lang === 'sw' ? 'sw' : 'en'; }

export default parseCurriculum;
