# Mi Panel

App personal instalable en el móvil (PWA): noticias en español e inglés, recomendaciones de podcasts y vídeos, mercados y cartera, finanzas personales y ocio.

- **Sin servidor y sin coste**: es una web estática publicada con GitHub Pages.
- **Contenido diario**: lo escribe cada mañana una tarea programada de Claude en `data/` (formato en [`data/SCHEMA.md`](data/SCHEMA.md)).
- **Tus datos personales** (cartera, gastos, vocabulario, listas) se guardan solo en tu dispositivo (IndexedDB). Haz copias desde *Ajustes → Exportar*.

## Estructura

```
index.html            página principal
manifest.webmanifest  datos para instalarla como app
sw.js                 funcionamiento sin conexión
css/app.css           estilos (tema claro y oscuro)
js/app.js             arranque y navegación
js/db.js              almacenamiento local y copias de seguridad
js/data.js            lectura de los datos diarios
js/views/*.js         una vista por pestaña
data/                 contenido diario (lo genera la tarea)
icons/                iconos de la app
```

## Probar en el ordenador

```bash
python3 -m http.server 8000
```

Y abre http://localhost:8000

## Fases

1. ✅ Base: navegación, tema, almacenamiento, copias, noticias ES/EN, recomendaciones
2. Inglés interactivo: tocar palabra / seleccionar frase, vocabulario y repaso
3. Mis finanzas: gastos, presupuesto, interés compuesto, inflación, objetivos
4. Cartera y mercados con precios reales
5. Ocio: películas y libros
6. Chat con IA en cada pestaña
7. Pulido final

Al cambiar archivos de la app, sube `CACHE_VERSION` en `sw.js` para que el móvil descargue la versión nueva.
