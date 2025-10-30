import "./src/config/env.js"; // ⬅️ Carga el .env PRIMERO
import express from "express";
import cors from "cors";

console.log("🚀 Iniciando servidor principal de debug...");

const app = express();
app.use(cors());
app.use(express.json());

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Ruta de prueba
app.get("/", (req, res) => {
  console.log("🏠 Ruta raíz llamada");
  res.json({
    message: "🎬 Netflix Clone Backend API funcionando correctamente",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Ruta de prueba directa para TMDB
app.get("/api/tmdb/test-directo", (req, res) => {
  console.log("🧪 Ruta de prueba directa TMDB llamada");
  res.json({ message: "Ruta directa funcionando", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`🚀 Servidor backend de debug en puerto ${PORT}`));