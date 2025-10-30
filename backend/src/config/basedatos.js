import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "netflix_clone_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificar conexión y tabla
(async () => {
  try {
    const connection = await pool.getConnection();
    // console.log("✅ Conectado a MySQL (XAMPP)");
    
    // Verificar que la tabla usuarios existe con el esquema correcto
    const [resultado] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'netflix_clone_app' 
      AND TABLE_NAME = 'usuarios'
    `);
    
    // console.log("✅ Tabla usuarios encontrada con columnas:", resultado.map(col => col.COLUMN_NAME));
    
    // Verificar que la tabla perfiles existe
    const [resultadoPerfiles] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'netflix_clone_app' 
      AND TABLE_NAME = 'perfiles'
    `);
    
    if (resultadoPerfiles.length > 0) {
      // console.log("✅ Tabla perfiles encontrada con columnas:", resultadoPerfiles.map(col => col.COLUMN_NAME));
    } else {
      console.log("⚠️ Tabla perfiles no encontrada. Asegúrate de crearla.");
    }
    
    connection.release();
  } catch (error) {
    console.error("❌ Error conectando a la base de datos:", error);
  }
})();

export default pool;
