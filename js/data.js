// Carga del contenido diario (data/AAAA-MM-DD.json) que genera la tarea de las 7:15.

let indexCache;
const dayCache = new Map();

export async function loadIndex() {
  if (indexCache) return indexCache;
  const res = await fetch('data/index.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('No se pudo cargar el índice de datos.');
  indexCache = await res.json();
  return indexCache;
}

export async function loadDay(date) {
  if (dayCache.has(date)) return dayCache.get(date);
  const res = await fetch(`data/${date}.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`No hay datos para ${date}.`);
  const day = await res.json();
  dayCache.set(date, day);
  return day;
}

export async function loadLatest() {
  const index = await loadIndex();
  if (!index.latest) return null;
  return loadDay(index.latest);
}

export function resetCache() {
  indexCache = undefined;
  dayCache.clear();
}
