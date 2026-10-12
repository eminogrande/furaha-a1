// Progress tracking on top of the safe storage wrapper.

import { createStorage } from './storage.js';

const KEY = 'furaha.progress';

export function createProgress(backend) {
  const store = createStorage(backend);

  function load() {
    const data = store.get(KEY, null);
    if (!data || !Array.isArray(data.records)) return { records: [] };
    return data;
  }

  function save(data) {
    store.set(KEY, data);
  }

  function record(type, topic, date) {
    const data = load();
    data.records.push({
      type,
      topic,
      date: date || new Date().toISOString().slice(0, 10),
    });
    save(data);
  }

  function stats() {
    const data = load();
    const byType = {};
    let lastDate = null;
    for (const r of data.records) {
      byType[r.type] = (byType[r.type] || 0) + 1;
      if (!lastDate || r.date > lastDate) lastDate = r.date;
    }
    return { total: data.records.length, byType, lastDate };
  }

  function reset() {
    save({ records: [] });
  }

  return { record, stats, reset };
}

export default createProgress;
