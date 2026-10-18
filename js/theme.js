import { getSetting } from './db.js';

// theme: 'system' | 'light' | 'dark'
export async function applyTheme(theme) {
  const t = theme ?? (await getSetting('theme', 'system'));
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}
