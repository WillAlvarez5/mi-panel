import { esc } from '../util.js';

export function soonCard(phase, title, items) {
  return `
    <div class="card soon">
      <span class="badge">Fase ${esc(phase)}</span>
      <h2>${esc(title)}</h2>
      <p class="muted">Esta sección está en construcción. Esto es lo que tendrá:</p>
      <ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>`;
}
