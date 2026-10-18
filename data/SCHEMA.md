# Formato de los datos diarios

Cada mañana la tarea programada de Claude escribe **un fichero por día** en esta carpeta y actualiza `index.json`. La app solo lee estos ficheros; no hay servidor.

## `data/index.json`

```json
{ "latest": "AAAA-MM-DD", "dates": ["AAAA-MM-DD", "..."] }
```

- `latest`: el día más reciente.
- `dates`: días disponibles, del más reciente al más antiguo (máximo 30; los más viejos se pueden borrar).

## `data/AAAA-MM-DD.json`

| Campo | Tipo | Descripción |
|---|---|---|
| `schema_version` | número | Siempre `1` por ahora. |
| `date` | `"AAAA-MM-DD"` | Fecha del repaso. |
| `generated_at` | ISO 8601 | Hora de generación. |
| `is_sample` | booleano | `true` solo en datos de ejemplo. Omitir o `false` en los reales. |
| `headline` | `{es, en}` | Titular del día (1-2 frases). |
| `news[]` | lista | Noticias (ver abajo). |
| `watch_today[]` | lista de `{es, en}` | 2-3 eventos a vigilar hoy. |
| `glossary[]` | lista | Palabras difíciles que aparecen en el texto en inglés: `{term, translation, pos, example}`. 25-40 por día. `term` en minúsculas, tal como aparece (incluye formas conjugadas). |
| `sentences[]` | lista de `{en, es}` | Traducción de cada frase de los `body` y `why_it_matters` en inglés. |
| `word_of_the_day` | objeto | `{term, pos, translation, definition_en, example_en, example_es}`. |
| `recommendations[]` | lista | Podcasts, vídeos y artículos gratuitos (ver abajo). |
| `markets` | objeto | `{summary: {es, en}, indices: [{name, value, change_pct}], learn: {concept, explanation}}`. |
| `leisure` | objeto | `{movies: [], books: []}` recomendaciones de ocio (se usará en la fase 5). |

### Noticia (`news[]`)

```json
{
  "id": "ia-1",
  "section": "ia | mundo | espana | energia | economia",
  "title": { "es": "…", "en": "…" },
  "body": { "es": "…", "en": "…" },
  "why_it_matters": { "es": "…", "en": "…" },
  "source": { "name": "Reuters", "url": "https://…" }
}
```

`why_it_matters` es opcional. Las versiones `es` y `en` cuentan la misma noticia.

### Recomendación (`recommendations[]`)

```json
{
  "id": "slug-unico-estable",
  "type": "podcast | video | article",
  "title": "…",
  "speaker": "Quién habla",
  "outlet": "Medio o canal",
  "duration_min": 45,
  "language": "es | en",
  "topics": ["energía", "IA"],
  "summary": "2-3 líneas en español",
  "why": "Por qué merece la pena",
  "url": "https://… (acceso gratuito)"
}
```

`id` debe ser estable (el mismo contenido, el mismo id) para que la app recuerde si ya lo has visto.
