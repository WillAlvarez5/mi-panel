// Almacenamiento local en el dispositivo (IndexedDB).
// Tus datos personales NUNCA se suben al repositorio: viven solo en el móvil.

const DB_NAME = 'mi-panel';
const DB_VERSION = 1;

// Un "almacén" por tipo de dato. Todos usan `id` como clave.
export const STORES = [
  'settings',      // ajustes (tema, idioma, claves de API…)
  'portfolio',     // posiciones de la cartera
  'transactions',  // ingresos y gastos
  'goals',         // objetivos de ahorro
  'vocab',         // palabras y frases de inglés guardadas
  'media',         // películas y libros
  'recs',          // estado de recomendaciones (visto / pendiente)
  'chats',         // historial de chats por pestaña
];

let dbPromise;

function open() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function done(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function all(store) {
  const db = await open();
  return done(db.transaction(store).objectStore(store).getAll());
}

export async function get(store, id) {
  const db = await open();
  return done(db.transaction(store).objectStore(store).get(id));
}

export async function put(store, value) {
  const db = await open();
  const tx = db.transaction(store, 'readwrite');
  tx.objectStore(store).put(value);
  await txDone(tx);
  return value;
}

export async function remove(store, id) {
  const db = await open();
  const tx = db.transaction(store, 'readwrite');
  tx.objectStore(store).delete(id);
  await txDone(tx);
}

export async function clear(store) {
  const db = await open();
  const tx = db.transaction(store, 'readwrite');
  tx.objectStore(store).clear();
  await txDone(tx);
}

// ----- Ajustes -----
export async function getSetting(key, fallback = null) {
  const row = await get('settings', key);
  return row ? row.value : fallback;
}

export async function setSetting(key, value) {
  return put('settings', { id: key, value });
}

// ----- Copia de seguridad -----
export async function exportAll() {
  const data = {
    app: 'mi-panel',
    format: 1,
    exportedAt: new Date().toISOString(),
    stores: {},
  };
  for (const name of STORES) data.stores[name] = await all(name);
  return data;
}

export async function importAll(data) {
  if (!data || data.app !== 'mi-panel' || typeof data.stores !== 'object') {
    throw new Error('Este archivo no es una copia de seguridad de Mi Panel.');
  }
  const db = await open();
  const names = STORES.filter((n) => Array.isArray(data.stores[n]));
  const tx = db.transaction(names, 'readwrite');
  for (const name of names) {
    const store = tx.objectStore(name);
    store.clear();
    for (const row of data.stores[name]) {
      if (row && row.id !== undefined) store.put(row);
    }
  }
  await txDone(tx);
  return names.reduce((n, name) => n + data.stores[name].length, 0);
}

export async function wipeAll() {
  for (const name of STORES) await clear(name);
}

export async function counts() {
  const out = {};
  for (const name of STORES) out[name] = (await all(name)).length;
  return out;
}

// Pide al navegador que no borre los datos si falta espacio.
export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      if (await navigator.storage.persisted()) return true;
      return await navigator.storage.persist();
    }
  } catch { /* sin soporte */ }
  return false;
}

export function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
