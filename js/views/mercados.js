import { loadLatest } from '../data.js';
import { esc, setHeader } from '../util.js';
import { soonCard } from './soon.js';

export async function render(root) {
  setHeader('Mercados', 'Cartera y bolsa');
  const day = await loadLatest().catch(() => null);
  const m = day?.markets;
  const html = [];

  if (m) {
    if (day.is_sample) html.push(`<div class="banner" style="margin-bottom:12px">⚠️ <span>Comentario de ejemplo.</span></div>`);
    if (m.summary?.es) {
      html.push(`<div class="section-title"><span>Qué ha pasado</span></div>`);
      html.push(`<div class="card"><p>${esc(m.summary.es)}</p></div>`);
    }
    if (m.learn?.concept) {
      html.push(`<div class="section-title"><span>Aprende</span></div>`);
      html.push(`<div class="card card--accent"><h3>${esc(m.learn.concept)}</h3><p style="margin-top:6px">${esc(m.learn.explanation)}</p></div>`);
    }
    html.push(`<p class="subtle" style="margin:12px 2px">Contenido educativo, no es asesoramiento financiero.</p>`);
  }

  html.push(`<div style="margin-top:14px">${soonCard(4, 'Tu cartera y los mercados', [
    'Añadir tus acciones y fondos con cantidad y precio de compra',
    'Valor, rentabilidad del día y total, gráfico de evolución y reparto',
    'Índices (IBEX 35, S&P 500, Nasdaq…), divisas, petróleo, oro y bitcoin',
    'Noticias y opiniones de expertos sobre lo tuyo y lo que no tienes',
  ])}</div>`);

  root.innerHTML = html.join('');
}
