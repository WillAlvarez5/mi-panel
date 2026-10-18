// Utilidades compartidas.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// Escapa texto para meterlo en HTML de forma segura.
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
}

// Solo permite enlaces http(s); cualquier otra cosa se descarta.
export function safeUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : '#';
  } catch {
    return '#';
  }
}

export function formatDate(iso, opts = { weekday: 'long', day: 'numeric', month: 'long' }) {
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
  const s = d.toLocaleDateString('es-ES', opts);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 14) return 'Buenos días';
  if (h < 21) return 'Buenas tardes';
  return 'Buenas noches';
}

let toastTimer;
export function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
}

export function setHeader(heading, eyebrow = '') {
  document.getElementById('topbar-heading').textContent = heading;
  document.getElementById('topbar-eyebrow').textContent = eyebrow;
  document.title = heading === 'Mi Panel' ? 'Mi Panel' : `${heading} · Mi Panel`;
}

// Descarga un objeto como archivo JSON.
export function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const SECTIONS = {
  ia: { es: 'Inteligencia artificial', en: 'Artificial intelligence', icon: '🤖' },
  mundo: { es: 'Mundo', en: 'World', icon: '🌍' },
  espana: { es: 'España', en: 'Spain', icon: '🇪🇸' },
  energia: { es: 'Energía y redes', en: 'Energy & grids', icon: '⚡' },
  economia: { es: 'Economía y mercados', en: 'Economy & markets', icon: '📈' },
};

export const REC_TYPES = {
  podcast: 'Podcast',
  video: 'Vídeo',
  article: 'Artículo',
};
