// Per-item, per-track review model. Persisted in localStorage.
//
// Honest-progress rules enforced here:
//   - Objective checks (vocab/grammar/reading/proverb/listening/curriculum) record
//     real attempts & correct answers. Self-reported flashcard familiarity is stored
//     SEPARATELY and never counts toward objective correctness ("no fake mastery").
//   - A flashcard "Got it" can set self-reported familiarity but cannot clear an
//     objective "weak" flag — only answering correctly can.
//   - Daily activity counts distinct items attempted that day, so a step is only
//     "done" after a real attempt (never from merely opening the screen).

import { createStorage } from './storage.js';

const KEY = 'furaha.review';
const TRACKS = { de: 'de', german: 'de', furaha: 'de', sw: 'sw', swahili: 'sw', emin: 'sw' };

function pad(n) { return String(n).padStart(2, '0'); }

export function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function todayStr(now) {
  if (now) return now;
  return new Date().toISOString().slice(0, 10);
}

function empty() {
  return { de: { items: {}, days: {} }, sw: { items: {}, days: {} } };
}

export function createReview(backend) {
  const store = createStorage(backend);

  function load() {
    const data = store.get(KEY, null);
    if (!data || typeof data !== 'object') return empty();
    return {
      de: { items: (data.de && data.de.items) || {}, days: (data.de && data.de.days) || {} },
      sw: { items: (data.sw && data.sw.items) || {}, days: (data.sw && data.sw.days) || {} },
    };
  }

  // Operate on a track's live object, then save it back. Avoids mutating a stale copy.
  function update(t, fn) {
    const d = load();
    const tr = d[track(t)];
    const result = fn(tr);
    save(d);
    return result;
  }

  function save(d) { store.set(KEY, d); }

  function track(t) { return TRACKS[t || ''] || 'de'; }

  const freshEntry = () => ({ type: 'v', attempts: 0, correct: 0, weak: false, selfFam: false, flashAgain: 0, flashGotIt: 0, due: null, last: null });

  function get(t, key) {
    return update(t, (tr) => tr.items[key] || null); // load+return; harmless write
  }

  function setEntry(t, key, mutator) {
    return update(t, (tr) => {
      if (!tr.items[key]) tr.items[key] = freshEntry();
      const e = tr.items[key];
      mutator(e);
      return e;
    });
  }

  function bumpDay(t, type, key, today) {
    update(t, (tr) => {
      if (!tr.days[today]) tr.days[today] = {};
      if (!tr.days[today][type]) tr.days[today][type] = {};
      tr.days[today][type][key] = (tr.days[today][type][key] || 0) + 1;
    });
  }

  function recordCheck(t, type, key, correct, now) {
    const today = todayStr(now);
    const e = setEntry(t, key, (en) => {
      en.type = type;
      en.attempts += 1;
      en.last = today;
      if (correct) {
        en.correct += 1;
        en.weak = false;
        en.due = addDays(today, 3);
      } else {
        en.weak = true;
        en.due = today;
      }
    });
    bumpDay(t, type, key, today);
    return e;
  }

  // Writing/speaking self-practice: counts toward the daily step but is NOT an
  // objective answer, so it sets no correctness and no mastery.
  function recordPractice(t, type, key, now) {
    const today = todayStr(now);
    setEntry(t, key, (en) => {
      en.type = type;
      en.last = today;
      if (!en.attempts) en.due = addDays(today, 3); // gentle next review cue
    });
    bumpDay(t, type, key, today);
  }

  function recordFlash(t, key, verdict, now) {
    const today = todayStr(now);
    setEntry(t, key, (en) => {
      en.last = today;
      if (verdict === 'again') {
        en.flashAgain += 1;
        en.due = addDays(today, 1);
      } else if (verdict === 'gotit') {
        en.flashGotIt += 1;
        en.selfFam = true;
        en.due = addDays(today, 4);
      }
    });
    bumpDay(t, 'flash', key, today);
  }

  function isWeak(t, key) {
    const e = load()[track(t)].items[key];
    return !!e && !!e.weak;
  }
  function isDue(t, key, now) {
    const e = load()[track(t)].items[key];
    return !!e && !!e.due && e.due <= todayStr(now);
  }
  function hasAttempt(t, key) {
    const e = load()[track(t)].items[key];
    return !!e && e.attempts > 0;
  }

  function dueKeys(t, now) {
    const today = todayStr(now);
    const items = load()[track(t)].items;
    return Object.keys(items).filter((k) => items[k].due && items[k].due <= today);
  }

  function weakKeys(t) {
    const items = load()[track(t)].items;
    return Object.keys(items).filter((k) => items[k].weak);
  }

  // Order: due -> weak (not yet due) -> new (no objective attempt) -> rest. Deduped.
  function buildFlashQueue(t, poolIds, now, size) {
    const today = todayStr(now);
    const due = poolIds.filter((id) => isDue(t, id, today));
    const weak = poolIds.filter((id) => !due.includes(id) && isWeak(t, id));
    const fresh = poolIds.filter((id) => !due.includes(id) && !weak.includes(id) && !hasAttempt(t, id));
    const rest = poolIds.filter((id) => !due.includes(id) && !weak.includes(id) && !fresh.includes(id));
    const seen = new Set();
    const out = [];
    for (const id of [...due, ...weak, ...fresh, ...rest]) {
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }
    return typeof size === 'number' ? out.slice(0, size) : out;
  }

  function activityCount(t, type, now) {
    const today = todayStr(now);
    const day = load()[track(t)].days[today] || {};
    return Object.keys(day[type] || {}).length;
  }

  function isActivityDone(t, type, now, threshold = 1) {
    return activityCount(t, type, now) >= threshold;
  }

  function stats(t, now) {
    const today = todayStr(now);
    const items = load()[track(t)].items;
    const keys = Object.keys(items).filter((k) => items[k].attempts > 0);
    const objectiveCorrect = keys.filter((k) => !items[k].weak).length;
    const weak = keys.filter((k) => items[k].weak).length;
    const dueToday = Object.keys(items).filter((k) => items[k].due && items[k].due <= today).length;
    const familiar = Object.keys(items).filter((k) => items[k].selfFam && items[k].attempts === 0).length;
    return {
      objective: { attempts: keys.length, correct: objectiveCorrect },
      weak,
      dueToday,
      flash: { familiar },
    };
  }

  function reset() { save(empty()); }

  return {
    track, get, recordCheck, recordPractice, recordFlash,
    isWeak, isDue, hasAttempt, dueKeys, weakKeys, buildFlashQueue,
    activityCount, isActivityDone, stats, reset, addDays,
  };
}

export default createReview;
