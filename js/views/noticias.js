import { loadIndex, loadDay } from '../data.js';
import { getSetting, setSetting } from '../db.js';
import { esc, safeUrl, formatDate, setHeader, SECTIONS } from '../util.js';

const state = { lang: null, section: 'all', date: null };

export async function render(root) {
  if (!state.lang) state.lang = await getSetting('newsLang', 'es');

  const index = await loadIndex();
  const dates = index.dates || [];
  if (!state.date || !dates.includes(state.date)) state.date = index.latest;

  if (!state.date) {
    setHeader('Noticias');
    root.innerHTML = '<div class="card empty">Todavía no hay noticias.</div>';
    return;
  }

  const day = await loadDay(state.date);
  const L = state.lang;
  setHeader(L === 'en' ? 'News' : 'Noticias', formatDate(day.date));

  const sectionsPresent = Object.keys(SECTIONS).filter((s) => (day.news || []).some((n) => n.section === s));
  const news = (day.news || []).filter((n) => state.section === 'all' || n.section === state.section);

  const html = [];

  if (day.is_sample) {
    html.push(`<div class="banner" style="margin-bottom:12px">⚠️ <span>Datos de ejemplo hasta que la tarea de las 7:15 empiece a escribir aquí.</span></div>`);
  }

  html.push(`
    <div class="toolbar">
      <div class="segmented" role="group" aria-label="Idioma">
        <button data-lang="es" aria-pressed="${L === 'es'}">Español</button>
        <button data-lang="en" aria-pressed="${L === 'en'}">English</button>
      </div>
      ${dates.length > 1 ? `
        <select class="btn" data-date aria-label="Día" style="padding:8px 10px">
          ${dates.map((d) => `<option value="${esc(d)}" ${d === state.date ? 'selected' : ''}>${esc(formatDate(d, { day: 'numeric', month: 'short' }))}</option>`).join('')}
        </select>` : ''}
    </div>`);

  html.push(`
    <div class="card hero" style="margin-top:14px">
      <span class="subtle">${L === 'en' ? 'Headline of the day' : 'Titular del día'}</span>
      <h2>${esc(day.headline?.[L])}</h2>
    </div>`);

  if (L === 'en') {
    html.push(`<p class="subtle" style="margin:10px 2px 0">💡 Muy pronto: toca una palabra o selecciona una frase para ver su traducción.</p>`);
  }

  html.push(`
    <div class="chips" style="margin-top:16px" role="group" aria-label="Secciones">
      <button class="chip" data-section="all" aria-pressed="${state.section === 'all'}">${L === 'en' ? 'All' : 'Todo'}</button>
      ${sectionsPresent.map((s) => `<button class="chip" data-section="${s}" aria-pressed="${state.section === s}">${SECTIONS[s].icon} ${esc(SECTIONS[s][L])}</button>`).join('')}
    </div>`);

  const groups = sectionsPresent.filter((s) => state.section === 'all' || s === state.section);
  for (const s of groups) {
    const items = news.filter((n) => n.section === s);
    if (!items.length) continue;
    html.push(`<div class="news-section-head"><span>${SECTIONS[s].icon}</span><h2>${esc(SECTIONS[s][L])}</h2></div>`);
    html.push(`<div class="stack" lang="${L}">${items.map((n) => `
      <article class="card news-item">
        <h3>${esc(n.title?.[L])}</h3>
        <p>${esc(n.body?.[L])}</p>
        ${n.why_it_matters?.[L] ? `<p class="why">${esc(n.why_it_matters[L])}</p>` : ''}
        ${n.source?.url ? `<p class="source"><a href="${esc(safeUrl(n.source.url))}" target="_blank" rel="noopener">${esc(n.source.name || 'Fuente')} ↗</a></p>` : ''}
      </article>`).join('')}</div>`);
  }

  if (state.section === 'all' && (day.watch_today || []).length) {
    html.push(`<div class="news-section-head"><span>📅</span><h2>${L === 'en' ? 'What to watch today' : 'Qué vigilar hoy'}</h2></div>`);
    html.push(`<div class="card"><ul class="watch">${day.watch_today.map((w) => `<li>${esc(w[L])}</li>`).join('')}</ul></div>`);
  }

  root.innerHTML = html.join('');

  root.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', async () => {
    state.lang = b.dataset.lang;
    await setSetting('newsLang', state.lang);
    render(root);
  }));
  root.querySelectorAll('[data-section]').forEach((b) => b.addEventListener('click', () => {
    state.section = b.dataset.section;
    render(root);
  }));
  root.querySelector('[data-date]')?.addEventListener('change', (e) => {
    state.date = e.target.value;
    render(root);
  });
}
