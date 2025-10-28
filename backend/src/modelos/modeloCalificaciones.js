import pool from "../config/basedatos.js";

// Obtener todas las calificaciones de un perfil
export const obtenerCalificacionesPorPerfil = async (id_perfil) => {
  try {
    const [calificaciones] = await pool.execute(
      "SELECT * FROM calificaciones WHERE id_perfil = ? ORDER BY fecha_calificacion DESC",
      [id_perfil]
    );
    return calificaciones;
  } catch (error) {
    console.error("Error al obtener calificaciones:", error);
    throw error;
  }
};

// Obtener calificación específica de un contenido por perfil
export const obtenerCalificacion = async (id_perfil, id_contenido) => {
  try {
    const [calificaciones] = await pool.execute(
      "SELECT * FROM calificaciones WHERE id_perfil = ? AND id_contenido = ?",
      [id_perfil, id_contenido]
    );
    return calificaciones[0];
  } catch (error) {
    console.error("Error al obtener calificación:", error);
    throw error;
  }
};

// Crear o actualizar una calificación
export const calificarContenido = async (id_perfil, id_contenido, titulo, calificacion) => {
  try {
    const [resultado] = await pool.execute(
      `INSERT INTO calificaciones (id_perfil, id_contenido, titulo, calificacion) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       calificacion = VALUES(calificacion), 
       fecha_calificacion = CURRENT_TIMESTAMP`,
      [id_perfil, id_contenido, titulo, calificacion]
    );
    return resultado;
  } catch (error) {
    console.error("Error al calificar contenido:", error);
    throw error;
  }
};

// Eliminar una calificación
export const eliminarCalificacion = async (id_perfil, id_contenido) => {
  try {
    const [resultado] = await pool.execute(
      "DELETE FROM calificaciones WHERE id_perfil = ? AND id_contenido = ?",
      [id_perfil, id_contenido]
    );
    return resultado;
  } catch (error) {
    console.error("Error al eliminar calificación:", error);
    throw error;
  }
};

// Obtener estadísticas de calificaciones de un perfil
export const obtenerEstadisticasCalificaciones = async (id_perfil) => {
  try {
    const [estadisticas] = await pool.execute(
      `SELECT 
        COUNT(*) as total_calificaciones,
        AVG(calificacion) as promedio_calificaciones,
        MAX(calificacion) as calificacion_maxima,
        MIN(calificacion) as calificacion_minima
       FROM calificaciones 
       WHERE id_perfil = ?`,
      [id_perfil]
    );
    return estadisticas[0];
  } catch (error) {
    console.error("Error al obtener estadísticas de calificaciones:", error);
    throw error;
  }
};