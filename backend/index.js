import "./src/config/env.js"; // ⬅️ Carga el .env PRIMERO
import express from "express";
import cors from "cors";
import pool from "./src/config/basedatos.js"; // ⬅️ Importar pool (export default)
import rutasUsuario from "./src/rutas/rutasUsuarios.js";
import rutasProgreso from "./src/rutas/rutasProgreso.js";
import rutasPerfiles from "./src/rutas/rutasPerfiles.js";
import rutasContenido from "./src/rutas/rutasContenido.js";
import tmdbRutas from "./src/rutas/tmdbRutas.js";
import rutasMiLista from "./src/rutas/rutasMiLista.js";
import rutasCalificaciones from "./src/rutas/rutasCalificaciones.js";

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/usuarios", rutasUsuario);
app.use("/progreso", rutasProgreso);
app.use("/perfiles", rutasPerfiles);
app.use("/contenido", rutasContenido);
app.use("/api/tmdb", tmdbRutas);
app.use("/mi-lista", rutasMiLista);
app.use("/calificaciones", rutasCalificaciones);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "🎬 Netflix Clone Backend API funcionando correctamente",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Verificar tablas necesarias
const verificarTablas = async () => {
  try {
    // Verificar tabla mi_lista
    const [tablasMiLista] = await pool.execute(
      "SHOW TABLES LIKE 'mi_lista'"
    );
    
    if (tablasMiLista.length === 0) {
      console.log('⚠️  Tabla mi_lista no encontrada. Creándola...');
      await pool.execute(`
        CREATE TABLE mi_lista (
          id INT AUTO_INCREMENT PRIMARY KEY,
          id_perfil INT NOT NULL,
          id_contenido VARCHAR(50) NOT NULL,
          titulo VARCHAR(255) NOT NULL,
          imagen TEXT,
          tipo ENUM('pelicula', 'serie') NOT NULL,
          fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_perfil_contenido (id_perfil, id_contenido),
          FOREIGN KEY (id_perfil) REFERENCES perfiles(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Tabla mi_lista creada exitosamente');
    } else {
      console.log('✅ Tabla mi_lista encontrada');
    }

    // Verificar tabla calificaciones
    const [tablasCalificaciones] = await pool.execute(
      "SHOW TABLES LIKE 'calificaciones'"
    );
    
    if (tablasCalificaciones.length === 0) {
      console.log('⚠️  Tabla calificaciones no encontrada. Creándola...');
      await pool.execute(`
        CREATE TABLE calificaciones (
          id INT AUTO_INCREMENT PRIMARY KEY,
          id_perfil INT NOT NULL,
          id_contenido VARCHAR(50) NOT NULL,
          calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
          fecha_calificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_perfil_contenido_calificacion (id_perfil, id_contenido),
          FOREIGN KEY (id_perfil) REFERENCES perfiles(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Tabla calificaciones creada exitosamente');
    } else {
      // console.log('✅ Tabla calificaciones encontrada');
    }
  } catch (error) {
    console.error('❌ Error al verificar/crear tablas:', error);
  }
};

// Verificar conexión a la base de datos y tablas
pool.getConnection()
  .then(async (connection) => {
    console.log('✅ Conectado a MySQL (XAMPP)');
    
    // Verificar tablas existentes
    const [tablas] = await connection.execute('SHOW TABLES');
    const nombresTablas = tablas.map(tabla => Object.values(tabla)[0]);
    
    if (nombresTablas.includes('usuarios')) {
      const [columnasUsuarios] = await connection.execute('SHOW COLUMNS FROM usuarios');
      // console.log('✅ Tabla usuarios encontrada con columnas:', columnasUsuarios.map(col => col.Field));
    }
    
    if (nombresTablas.includes('perfiles')) {
      const [columnasPerfiles] = await connection.execute('SHOW COLUMNS FROM perfiles');
      // console.log('✅ Tabla perfiles encontrada con columnas:', columnasPerfiles.map(col => col.Field));
    }
    
    connection.release();
    
    // Verificar y crear tablas necesarias
    await verificarTablas();
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL:', err);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor backend en puerto ${PORT}`));