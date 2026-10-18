import { getSetting, setSetting, exportAll, importAll, wipeAll, counts } from '../db.js';
import { applyTheme } from '../theme.js';
import { esc, setHeader, toast, downloadJSON, todayISO } from '../util.js';
import { resetCache } from '../data.js';

const APP_VERSION = '0.1.0';

export async function render(root) {
  setHeader('Ajustes');

  const theme = await getSetting('theme', 'system');
  const newsLang = await getSetting('newsLang', 'es');
  const c = await counts();
  const total = Object.entries(c).filter(([k]) => k !== 'settings').reduce((a, [, v]) => a + v, 0);
  let persisted = false;
  try { persisted = await navigator.storage?.persisted?.(); } catch { /* sin soporte */ }

  const seg = (name, value, label, current) =>
    `<button data-${name}="${value}" aria-pressed="${current === value}">${label}</button>`;

  root.innerHTML = `
    <div class="section-title"><span>Apariencia</span></div>
    <div class="card">
      <div class="row">
        <div class="label"><strong>Tema</strong></div>
        <div class="segmented">
          ${seg('theme', 'system', 'Auto', theme)}${seg('theme', 'light', 'Claro', theme)}${seg('theme', 'dark', 'Oscuro', theme)}
        </div>
      </div>
      <div class="row">
        <div class="label"><strong>Noticias por defecto</strong></div>
        <div class="segmented">
          ${seg('lang', 'es', 'ES', newsLang)}${seg('lang', 'en', 'EN', newsLang)}
        </div>
      </div>
    </div>

    <div class="section-title"><span>Tus datos</span></div>
    <div class="card">
      <p class="muted">Tus datos (cartera, gastos, vocabulario, listas…) se guardan <strong>solo en este dispositivo</strong>. Haz una copia de vez en cuando y guárdala en iCloud o Drive.</p>
      <p class="subtle" style="margin-top:8px">${total} registros guardados · ${persisted ? 'almacenamiento protegido ✓' : 'almacenamiento normal'}</p>
      <div class="stack" style="margin-top:14px">
        <button class="btn btn--primary btn--block" data-action="export">Exportar copia de seguridad</button>
        <label class="btn btn--block">
          Importar copia de seguridad
          <input type="file" accept="application/json,.json" data-action="import" hidden>
        </label>
      </div>
    </div>

    <div class="section-title"><span>App</span></div>
    <div class="card">
      <div class="row">
        <div class="label"><strong>Buscar actualización</strong><span class="subtle">Recarga la app y los datos del día</span></div>
        <button class="btn" data-action="update">Actualizar</button>
      </div>
      <div class="row">
        <div class="label"><strong>Instalar en el iPhone</strong><span class="subtle">Safari → Compartir → Añadir a pantalla de inicio</span></div>
      </div>
      <div class="row">
        <div class="label"><strong>Versión</strong></div>
        <span class="subtle">${esc(APP_VERSION)}</span>
      </div>
    </div>

    <div class="section-title"><span>Zona peligrosa</span></div>
    <div class="card">
      <button class="btn btn--danger btn--block" data-action="wipe">Borrar todos mis datos de este dispositivo</button>
    </div>`;

  root.querySelectorAll('[data-theme]').forEach((b) => b.addEventListener('click', async () => {
    await setSetting('theme', b.dataset.theme);
    await applyTheme(b.dataset.theme);
    render(root);
  }));

  root.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', async () => {
    await setSetting('newsLang', b.dataset.lang);
    render(root);
  }));

  root.querySelector('[data-action="export"]').addEventListener('click', async () => {
    downloadJSON(await exportAll(), `mi-panel-copia-${todayISO()}.json`);
    toast('Copia descargada');
  });

  root.querySelector('[data-action="import"]').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!confirm('Esto sustituirá los datos actuales de este dispositivo por los de la copia. ¿Continuar?')) return;
      const n = await importAll(data);
      await applyTheme();
      toast(`Copia restaurada (${n} registros)`);
      render(root);
    } catch (err) {
      toast(err.message || 'No se pudo importar el archivo');
    } finally {
      e.target.value = '';
    }
  });

  root.querySelector('[data-action="update"]').addEventListener('click', async () => {
    resetCache();
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      await reg?.update();
    } catch { /* sin service worker */ }
    location.reload();
  });

  root.querySelector('[data-action="wipe"]').addEventListener('click', async () => {
    if (!confirm('¿Seguro? Se borrarán todos tus datos de este dispositivo. Haz antes una copia si la quieres conservar.')) return;
    await wipeAll();
    await applyTheme('system');
    toast('Datos borrados');
    render(root);
  });
}
