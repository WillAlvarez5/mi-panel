import { loadLatest } from '../data.js';
import { esc, safeUrl, formatDate, greeting, setHeader, SECTIONS, REC_TYPES } from '../util.js';

const TILES = [
  { href: '#/noticias', title: 'Noticias', text: 'Español e inglés', icon: '<rect x="3" y="4" width="14" height="16" rx="2"/><path d="M17 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7M7 8h6M7 12h6M7 16h3"/>' },
  { href: '#/escuchar', title: 'Escuchar y leer', text: 'Podcasts y entrevistas', icon: '<path d="M3 15v-3a9 9 0 0 1 18 0v3"/><rect x="3" y="14" width="4.5" height="7" rx="1.5"/><rect x="16.5" y="14" width="4.5" height="7" rx="1.5"/>' },
  { href: '#/mercados', title: 'Mercados', text: 'Cartera y bolsa', icon: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>' },
  { href: '#/finanzas', title: 'Mis finanzas', text: 'Gastos y ahorro', icon: '<rect x="3" y="6" width="18" height="14" rx="2.5"/><path d="M3 10h18"/><circle cx="16.5" cy="15" r="1.2"/>' },
];

export async function render(root) {
  setHeader('Mi Panel', formatDate(new Date().toISOString()));

  let day = null;
  let error = null;
  try {
    day = await loadLatest();
  } catch (e) {
    error = e;
  }

  const parts = [];
  parts.push(`<p class="muted" style="margin:2px 2px 14px">${greeting()}, Guillermo.</p>`);

  if (day?.is_sample) {
    parts.push(`<div class="banner">⚠️ <span>Estás viendo <strong>datos de ejemplo</strong>. A partir de mañana la tarea de las 7:15 rellenará aquí las noticias reales.</span></div>`);
  }

  if (error || !day) {
    parts.push(`<div class="card empty">Todavía no hay contenido del día.</div>`);
  } else {
    parts.push(`
      <a class="card hero" href="#/noticias" style="display:block;color:inherit;margin-top:14px">
        <span class="subtle">Titular del día · ${esc(formatDate(day.date, { day: 'numeric', month: 'short' }))}</span>
        <h2>${esc(day.headline?.es)}</h2>
      </a>`);

    // Una noticia destacada de cada sección (máx. 3)
    const seen = new Set();
    const top = [];
    for (const n of day.news || []) {
      if (!seen.has(n.section)) { seen.add(n.section); top.push(n); }
      if (top.length === 3) break;
    }
    if (top.length) {
      parts.push(`<div class="section-title"><span>Lo más importante</span><a href="#/noticias">Ver todo</a></div>`);
      parts.push(`<div class="stack">${top.map((n) => `
        <a class="card card--flat news-item" href="#/noticias" style="color:inherit">
          <span class="tag">${SECTIONS[n.section]?.icon ?? ''} ${esc(SECTIONS[n.section]?.es ?? n.section)}</span>
          <h3>${esc(n.title?.es)}</h3>
          <p class="muted">${esc(n.body?.es)}</p>
        </a>`).join('')}</div>`);
    }

    const w = day.word_of_the_day;
    if (w) {
      parts.push(`<div class="section-title"><span>Palabra del día</span></div>`);
      parts.push(`
        <div class="card card--accent">
          <h3 class="serif" style="font-size:24px">${esc(w.term)} <span class="subtle" style="font-family:var(--font)">${esc(w.pos)}</span></h3>
          <p style="margin-top:4px"><strong>${esc(w.translation)}</strong></p>
          ${w.example_en ? `<p class="muted" style="margin-top:8px"><em>“${esc(w.example_en)}”</em></p>` : ''}
          ${w.example_es ? `<p class="subtle">${esc(w.example_es)}</p>` : ''}
        </div>`);
    }

    const rec = (day.recommendations || [])[0];
    if (rec) {
      parts.push(`<div class="section-title"><span>Para escuchar hoy</span><a href="#/escuchar">Más</a></div>`);
      parts.push(`
        <div class="card rec">
          <div class="meta"><span class="tag">${esc(REC_TYPES[rec.type] ?? rec.type)}</span><span class="tag">${rec.language === 'en' ? 'Inglés' : 'Español'}</span></div>
          <h3>${esc(rec.title)}</h3>
          <p class="who">${esc(rec.speaker)} · ${esc(rec.outlet)}</p>
          <p class="muted">${esc(rec.summary)}</p>
          <div class="actions"><a class="btn" href="${esc(safeUrl(rec.url))}" target="_blank" rel="noopener">Abrir</a></div>
        </div>`);
    }
  }

  parts.push(`<div class="section-title"><span>Secciones</span></div>`);
  parts.push(`<div class="grid-2">${TILES.map((t) => `
    <a class="tile" href="${t.href}">
      <svg viewBox="0 0 24 24" aria-hidden="true">${t.icon}</svg>
      <strong>${t.title}</strong><span>${t.text}</span>
    </a>`).join('')}</div>`);

  root.innerHTML = parts.join('');
}
