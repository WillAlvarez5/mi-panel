import { setHeader } from '../util.js';
import { soonCard } from './soon.js';

export async function render(root) {
  setHeader('Ocio', 'Películas y libros');
  root.innerHTML = soonCard(5, 'Películas y libros', [
    'Listas de vistas / por ver y leídos / por leer, con tu nota',
    'Buscador con portadas (TMDB y Open Library)',
    'Importar tus listas de FilmAffinity o Goodreads desde CSV',
    'Recomendaciones semanales según tus gustos',
  ]);
}
