// Safe localStorage wrapper. Never throws; gracefully degrades when storage
// is unavailable or contains corrupt JSON. All values are JSON-serialized.

export function createStorage(backend) {
  const b = backend || (typeof localStorage !== 'undefined' ? localStorage : null);

  function isAvailable() {
    if (!b) return false;
    try {
      b.getItem('__furaha_probe__');
      return true;
    } catch {
      return false;
    }
  }

  function get(key, fallback) {
    if (!b) return fallback;
    try {
      const raw = b.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function set(key, value) {
    if (!b) return;
    try {
      b.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or denied — ignore, app keeps working in-memory
    }
  }

  function remove(key) {
    if (!b) return;
    try {
      b.removeItem(key);
    } catch {
      // ignore
    }
  }

  return { get, set, remove, isAvailable };
}

export default createStorage;
