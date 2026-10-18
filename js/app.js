// Arranque de la app y navegación entre pestañas.
import { requestPersistence } from './db.js';
import { applyTheme } from './theme.js';
import * as inicio from './views/inicio.js';
import * as noticias from './views/noticias.js';
import * as escuchar from './views/escuchar.js';
import * as mercados from './views/mercados.js';
import * as finanzas from './views/finanzas.js';
import * as ocio from './views/ocio.js';
import * as ajustes from './views/ajustes.js';

const ROUTES = { inicio, noticias, escuchar, mercados, finanzas, ocio, ajustes };
const DEFAULT_ROUTE = 'inicio';

const view = document.getElementById('view');
let renderToken = 0;

function currentRoute() {
  const name = location.hash.replace(/^#\/?/, '').split(/[/?]/)[0];
  return ROUTES[name] ? name : DEFAULT_ROUTE;
}

async function render() {
  const name = currentRoute();
  const token = ++renderToken;

  document.querySelectorAll('.tabbar a').forEach((a) => {
    a.classList.toggle('is-active', a.dataset.tab === name);
    if (a.dataset.tab === name) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  view.innerHTML = '<div class="skeleton"></div>';
  window.scrollTo(0, 0);

  try {
    const container = document.createElement('div');
    await ROUTES[name].render(container);
    if (token !== renderToken) return; // el usuario ya cambió de pestaña
    view.replaceChildren(container);
  } catch (err) {
    console.error(err);
    if (token !== renderToken) return;
    view.innerHTML = `<div class="card empty">Algo ha fallado al cargar esta sección.<br><span class="subtle">${String(err.message || err).replace(/</g, '&lt;')}</span></div>`;
  }
}

function onScroll() {
  document.querySelector('.topbar').classList.toggle('is-scrolled', window.scrollY > 4);
}

async function start() {
  await applyTheme();
  window.addEventListener('hashchange', render);
  window.addEventListener('scroll', onScroll, { passive: true });
  if (!location.hash) history.replaceState(null, '', `#/${DEFAULT_ROUTE}`);
  render();
  requestPersistence();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW no registrado', e));
  }
}

start();
