// Vocabulary search and filtering (pure logic, no DOM).

export function filterVocab(words, { topic } = {}) {
  if (!topic || topic === 'all') return words;
  return words.filter((w) => w.topic === topic);
}

export function searchVocab(words, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return words;
  return words.filter((w) => {
    const haystack = [w.de, w.en, w.sw, w.article || ''].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

export default { filterVocab, searchVocab };
