// Daily study path: a short, deterministic-per-day sequence of activities.

const ACTIVITY_TYPES = ['vocab', 'quiz', 'grammar', 'reading', 'writing', 'speaking'];

function hashDay(day) {
  let h = 0;
  const s = String(day || '');
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function buildDailyPath(day) {
  const seed = hashDay(day || new Date().toISOString().slice(0, 10));
  const start = seed % ACTIVITY_TYPES.length;
  const steps = [];
  for (let i = 0; i < 4; i++) {
    const type = ACTIVITY_TYPES[(start + i) % ACTIVITY_TYPES.length];
    steps.push({
      id: `${day || 'today'}-${type}-${i}`,
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    });
  }
  return steps;
}

export function isPathDone(path, completedIds) {
  return path.every((s) => completedIds.has(s.id));
}

export default { buildDailyPath, isPathDone };
