import express from "express";
import cors from "cors";

console.log("🚀 Iniciando servidor de prueba...");

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Rutas de prueba
app.get("/", (req, res) => {
  console.log("🏠 Ruta raíz llamada");
  res.json({ message: "Servidor de prueba funcionando", timestamp: new Date().toISOString() });
});

app.get("/test", (req, res) => {
  console.log("🧪 Ruta de prueba llamada");
  res.json({ message: "Ruta de prueba funcionando", timestamp: new Date().toISOString() });
});

app.get("/api/tmdb/test", (req, res) => {
  console.log("🎬 Ruta TMDB de prueba llamada");
  res.json({ message: "Ruta TMDB de prueba funcionando", timestamp: new Date().toISOString() });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de prueba funcionando en puerto ${PORT}`);
});