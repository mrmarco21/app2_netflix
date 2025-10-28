import express from "express";
import axios from "axios";

const router = express.Router();

const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

console.log("🔑 Token cargado:", TMDB_BEARER_TOKEN ? "✅ SÍ" : "❌ NO (undefined)");

// 🧩 Función auxiliar para evitar repetir código
const fetchFromTMDB = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: { language: "es-ES", ...params },
      headers: {
        Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al consultar TMDB:", error.response?.data || error.message);
    throw error;
  }
};

// 🖼️ Función para formatear URLs de imágenes
const formatImageUrls = (item) => {
  return {
    ...item,
    poster_url: item.poster_path ? `${IMAGE_BASE_URL}/w500${item.poster_path}` : null,
    backdrop_url: item.backdrop_path ? `${IMAGE_BASE_URL}/original${item.backdrop_path}` : null,
    poster_small: item.poster_path ? `${IMAGE_BASE_URL}/w185${item.poster_path}` : null,
    backdrop_small: item.backdrop_path ? `${IMAGE_BASE_URL}/w780${item.backdrop_path}` : null,
  };
};

// 🎬 Función para formatear contenido (películas/series)
const formatContent = (items) => {
  return items.map(item => formatImageUrls(item));
};

// ========================================
// 🎬 PELÍCULAS
// ========================================

// Películas populares
router.get("/peliculas/populares", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await fetchFromTMDB("/movie/popular", { page });
    res.json({
      results: formatContent(data.results),
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results
    });
  } catch {
    res.status(500).json({ error: "Error al obtener películas populares" });
  }
});

// Películas en tendencia
router.get("/peliculas/tendencia", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await fetchFromTMDB("/trending/movie/week", { page });
    res.json({
      results: formatContent(data.results),
      page: data.page,
      total_pages: data.total_pages
    });
  } catch {
    res.status(500).json({ error: "Error al obtener películas en tendencia" });
  }
});

// Películas mejor valoradas
router.get("/peliculas/mejor-valoradas", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await fetchFromTMDB("/movie/top_rated", { page });
    res.json({
      results: formatContent(data.results),
      page: data.page,
      total_pages: data.total_pages
    });
  } catch {
    res.status(500).json({ error: "Error al obtener películas mejor valoradas" });
  }
});

// Películas en cartelera
router.get("/peliculas/cartelera", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await fetchFromTMDB("/movie/now_playing", { page });
    res.json({
      results: formatContent(data.results),
      page: data.page,
      total_pages: data.total_pages
    });
  } catch {
    res.status(500).json({ error: "Error al obtener películas en cartelera" });
  }
});

// Próximos estrenos de películas
router.get("/peliculas/proximamente", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    
    // Configurar fechas dinámicas (desde mañana hasta 1 año adelante)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Empezar desde mañana
    
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1); // Un año adelante
    
    const minDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
    const maxDate = oneYearLater.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Usar /discover/movie con filtros avanzados
    const data = await fetchFromTMDB("/discover/movie", {
      page,
      include_adult: false,
      include_video: false,
      language: "es-ES",
      sort_by: "popularity.desc",
      with_release_type: "2|3", // Theatrical releases
      "release_date.gte": minDate,
      "release_date.lte": maxDate
    });
    
    res.json({
      results: formatContent(data.results),
      page: data.page,
      total_pages: data.total_pages,
      date_range: { from: minDate, to: maxDate }
    });
  } catch (error) {
    console.error("Error al obtener próximos estrenos:", error);
    res.status(500).json({ error: "Error al obtener próximos estrenos" });
  }
});

// Detalles de una película específica (con videos/trailers)
router.get("/peliculas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener detalles completos
    const detalles = await fetchFromTMDB(`/movie/${id}`, {
      append_to_response: "videos,credits,similar,recommendations"
    });
    
    // Filtrar trailer en español o inglés
    const videos = detalles.videos?.results || [];
    const trailerES = videos.find(v => v.type === "Trailer" && v.site === "YouTube" && v.iso_639_1 === "es");
    const trailerEN = videos.find(v => v.type === "Trailer" && v.site === "YouTube" && v.iso_639_1 === "en");
    const trailer = trailerES || trailerEN || videos[0];
    
    // Formatear cast
    const cast = detalles.credits?.cast?.slice(0, 10).map(actor => ({
      id: actor.id,
      name: actor.name,
      character: actor.character,
      profile_url: actor.profile_path ? `${IMAGE_BASE_URL}/w185${actor.profile_path}` : null
    }));

    // Formatear contenido similar
    const similar = formatContent(detalles.similar?.results?.slice(0, 10) || []);
    const recommendations = formatContent(detalles.recommendations?.results?.slice(0, 10) || []);
    
    res.json({
      id: detalles.id,
      title: detalles.title,
      original_title: detalles.original_title,
      overview: detalles.overview,
      release_date: detalles.release_date,
      runtime: detalles.runtime,
      vote_average: detalles.vote_average,
      vote_count: detalles.vote_count,
      popularity: detalles.popularity,
      genres: detalles.genres,
      poster_url: detalles.poster_path ? `${IMAGE_BASE_URL}/w500${detalles.poster_path}` : null,
      backdrop_url: detalles.backdrop_path ? `${IMAGE_BASE_URL}/original${detalles.backdrop_path}` : null,
      poster_small: detalles.poster_path ? `${IMAGE_BASE_URL}/w185${detalles.poster_path}` : null,
      trailer: trailer ? {
        key: trailer.key,
        url: `https://www.youtube.com/watch?v=${trailer.key}`,
        embed_url: `https://www.youtube.com/embed/${trailer.key}`,
        name: trailer.name,
        type: trailer.type
      } : null,
      cast,
      similar,
      recommendations
    });
  } catch {
    res.status(500).json({ error: "Error al obtener detalles de la película" });
  }
});

// ========================================
// 📺 SERIES
// ========================================

// Series populares
router.get("/series/populares", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await fetchFromTMDB("/tv/popular", { page });
    res.json({
      results: formatContent(data.results),
      page: data.page,
      total_pages: data.total_pages
    });
  } catch {
    res.status(500).json({ error: "Error al obtener series populares" });
  }
});

// Series en tendencia
router.get("/series/tendencia", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await fetchFromTMDB("/trending/tv/week", { page });
    res.json({
      results: formatContent(data.results),
      page: data.page,
      total_pages: data.total_pages
    });
  } catch {
    res.status(500).json({ error: "Error al obtener series en tendencia" });
  }
});

// Series mejor valoradas
router.get("/series/mejor-valoradas", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await fetchFromTMDB("/tv/top_rated", { page });
    res.json({
      results: formatContent(data.results),
      page: data.page,
      total_pages: data.total_pages
    });
  } catch {
    res.status(500).json({ error: "Error al obtener series mejor valoradas" });
  }
});

// Series al aire
router.get("/series/al-aire", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await fetchFromTMDB("/tv/on_the_air", { page });
    res.json({
      results: formatContent(data.results),
      page: data.page,
      total_pages: data.total_pages
    });
  } catch {
    res.status(500).json({ error: "Error al obtener series al aire" });
  }
});

// Detalles de una serie específica (con videos/trailers)
router.get("/series/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const detalles = await fetchFromTMDB(`/tv/${id}`, {
      append_to_response: "videos,credits,similar,recommendations"
    });
    
    // Filtrar trailer
    const videos = detalles.videos?.results || [];
    const trailerES = videos.find(v => v.type === "Trailer" && v.site === "YouTube" && v.iso_639_1 === "es");
    const trailerEN = videos.find(v => v.type === "Trailer" && v.site === "YouTube" && v.iso_639_1 === "en");
    const trailer = trailerES || trailerEN || videos[0];
    
    // Formatear cast
    const cast = detalles.credits?.cast?.slice(0, 10).map(actor => ({
      id: actor.id,
      name: actor.name,
      character: actor.character,
      profile_url: actor.profile_path ? `${IMAGE_BASE_URL}/w185${actor.profile_path}` : null
    }));

    // Formatear contenido similar
    const similar = formatContent(detalles.similar?.results?.slice(0, 10) || []);
    const recommendations = formatContent(detalles.recommendations?.results?.slice(0, 10) || []);
    
    res.json({
      id: detalles.id,
      name: detalles.name,
      original_name: detalles.original_name,
      overview: detalles.overview,
      first_air_date: detalles.first_air_date,
      last_air_date: detalles.last_air_date,
      number_of_seasons: detalles.number_of_seasons,
      number_of_episodes: detalles.number_of_episodes,
      episode_run_time: detalles.episode_run_time,
      vote_average: detalles.vote_average,
      vote_count: detalles.vote_count,
      popularity: detalles.popularity,
      status: detalles.status,
      genres: detalles.genres,
      seasons: detalles.seasons,
      poster_url: detalles.poster_path ? `${IMAGE_BASE_URL}/w500${detalles.poster_path}` : null,
      backdrop_url: detalles.backdrop_path ? `${IMAGE_BASE_URL}/original${detalles.backdrop_path}` : null,
      poster_small: detalles.poster_path ? `${IMAGE_BASE_URL}/w185${detalles.poster_path}` : null,
      trailer: trailer ? {
        key: trailer.key,
        url: `https://www.youtube.com/watch?v=${trailer.key}`,
        embed_url: `https://www.youtube.com/embed/${trailer.key}`,
        name: trailer.name,
        type: trailer.type
      } : null,
      cast,
      similar,
      recommendations
    });
  } catch {
    res.status(500).json({ error: "Error al obtener detalles de la serie" });
  }
});

// Detalles de una temporada específica
router.get("/series/:id/temporada/:season", async (req, res) => {
  try {
    const { id, season } = req.params;
    const data = await fetchFromTMDB(`/tv/${id}/season/${season}`);
    
    // Formatear episodios
    const episodes = data.episodes?.map(ep => ({
      ...ep,
      still_url: ep.still_path ? `${IMAGE_BASE_URL}/w300${ep.still_path}` : null
    }));
    
    res.json({
      ...data,
      episodes,
      poster_url: data.poster_path ? `${IMAGE_BASE_URL}/w500${data.poster_path}` : null
    });
  } catch {
    res.status(500).json({ error: "Error al obtener detalles de la temporada" });
  }
});

// ========================================
// 🔍 BÚSQUEDA
// ========================================

// Búsqueda general (películas y series)
router.get("/buscar", async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Parámetro 'q' es requerido" });
    }
    
    const data = await fetchFromTMDB("/search/multi", { query: q, page });
    
    // Filtrar solo películas y series
    const results = data.results
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .map(item => formatImageUrls(item));
    
    res.json({
      results,
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results
    });
  } catch {
    res.status(500).json({ error: "Error al buscar contenido" });
  }
});

// Búsqueda solo películas
router.get("/buscar/peliculas", async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Parámetro 'q' es requerido" });
    }
    
    const data = await fetchFromTMDB("/search/movie", { query: q, page });
    res.json({
      results: formatContent(data.results),
      page: data.page,
      total_pages: data.total_pages
    });
  } catch {
    res.status(500).json({ error: "Error al buscar películas" });
  }
});

// Búsqueda solo series
router.get("/buscar/series", async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Parámetro 'q' es requerido" });
    }
    
    const data = await fetchFromTMDB("/search/tv", { query: q, page });
    res.json({
      results: formatContent(data.results),
      page: data.page,
      total_pages: data.total_pages
    });
  } catch {
    res.status(500).json({ error: "Error al buscar series" });
  }
});

// ========================================
// 🎭 GÉNEROS
// ========================================

// Géneros de películas
router.get("/generos/peliculas", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/genre/movie/list");
    res.json(data.genres);
  } catch {
    res.status(500).json({ error: "Error al obtener géneros de películas" });
  }
});

// Géneros de series
router.get("/generos/series", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/genre/tv/list");
    res.json(data.genres);
  } catch {
    res.status(500).json({ error: "Error al obtener géneros de series" });
  }
});

// Películas por género
router.get("/peliculas/genero/:genreId", async (req, res) => {
  try {
    const { genreId } = req.params;
    const { page = 1 } = req.query;
    const data = await fetchFromTMDB("/discover/movie", {
      with_genres: genreId,
      sort_by: "popularity.desc",
      page
    });
    res.json({
      results: formatContent(data.results),
      page: data.page,
      total_pages: data.total_pages
    });
  } catch {
    res.status(500).json({ error: "Error al obtener películas por género" });
  }
});

// Series por género
router.get("/series/genero/:genreId", async (req, res) => {
  try {
    const { genreId } = req.params;
    const { page = 1 } = req.query;
    const data = await fetchFromTMDB("/discover/tv", {
      with_genres: genreId,
      sort_by: "popularity.desc",
      page
    });
    res.json({
      results: formatContent(data.results),
      page: data.page,
      total_pages: data.total_pages
    });
  } catch {
    res.status(500).json({ error: "Error al obtener series por género" });
  }
});

// ========================================
// 🏠 PÁGINA DE INICIO - TODO EN UNO
// ========================================

// Endpoint especial para la pantalla de inicio con todo el contenido
router.get("/inicio", async (req, res) => {
  try {
    const [
      peliculasTendencia,
      peliculasPopulares,
      seriesPopulares,
      peliculasCartelera,
      seriesTendencia
    ] = await Promise.all([
      fetchFromTMDB("/trending/movie/week", { page: 1 }),
      fetchFromTMDB("/movie/popular", { page: 1 }),
      fetchFromTMDB("/tv/popular", { page: 1 }),
      fetchFromTMDB("/movie/now_playing", { page: 1 }),
      fetchFromTMDB("/trending/tv/week", { page: 1 })
    ]);

    res.json({
      peliculas_tendencia: formatContent(peliculasTendencia.results.slice(0, 10)),
      peliculas_populares: formatContent(peliculasPopulares.results.slice(0, 10)),
      series_populares: formatContent(seriesPopulares.results.slice(0, 10)),
      peliculas_cartelera: formatContent(peliculasCartelera.results.slice(0, 10)),
      series_tendencia: formatContent(seriesTendencia.results.slice(0, 10)),
      destacado: formatImageUrls(peliculasTendencia.results[0]) // Para el banner principal
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener contenido de inicio" });
  }
});

export default router;