<<<<<<< HEAD
const BASE_URL = "http://192.168.56.1:3000/api/tmdb"; // Para web usar 192.168.56.1
=======
const BASE_URL = "http://192.168.18.31:3000/api/tmdb"; // Para web usar localhost
>>>>>>> a7b27af115a1d50ac62be861c8a6938b90b6a295

// ========================================
// 🏠 PANTALLA DE INICIO
// ========================================
export const obtenerContenidoInicio = async () => {
  const res = await fetch(`${BASE_URL}/inicio`);
  return await res.json();
};

// ========================================
// 🎬 PELÍCULAS
// ========================================

// Películas populares
export const obtenerPeliculasPopulares = async (page = 1) => {
  const res = await fetch(`${BASE_URL}/peliculas/populares?page=${page}`);
  return await res.json();
};

// Películas en tendencia
export const obtenerPeliculasTendencia = async (page = 1) => {
  const res = await fetch(`${BASE_URL}/peliculas/tendencia?page=${page}`);
  return await res.json();
};

// Películas mejor valoradas
export const obtenerPeliculasMejorValoradas = async (page = 1) => {
  const res = await fetch(`${BASE_URL}/peliculas/mejor-valoradas?page=${page}`);
  return await res.json();
};

// Películas en cartelera
export const obtenerPeliculasCartelera = async (page = 1) => {
  const res = await fetch(`${BASE_URL}/peliculas/cartelera?page=${page}`);
  return await res.json();
};

// Próximos estrenos
export const obtenerPeliculasProximamente = async (page = 1) => {
  const res = await fetch(`${BASE_URL}/peliculas/proximamente?page=${page}`);
  return await res.json();
};

// Detalle de película (con trailer)
export const obtenerDetallePelicula = async (id) => {
  const res = await fetch(`${BASE_URL}/peliculas/${id}`);
  return await res.json();
};

// Películas por género
export const obtenerPeliculasPorGenero = async (genreId, page = 1) => {
  const res = await fetch(
    `${BASE_URL}/peliculas/genero/${genreId}?page=${page}`
  );
  return await res.json();
};

// ========================================
// 📺 SERIES
// ========================================

// Series populares
export const obtenerSeriesPopulares = async (page = 1) => {
  const res = await fetch(`${BASE_URL}/series/populares?page=${page}`);
  return await res.json();
};

// Series en tendencia
export const obtenerSeriesTendencia = async (page = 1) => {
  const res = await fetch(`${BASE_URL}/series/tendencia?page=${page}`);
  return await res.json();
};

// Series mejor valoradas
export const obtenerSeriesMejorValoradas = async (page = 1) => {
  const res = await fetch(`${BASE_URL}/series/mejor-valoradas?page=${page}`);
  return await res.json();
};

// Series al aire
export const obtenerSeriesAlAire = async (page = 1) => {
  const res = await fetch(`${BASE_URL}/series/al-aire?page=${page}`);
  return await res.json();
};

// Detalle de serie (con trailer)
export const obtenerDetalleSerie = async (id) => {
  const res = await fetch(`${BASE_URL}/series/${id}`);
  return await res.json();
};

// 🆕 Detalle COMPLETO de serie (con TODAS las temporadas y episodios)
// ⚠️ IMPORTANTE: Este endpoint hace múltiples llamadas y puede ser lento
// Úsalo solo cuando necesites toda la información de la serie de una vez
export const obtenerSerieCompleta = async (id) => {
  const res = await fetch(`${BASE_URL}/series/${id}/completo`);
  return await res.json();
};

// Series por género
export const obtenerSeriesPorGenero = async (genreId, page = 1) => {
  const res = await fetch(`${BASE_URL}/series/genero/${genreId}?page=${page}`);
  return await res.json();
};

// Detalle de temporada (con sus episodios)
export const obtenerDetalleTemporada = async (serieId, seasonNumber) => {
  const res = await fetch(
    `${BASE_URL}/series/${serieId}/temporada/${seasonNumber}`
  );
  return await res.json();
};

// 🆕 Detalle de un episodio específico
export const obtenerDetalleEpisodio = async (
  serieId,
  seasonNumber,
  episodeNumber
) => {
  const res = await fetch(
    `${BASE_URL}/series/${serieId}/temporada/${seasonNumber}/episodio/${episodeNumber}`
  );
  return await res.json();
};

// ========================================
// 🔍 BÚSQUEDA
// ========================================

// Búsqueda general (películas y series)
export const buscarContenido = async (query, page = 1) => {
  const res = await fetch(
    `${BASE_URL}/buscar?q=${encodeURIComponent(query)}&page=${page}`
  );
  return await res.json();
};

// Búsqueda solo películas
export const buscarPeliculas = async (query, page = 1) => {
  const res = await fetch(
    `${BASE_URL}/buscar/peliculas?q=${encodeURIComponent(query)}&page=${page}`
  );
  return await res.json();
};

// Búsqueda solo series
export const buscarSeries = async (query, page = 1) => {
  const res = await fetch(
    `${BASE_URL}/buscar/series?q=${encodeURIComponent(query)}&page=${page}`
  );
  return await res.json();
};

// ========================================
// 🎭 GÉNEROS
// ========================================

// Géneros de películas
export const obtenerGenerosPeliculas = async () => {
  const res = await fetch(`${BASE_URL}/generos/peliculas`);
  return await res.json();
};

// Géneros de series
export const obtenerGenerosSeries = async () => {
  const res = await fetch(`${BASE_URL}/generos/series`);
  return await res.json();
};
