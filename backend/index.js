import "./src/config/env.js"; // ⬅️ Carga el .env PRIMERO
import express from "express";
import cors from "cors";

// Importar rutas
import pool from "./src/config/basedatos.js";
import rutasUsuario from "./src/rutas/rutasUsuarios.js";
import rutasProgreso from "./src/rutas/rutasProgreso.js";
import rutasPerfiles from "./src/rutas/rutasPerfiles.js";
import rutasContenido from "./src/rutas/rutasContenido.js";
import tmdbRutas from "./src/rutas/tmdbRutas.js";
import testRutas from "./src/rutas/testRutas.js";
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
app.use("/api/test", testRutas);
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
async function verificarTablas() {
  try {
    const connection = await pool.getConnection();
    
    // Verificar tabla usuarios
    const [usuarios] = await connection.execute('SHOW TABLES LIKE "usuarios"');
    if (usuarios.length === 0) {
      console.log('⚠️ Tabla usuarios no encontrada, creándola...');
      await connection.execute(`
        CREATE TABLE usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          nombre VARCHAR(100) NOT NULL,
          fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabla usuarios creada');
    }
    
    // Verificar tabla perfiles
    const [perfiles] = await connection.execute('SHOW TABLES LIKE "perfiles"');
    if (perfiles.length === 0) {
      console.log('⚠️ Tabla perfiles no encontrada, creándola...');
      await connection.execute(`
        CREATE TABLE perfiles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT NOT NULL,
          nombre VARCHAR(50) NOT NULL,
          avatar VARCHAR(255) DEFAULT 'perfil1.jpg',
          pin VARCHAR(4) DEFAULT NULL,
          es_ninos BOOLEAN DEFAULT FALSE,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Tabla perfiles creada');
    }
    
    // Verificar tabla mi_lista
    const [miLista] = await connection.execute('SHOW TABLES LIKE "mi_lista"');
    if (miLista.length === 0) {
      console.log('⚠️ Tabla mi_lista no encontrada, creándola...');
      await connection.execute(`
        CREATE TABLE mi_lista (
          id INT AUTO_INCREMENT PRIMARY KEY,
          perfil_id INT NOT NULL,
          contenido_id VARCHAR(50) NOT NULL,
          tipo_contenido ENUM('movie', 'tv') NOT NULL,
          fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (perfil_id) REFERENCES perfiles(id) ON DELETE CASCADE,
          UNIQUE KEY unique_contenido_perfil (perfil_id, contenido_id)
        )
      `);
      console.log('✅ Tabla mi_lista creada');
    }
    
    // Verificar tabla calificaciones
    const [calificaciones] = await connection.execute('SHOW TABLES LIKE "calificaciones"');
    if (calificaciones.length === 0) {
      console.log('⚠️ Tabla calificaciones no encontrada, creándola...');
      await connection.execute(`
        CREATE TABLE calificaciones (
          id INT AUTO_INCREMENT PRIMARY KEY,
          perfil_id INT NOT NULL,
          contenido_id VARCHAR(50) NOT NULL,
          tipo_contenido ENUM('movie', 'tv') NOT NULL,
          calificacion ENUM('like', 'dislike') NOT NULL,
          fecha_calificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (perfil_id) REFERENCES perfiles(id) ON DELETE CASCADE,
          UNIQUE KEY unique_calificacion_perfil (perfil_id, contenido_id)
        )
      `);
      console.log('✅ Tabla calificaciones creada');
    }
    
    connection.release();
    console.log('🗄️ Verificación de tablas completada');
    
  } catch (error) {
    console.error('❌ Error verificando tablas:', error);
  }
}

// Conectar a la base de datos y verificar tablas
pool.getConnection()
  .then(async (connection) => {
    console.log('🔗 Conectado a MySQL');
    
    // Verificar qué tablas existen
    const [tablas] = await connection.execute('SHOW TABLES');
    const nombresTablas = tablas.map(tabla => Object.values(tabla)[0]);
    console.log('📋 Tablas encontradas:', nombresTablas);
    
    if (nombresTablas.includes('usuarios')) {
      const [columnasUsuarios] = await connection.execute('SHOW COLUMNS FROM usuarios');
      console.log('✅ Tabla usuarios encontrada con columnas:', columnasUsuarios.map(col => col.Field));
    }
    
    if (nombresTablas.includes('mi_lista')) {
      const [columnasMiLista] = await connection.execute('SHOW COLUMNS FROM mi_lista');
      console.log('✅ Tabla mi_lista encontrada con columnas:', columnasMiLista.map(col => col.Field));
    }
    
    if (nombresTablas.includes('calificaciones')) {
      const [columnasCalificaciones] = await connection.execute('SHOW COLUMNS FROM calificaciones');
      console.log('✅ Tabla calificaciones encontrada con columnas:', columnasCalificaciones.map(col => col.Field));
    }
    
    if (nombresTablas.includes('perfiles')) {
      const [columnasPerfiles] = await connection.execute('SHOW COLUMNS FROM perfiles');
      console.log('✅ Tabla perfiles encontrada con columnas:', columnasPerfiles.map(col => col.Field));
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