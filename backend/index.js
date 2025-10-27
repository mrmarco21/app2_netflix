import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rutasUsuario from "./src/rutas/rutasUsuarios.js";
import rutasProgreso from "./src/rutas/rutasProgreso.js";
import rutasPerfiles from "./src/rutas/rutasPerfiles.js";
import rutasContenido from "./src/rutas/rutasContenido.js";
import tmdbRutas from "./src/rutas/tmdbRutas.js"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/usuarios", rutasUsuario);
app.use("/progreso", rutasProgreso);
app.use("/perfiles", rutasPerfiles);
app.use("/contenido", rutasContenido);
app.use("/api/tmdb", tmdbRutas);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ 
    message: "🎬 Netflix Clone Backend API funcionando correctamente",
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor backend en puerto ${PORT}`));
