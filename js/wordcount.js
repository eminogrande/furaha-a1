// Word counter for the writing exercise. Counts whitespace-separated tokens.

export function countWords(text) {
  if (!text) return 0;
  const trimmed = String(text).trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export default countWords;
