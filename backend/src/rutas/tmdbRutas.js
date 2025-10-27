import express from "express";
import axios from "axios";

const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// 🧩 Función auxiliar para evitar repetir código
const fetchFromTMDB = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: { api_key: TMDB_API_KEY, language: "es-ES", ...params },
    });
    return response.data;
  } catch (error) {
    console.error("Error al consultar TMDB:", error.message);
    throw error;
  }
};

// 🔹 1. Obtener géneros de películas
router.get("/genres/movies", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/genre/movie/list");
    res.json(data.genres);
  } catch {
    res.status(500).json({ error: "Error al obtener géneros de películas" });
  }
});

// 🔹 2. Obtener géneros de series
router.get("/genres/series", async (req, res) => {
  try {
    const data = await fetchFromTMDB("/genre/tv/list");
    res.json(data.genres);
  } catch {
    res.status(500).json({ error: "Error al obtener géneros de series" });
  }
});

// 🔹 3. Películas por género
router.get("/movies/:genreId", async (req, res) => {
  const { genreId } = req.params;
  try {
    const data = await fetchFromTMDB("/discover/movie", { with_genres: genreId });
    res.json(data.results);
  } catch {
    res.status(500).json({ error: "Error al obtener películas por género" });
  }
});

// 🔹 4. Series por género
router.get("/series/:genreId", async (req, res) => {
  const { genreId } = req.params;
  try {
    const data = await fetchFromTMDB("/discover/tv", { with_genres: genreId });
    res.json(data.results);
  } catch {
    res.status(500).json({ error: "Error al obtener series por género" });
  }
});

// 🔹 5. Detalle de una película
router.get("/movie/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await fetchFromTMDB(`/movie/${id}`);
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al obtener detalle de la película" });
  }
});

// 🔹 6. Detalle de una serie
router.get("/serie/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await fetchFromTMDB(`/tv/${id}`);
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al obtener detalle de la serie" });
  }
});

export default router;
