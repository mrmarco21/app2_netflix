import express from "express";
import axios from "axios";

console.log("🚀 Cargando módulo tmdbRutas.js...");

const router = express.Router();

const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// console.log("🔑 Token cargado:", TMDB_BEARER_TOKEN ? "✅ SÍ" : "❌ NO (undefined)");

// 🧩 Función auxiliar para evitar repetir código
const fetchFromTMDB = async (endpoint, params = {}) => {
  try {
    console.log(`🔍 Haciendo petición a TMDB: ${BASE_URL}${endpoint}`, params);
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: { language: "es-ES", ...params },
      headers: {
        Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
        Accept: "application/json",
      },
    });
    console.log(`✅ Respuesta exitosa de TMDB para ${endpoint}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error al consultar TMDB:", error.response?.data || error.message);
    console.error("❌ URL completa:", `${BASE_URL}${endpoint}`);
    console.error("❌ Parámetros:", params);
    throw error;
  }
};

// 🧩 Función auxiliar para priorizar contenido en español
const prioritizeSpanishContent = (results) => {
  return results.sort((a, b) => {
    // Priorizar contenido en español
    const aIsSpanish = a.original_language === 'es' || a.original_language === 'es-ES';
    const bIsSpanish = b.original_language === 'es' || b.original_language === 'es-ES';
    
    if (aIsSpanish && !bIsSpanish) return -1;
    if (!aIsSpanish && bIsSpanish) return 1;
    
    // Si ambos son del mismo idioma, ordenar por popularidad
    return b.popularity - a.popularity;
  });
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

// Ruta de prueba simple
router.get("/test", async (req, res) => {
  console.log("🧪 Ruta de prueba TMDB llamada");
  console.log("🔑 Token disponible:", TMDB_BEARER_TOKEN ? "SÍ" : "NO");
  console.log("🌐 BASE_URL:", BASE_URL);
  
  try {
    console.log("🔍 Haciendo petición de prueba a TMDB...");
    const response = await axios.get(`${BASE_URL}/genre/movie/list`, {
      params: { language: "es-ES" },
      headers: {
        Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
        Accept: "application/json",
      },
    });
    console.log("✅ Respuesta exitosa de TMDB");
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("❌ Error en prueba TMDB:", error.response?.data || error.message);
    res.status(500).json({ error: "Error en prueba TMDB", details: error.message });
  }
});

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
  } catch (error) {
    console.error("Error en ruta películas populares:", error.message);
    res.status(500).json({ error: "Error al obtener películas populares", details: error.message });
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
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    const minDate = tomorrow.toISOString().split('T')[0];
    const maxDate = oneYearLater.toISOString().split('T')[0];
    
    const data = await fetchFromTMDB("/discover/movie", {
      page,
      include_adult: false,
      include_video: false,
      language: "es-ES",
      sort_by: "popularity.desc",
      with_release_type: "2|3",
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
    let similar = formatContent(detalles.similar?.results?.slice(0, 10) || []);
    let recommendations = formatContent(detalles.recommendations?.results?.slice(0, 10) || []);
    
    // Si no hay contenido similar, implementar fallbacks múltiples
    if (similar.length === 0 && recommendations.length === 0) {
      try {
        console.log(`No hay contenido similar para película ${id}, implementando fallbacks...`);
        
        // FALLBACK 1: Buscar por géneros (prioridad principal)
        if (similar.length === 0 && detalles.genres?.length > 0) {
          console.log(`Fallback 1: Buscando por géneros:`, detalles.genres.map(g => g.name));
          
          const genreIds = detalles.genres.slice(0, 3).map(g => g.id).join(',');
          
          const similarByGenre = await fetchFromTMDB("/discover/movie", {
            with_genres: genreIds,
            sort_by: "popularity.desc",
            page: 1,
            "vote_count.gte": 10, // Reducido para más resultados
            "vote_average.gte": 4.0 // Reducido para más resultados
          });
          
          const filteredResults = similarByGenre.results
            .filter(movie => movie.id !== parseInt(id))
            .slice(0, 15);
          
          // Priorizar contenido en español
          const prioritizedResults = prioritizeSpanishContent(filteredResults).slice(0, 12);
          
          if (prioritizedResults.length > 0) {
            similar = formatContent(prioritizedResults);
            console.log(`Encontradas ${similar.length} películas similares por género (priorizando español)`);
          }
        }
        
        // FALLBACK 2: Buscar por título completo y variaciones (si no hay resultados por género)
        if (similar.length === 0 && detalles.title) {
          console.log(`Fallback 2: Buscando por título completo y variaciones: "${detalles.title}"`);
          
          const titleSearches = [];
          
          // 1. Buscar por título completo
          titleSearches.push(detalles.title);
          
          // 2. Si el título tiene más de una palabra, buscar variaciones
          const titleWords = detalles.title.split(' ');
          if (titleWords.length > 1) {
            // Buscar por las primeras dos palabras si hay más de 2
            if (titleWords.length > 2) {
              titleSearches.push(titleWords.slice(0, 2).join(' '));
            }
            
            // Para títulos como "Culpa Mía", buscar también "Culpa"
            if (titleWords.length === 2) {
              titleSearches.push(titleWords[0]);
            }
          }
          
          console.log(`Términos de búsqueda:`, titleSearches);
          
          const keywordResults = [];
          
          for (const searchTerm of titleSearches) {
            try {
              const searchResults = await fetchFromTMDB("/search/movie", {
                query: searchTerm,
                page: 1
              });
              
              // Filtrar resultados más relevantes
              const filteredResults = searchResults.results
                .filter(movie => {
                  // Excluir la película actual
                  if (movie.id === parseInt(id)) return false;
                  
                  // Para búsquedas de una sola palabra, ser más estricto
                  if (searchTerm.split(' ').length === 1) {
                    const movieTitle = movie.title.toLowerCase();
                    const originalTitle = movie.original_title?.toLowerCase() || '';
                    const searchLower = searchTerm.toLowerCase();
                    
                    // Solo incluir si el término aparece al inicio del título o es una palabra completa
                    return movieTitle.startsWith(searchLower) || 
                           originalTitle.startsWith(searchLower) ||
                           movieTitle.includes(` ${searchLower} `) ||
                           originalTitle.includes(` ${searchLower} `) ||
                           movieTitle.endsWith(` ${searchLower}`) ||
                           originalTitle.endsWith(` ${searchLower}`);
                  }
                  
                  return true;
                })
                .slice(0, 8); // Más resultados para búsquedas de título completo
              
              keywordResults.push(...filteredResults);
            } catch (error) {
              console.error(`Error buscando por término "${searchTerm}":`, error);
            }
          }
          
          // Eliminar duplicados y priorizar contenido en español
          const uniqueResults = keywordResults
            .filter((movie, index, self) => 
              index === self.findIndex(m => m.id === movie.id)
            );
          
          // Priorizar contenido en español y por relevancia
          const prioritizedResults = prioritizeSpanishContent(uniqueResults)
            .slice(0, 12);
          
          if (prioritizedResults.length > 0) {
            similar = formatContent(prioritizedResults);
            console.log(`Encontradas ${similar.length} películas similares por título (priorizando español)`);
          }
        }
        
        // FALLBACK 3: Buscar por géneros (si los tiene y no encontramos por palabras clave)
        if (similar.length === 0 && detalles.genres?.length > 0) {
          console.log(`Fallback 3: Buscando por géneros (segunda oportunidad):`, detalles.genres.map(g => g.name));
          
          const genreIds = detalles.genres.slice(0, 2).map(g => g.id).join(',');
          
          const similarByGenre = await fetchFromTMDB("/discover/movie", {
            with_genres: genreIds,
            sort_by: "popularity.desc",
            page: 1,
            "vote_count.gte": 50, // Reducido para más resultados
            "vote_average.gte": 5.5 // Reducido para más resultados
          });
          
          const filteredResults = similarByGenre.results
            .filter(movie => movie.id !== parseInt(id))
            .slice(0, 10);
          
          similar = formatContent(filteredResults);
          console.log(`Encontradas ${similar.length} películas similares por género`);
        }
        
        // FALLBACK 4: Si aún no hay resultados, buscar películas populares del mismo año
        if (similar.length === 0 && detalles.release_date) {
          console.log(`Fallback 4: Buscando por año de lanzamiento`);
          
          const year = detalles.release_date.split('-')[0];
          
          const similarByYear = await fetchFromTMDB("/discover/movie", {
            primary_release_year: year,
            sort_by: "popularity.desc",
            page: 1,
            "vote_count.gte": 50
          });
          
          const filteredResults = similarByYear.results
            .filter(movie => movie.id !== parseInt(id))
            .slice(0, 10);
          
          similar = formatContent(filteredResults);
          console.log(`Encontradas ${similar.length} películas similares por año (${year})`);
        }
        
        // FALLBACK 5: Si aún no hay resultados, mostrar películas populares generales
        if (similar.length === 0) {
          console.log(`Fallback 5: Mostrando películas populares generales`);
          
          const popularMovies = await fetchFromTMDB("/movie/popular", {
            page: 1
          });
          
          const filteredResults = popularMovies.results
            .filter(movie => movie.id !== parseInt(id))
            .slice(0, 10);
          
          similar = formatContent(filteredResults);
          console.log(`Encontradas ${similar.length} películas populares como fallback final`);
        }
        
      } catch (error) {
        console.error("Error en fallbacks de contenido similar:", error);
        
        // FALLBACK DE EMERGENCIA: Al menos mostrar algunas películas populares
        try {
          const popularMovies = await fetchFromTMDB("/movie/popular", { page: 1 });
          similar = formatContent(popularMovies.results.slice(0, 6));
          console.log(`Fallback de emergencia: ${similar.length} películas populares`);
        } catch (emergencyError) {
          console.error("Error en fallback de emergencia:", emergencyError);
        }
      }
    }
    
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
  } catch (error) {
    console.error("Error en ruta series tendencia:", error.message);
    res.status(500).json({ error: "Error al obtener series en tendencia", details: error.message });
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
    let similar = formatContent(detalles.similar?.results?.slice(0, 10) || []);
    let recommendations = formatContent(detalles.recommendations?.results?.slice(0, 10) || []);
    
    // Si no hay contenido similar, implementar fallbacks múltiples
    if (similar.length === 0 && recommendations.length === 0) {
      try {
        console.log(`No hay contenido similar para serie ${id}, implementando fallbacks...`);
        
        // FALLBACK 1: Buscar por géneros (prioridad principal)
        if (similar.length === 0 && detalles.genres?.length > 0) {
          console.log(`Fallback 1: Buscando por géneros:`, detalles.genres.map(g => g.name));
          
          const genreIds = detalles.genres.slice(0, 3).map(g => g.id).join(',');
          
          const similarByGenre = await fetchFromTMDB("/discover/tv", {
            with_genres: genreIds,
            sort_by: "popularity.desc",
            page: 1,
            "vote_count.gte": 10, // Reducido para más resultados
            "vote_average.gte": 4.0 // Reducido para más resultados
          });
          
          const filteredResults = similarByGenre.results
            .filter(show => show.id !== parseInt(id))
            .slice(0, 15);
          
          // Priorizar contenido en español
          const prioritizedResults = prioritizeSpanishContent(filteredResults).slice(0, 12);
          
          if (prioritizedResults.length > 0) {
            similar = formatContent(prioritizedResults);
            console.log(`Encontradas ${similar.length} series similares por género (priorizando español)`);
          }
        }
        
        // FALLBACK 2: Buscar por título completo y variaciones (si no hay resultados por género)
        if (similar.length === 0 && detalles.name) {
          console.log(`Fallback 2: Buscando por título completo y variaciones: "${detalles.name}"`);
          
          const titleSearches = [];
          
          // 1. Buscar por título completo
          titleSearches.push(detalles.name);
          
          // 2. Si el título tiene más de una palabra, buscar variaciones
          const titleWords = detalles.name.split(' ');
          if (titleWords.length > 1) {
            // Buscar por las primeras dos palabras si hay más de 2
            if (titleWords.length > 2) {
              titleSearches.push(titleWords.slice(0, 2).join(' '));
            }
            
            // Para títulos como "Elite", buscar también la primera palabra
            if (titleWords.length === 2) {
              titleSearches.push(titleWords[0]);
            }
          }
          
          console.log(`Términos de búsqueda:`, titleSearches);
          
          const keywordResults = [];
          
          for (const searchTerm of titleSearches) {
            try {
              const searchResults = await fetchFromTMDB("/search/tv", {
                query: searchTerm,
                page: 1
              });
              
              // Filtrar resultados más relevantes
              const filteredResults = searchResults.results
                .filter(show => {
                  // Excluir la serie actual
                  if (show.id === parseInt(id)) return false;
                  
                  // Para búsquedas de una sola palabra, ser más estricto
                  if (searchTerm.split(' ').length === 1) {
                    const showName = show.name.toLowerCase();
                    const originalName = show.original_name?.toLowerCase() || '';
                    const searchLower = searchTerm.toLowerCase();
                    
                    // Solo incluir si el término aparece al inicio del título o es una palabra completa
                    return showName.startsWith(searchLower) || 
                           originalName.startsWith(searchLower) ||
                           showName.includes(` ${searchLower} `) ||
                           originalName.includes(` ${searchLower} `) ||
                           showName.endsWith(` ${searchLower}`) ||
                           originalName.endsWith(` ${searchLower}`);
                  }
                  
                  return true;
                })
                .slice(0, 8); // Más resultados para búsquedas de título completo
              
              keywordResults.push(...filteredResults);
            } catch (error) {
              console.error(`Error buscando por término "${searchTerm}":`, error);
            }
          }
          
          // Eliminar duplicados y priorizar contenido en español
          const uniqueResults = keywordResults
            .filter((show, index, self) => 
              index === self.findIndex(s => s.id === show.id)
            );
          
          // Priorizar contenido en español y por relevancia
          const prioritizedResults = prioritizeSpanishContent(uniqueResults)
            .slice(0, 12);
          
          if (prioritizedResults.length > 0) {
            similar = formatContent(prioritizedResults);
            console.log(`Encontradas ${similar.length} series similares por título (priorizando español)`);
          }
        }
        
        // FALLBACK 3: Buscar por géneros (si los tiene y no encontramos por palabras clave)
        if (similar.length === 0 && detalles.genres?.length > 0) {
          console.log(`Fallback 3: Buscando por géneros (segunda oportunidad):`, detalles.genres.map(g => g.name));
          
          const genreIds = detalles.genres.slice(0, 2).map(g => g.id).join(',');
          
          const similarByGenre = await fetchFromTMDB("/discover/tv", {
            with_genres: genreIds,
            sort_by: "popularity.desc",
            page: 1,
            "vote_count.gte": 25, // Reducido para más resultados
            "vote_average.gte": 5.5 // Reducido para más resultados
          });
          
          const filteredResults = similarByGenre.results
            .filter(show => show.id !== parseInt(id))
            .slice(0, 10);
          
          similar = formatContent(filteredResults);
          console.log(`Encontradas ${similar.length} series similares por género`);
        }
        
        // FALLBACK 4: Si aún no hay resultados, buscar series populares del mismo año
        if (similar.length === 0 && detalles.first_air_date) {
          console.log(`Fallback 4: Buscando por año de estreno`);
          
          const year = detalles.first_air_date.split('-')[0];
          
          const similarByYear = await fetchFromTMDB("/discover/tv", {
            first_air_date_year: year,
            sort_by: "popularity.desc",
            page: 1,
            "vote_count.gte": 25
          });
          
          const filteredResults = similarByYear.results
            .filter(show => show.id !== parseInt(id))
            .slice(0, 10);
          
          similar = formatContent(filteredResults);
          console.log(`Encontradas ${similar.length} series similares por año (${year})`);
        }
        
        // FALLBACK 5: Si aún no hay resultados, mostrar series populares generales
        if (similar.length === 0) {
          console.log(`Fallback 5: Mostrando series populares generales`);
          
          const popularShows = await fetchFromTMDB("/tv/popular", {
            page: 1
          });
          
          const filteredResults = popularShows.results
            .filter(show => show.id !== parseInt(id))
            .slice(0, 10);
          
          similar = formatContent(filteredResults);
          console.log(`Encontradas ${similar.length} series populares como fallback final`);
        }
        
      } catch (error) {
        console.error("Error en fallbacks de contenido similar:", error);
        
        // FALLBACK DE EMERGENCIA: Al menos mostrar algunas series populares
        try {
          const popularShows = await fetchFromTMDB("/tv/popular", { page: 1 });
          similar = formatContent(popularShows.results.slice(0, 6));
          console.log(`Fallback de emergencia: ${similar.length} series populares`);
        } catch (emergencyError) {
          console.error("Error en fallback de emergencia:", emergencyError);
        }
      }
    }
    
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

// 🆕 Detalles completos de una serie con TODAS sus temporadas y episodios
router.get("/series/:id/completo", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener detalles básicos
    const detalles = await fetchFromTMDB(`/tv/${id}`, {
      append_to_response: "videos,credits,similar,recommendations"
    });
    
    // Obtener TODAS las temporadas con episodios
    const temporadasCompletas = await Promise.all(
      detalles.seasons.map(async (season) => {
        // Omitir "Specials" (temporada 0)
        if (season.season_number === 0) return null;
        
        try {
          const temporadaDetalle = await fetchFromTMDB(
            `/tv/${id}/season/${season.season_number}`
          );
          
          return {
            id: temporadaDetalle.id,
            name: temporadaDetalle.name,
            overview: temporadaDetalle.overview,
            season_number: temporadaDetalle.season_number,
            episode_count: temporadaDetalle.episodes?.length || 0,
            air_date: temporadaDetalle.air_date,
            poster_url: temporadaDetalle.poster_path 
              ? `${IMAGE_BASE_URL}/w500${temporadaDetalle.poster_path}` 
              : null,
            episodes: temporadaDetalle.episodes?.map(ep => ({
              id: ep.id,
              name: ep.name,
              overview: ep.overview,
              episode_number: ep.episode_number,
              season_number: ep.season_number,
              air_date: ep.air_date,
              runtime: ep.runtime,
              vote_average: ep.vote_average,
              vote_count: ep.vote_count,
              still_url: ep.still_path 
                ? `${IMAGE_BASE_URL}/w300${ep.still_path}` 
                : null,
              still_large: ep.still_path 
                ? `${IMAGE_BASE_URL}/original${ep.still_path}` 
                : null
            })) || []
          };
        } catch {
          return null;
        }
      })
    );
    
    // Filtrar temporadas nulas
    const temporadasValidas = temporadasCompletas.filter(t => t !== null);
    
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
      profile_url: actor.profile_path 
        ? `${IMAGE_BASE_URL}/w185${actor.profile_path}` 
        : null
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
      poster_url: detalles.poster_path 
        ? `${IMAGE_BASE_URL}/w500${detalles.poster_path}` 
        : null,
      backdrop_url: detalles.backdrop_path 
        ? `${IMAGE_BASE_URL}/original${detalles.backdrop_path}` 
        : null,
      poster_small: detalles.poster_path 
        ? `${IMAGE_BASE_URL}/w185${detalles.poster_path}` 
        : null,
      trailer: trailer ? {
        key: trailer.key,
        url: `https://www.youtube.com/watch?v=${trailer.key}`,
        embed_url: `https://www.youtube.com/embed/${trailer.key}`,
        name: trailer.name,
        type: trailer.type
      } : null,
      cast,
      similar,
      recommendations,
      temporadas: temporadasValidas // ✨ TODAS LAS TEMPORADAS CON EPISODIOS
    });
  } catch (error) {
    console.error("Error al obtener serie completa:", error);
    res.status(500).json({ error: "Error al obtener detalles completos de la serie" });
  }
});

// Detalles de una temporada específica
router.get("/series/:id/temporada/:season", async (req, res) => {
  try {
    const { id, season } = req.params;
    const data = await fetchFromTMDB(`/tv/${id}/season/${season}`);
    
    // Formatear episodios con más detalles
    const episodes = data.episodes?.map(ep => ({
      id: ep.id,
      name: ep.name,
      overview: ep.overview,
      episode_number: ep.episode_number,
      season_number: ep.season_number,
      air_date: ep.air_date,
      runtime: ep.runtime,
      vote_average: ep.vote_average,
      vote_count: ep.vote_count,
      still_url: ep.still_path 
        ? `${IMAGE_BASE_URL}/w300${ep.still_path}` 
        : null,
      still_large: ep.still_path 
        ? `${IMAGE_BASE_URL}/original${ep.still_path}` 
        : null
    }));
    
    res.json({
      id: data.id,
      name: data.name,
      overview: data.overview,
      season_number: data.season_number,
      air_date: data.air_date,
      episode_count: episodes?.length || 0,
      poster_url: data.poster_path 
        ? `${IMAGE_BASE_URL}/w500${data.poster_path}` 
        : null,
      episodes
    });
  } catch {
    res.status(500).json({ error: "Error al obtener detalles de la temporada" });
  }
});

// 🆕 Detalles de un episodio específico
router.get("/series/:id/temporada/:season/episodio/:episode", async (req, res) => {
  try {
    const { id, season, episode } = req.params;
    
    const data = await fetchFromTMDB(
      `/tv/${id}/season/${season}/episode/${episode}`,
      { append_to_response: "credits,images,videos" }
    );
    
    // Filtrar trailer del episodio
    const videos = data.videos?.results || [];
    const trailer = videos.find(v => v.site === "YouTube") || videos[0];
    
    // Guest stars (actores invitados)
    const guestStars = data.guest_stars?.map(actor => ({
      id: actor.id,
      name: actor.name,
      character: actor.character,
      profile_url: actor.profile_path 
        ? `${IMAGE_BASE_URL}/w185${actor.profile_path}` 
        : null
    }));
    
    // Crew (director, escritores, etc.)
    const crew = data.crew?.slice(0, 5).map(person => ({
      id: person.id,
      name: person.name,
      job: person.job,
      department: person.department,
      profile_url: person.profile_path 
        ? `${IMAGE_BASE_URL}/w185${person.profile_path}` 
        : null
    }));
    
    res.json({
      id: data.id,
      name: data.name,
      overview: data.overview,
      episode_number: data.episode_number,
      season_number: data.season_number,
      air_date: data.air_date,
      runtime: data.runtime,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
      still_url: data.still_path 
        ? `${IMAGE_BASE_URL}/original${data.still_path}` 
        : null,
      still_small: data.still_path 
        ? `${IMAGE_BASE_URL}/w300${data.still_path}` 
        : null,
      trailer: trailer ? {
        key: trailer.key,
        url: `https://www.youtube.com/watch?v=${trailer.key}`,
        embed_url: `https://www.youtube.com/embed/${trailer.key}`,
        name: trailer.name
      } : null,
      guest_stars: guestStars,
      crew
    });
  } catch {
    res.status(500).json({ error: "Error al obtener detalles del episodio" });
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
      destacado: formatImageUrls(peliculasTendencia.results[0])
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener contenido de inicio" });
  }
});

export default router;