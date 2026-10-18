import { loadLatest } from '../data.js';
import { all, put } from '../db.js';
import { esc, safeUrl, setHeader, REC_TYPES } from '../util.js';

const state = { lang: 'all', type: 'all' };

export async function render(root) {
  setHeader('Escuchar y leer', 'Recomendaciones gratuitas');

  const day = await loadLatest().catch(() => null);
  const recs = day?.recommendations || [];
  const status = Object.fromEntries((await all('recs')).map((r) => [r.id, r.status]));

  const list = recs.filter((r) =>
    (state.lang === 'all' || r.language === state.lang) &&
    (state.type === 'all' || r.type === state.type));

  const chip = (group, value, label) =>
    `<button class="chip" data-${group}="${value}" aria-pressed="${state[group] === value}">${label}</button>`;

  root.innerHTML = `
    ${day?.is_sample ? `<div class="banner" style="margin-bottom:12px">⚠️ <span>Recomendaciones de ejemplo. Las reales llegarán con la tarea diaria.</span></div>` : ''}
    <div class="chips">
      ${chip('lang', 'all', 'Todos los idiomas')}${chip('lang', 'es', '🇪🇸 Español')}${chip('lang', 'en', '🇬🇧 Inglés')}
    </div>
    <div class="chips">
      ${chip('type', 'all', 'Todo')}${chip('type', 'podcast', 'Podcasts')}${chip('type', 'video', 'Vídeos')}${chip('type', 'article', 'Artículos')}
    </div>
    <div class="stack" style="margin-top:10px">
      ${list.length ? list.map((r) => card(r, status[r.id])).join('') : '<div class="card empty">No hay recomendaciones con estos filtros.</div>'}
    </div>`;

  root.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => { state.lang = b.dataset.lang; render(root); }));
  root.querySelectorAll('[data-type]').forEach((b) => b.addEventListener('click', () => { state.type = b.dataset.type; render(root); }));
  root.querySelectorAll('[data-mark]').forEach((b) => b.addEventListener('click', async () => {
    const current = status[b.dataset.id];
    const next = current === b.dataset.mark ? null : b.dataset.mark;
    await put('recs', { id: b.dataset.id, status: next, updatedAt: Date.now() });
    render(root);
  }));
}

function card(r, st) {
  const mins = r.duration_min ? ` · ${r.duration_min} min` : '';
  return `
    <article class="card rec" style="${st === 'done' ? 'opacity:.6' : ''}">
      <div class="meta">
        <span class="tag">${esc(REC_TYPES[r.type] ?? r.type)}</span>
        <span class="tag">${r.language === 'en' ? 'Inglés' : 'Español'}</span>
        ${(r.topics || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}
      </div>
      <h3>${esc(r.title)}</h3>
      <p class="who">${esc(r.speaker)} · ${esc(r.outlet)}${mins}</p>
      <p>${esc(r.summary)}</p>
      ${r.why ? `<p class="muted" style="margin-top:8px"><strong>Por qué merece la pena:</strong> ${esc(r.why)}</p>` : ''}
      <div class="actions">
        <a class="btn btn--primary" href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener">Abrir</a>
        <button class="btn" data-mark="later" data-id="${esc(r.id)}" aria-pressed="${st === 'later'}">${st === 'later' ? '★ Pendiente' : '☆ Pendiente'}</button>
        <button class="btn" data-mark="done" data-id="${esc(r.id)}" aria-pressed="${st === 'done'}">${st === 'done' ? '✓ Visto' : 'Visto'}</button>
      </div>
    </article>`;
}
