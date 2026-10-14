// Audio integration contract: a shared manifest that maps the EXACT German text
// to a relative MP3 URL (data/audio-manifest.json, produced by the parent).
//
// Rules:
//   - Lookups are exact and trimmed (text.trim()).
//   - When audio for a piece of text is missing, the UI must show an honest
//     "audio unavailable" state — never a fake control and never synthesized
//     speech (Swahili is deliberately not supported by the voice model).
//   - parseAudioManifest tolerates both a flat {text: url} map and a map nested
//     by language { de: {...}, sw: {...} } so the reader stays integration-ready.

export function parseAudioManifest(obj) {
  const map = new Map();
  function add(k, v) {
    if (typeof k !== 'string' || typeof v !== 'string') return;
    const key = k.trim();
    if (key) map.set(key, v);
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
        for (const [k2, v2] of Object.entries(v)) add(k2, v2); // nested per language
      } else {
        add(k, v);
      }
    }
  }
  return {
    loaded: true,
    size: map.size,
    hasText(text) { return map.has(String(text).trim()); },
    urlFor(text) { return map.get(String(text).trim()) || null; },
  };
}

export function emptyAudioManifest() {
  return { loaded: false, size: 0, hasText: () => false, urlFor: () => null };
}

export async function fetchAudioManifest(url) {
  try {
    const res = await fetch(url || 'data/audio-manifest.json');
    if (!res.ok) return emptyAudioManifest();
    const json = await res.json();
    return parseAudioManifest(json);
  } catch {
    return emptyAudioManifest();
  }
}

export default { parseAudioManifest, emptyAudioManifest, fetchAudioManifest };
