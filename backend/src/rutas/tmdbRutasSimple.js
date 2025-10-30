import express from "express";
import axios from "axios";

console.log("🚀 Cargando módulo tmdbRutasSimple.js...");

const router = express.Router();

const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";

console.log("🔑 Token cargado:", TMDB_BEARER_TOKEN ? "✅ SÍ" : "❌ NO");

// Ruta de prueba simple
router.get("/test", async (req, res) => {
  console.log("🧪 Ruta de prueba TMDB simple llamada");
  res.json({ message: "TMDB simple funcionando", token: TMDB_BEARER_TOKEN ? "disponible" : "no disponible" });
});

// Ruta de películas populares simple
router.get("/peliculas/populares", async (req, res) => {
  console.log("🎬 Obteniendo películas populares...");
  
  try {
    const response = await axios.get(`${BASE_URL}/movie/popular`, {
      params: { language: "es-ES" },
      headers: {
        Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
        Accept: "application/json",
      },
    });
    
    console.log("✅ Películas populares obtenidas exitosamente");
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("❌ Error al obtener películas populares:", error.message);
    res.status(500).json({ error: "Error al obtener películas populares", details: error.message });
  }
});

console.log("🧪 Rutas TMDB simples registradas");

export default router;