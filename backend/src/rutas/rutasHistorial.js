import express from "express";
import pool from "../config/basedatos.js";

const router = express.Router();

// ========================================
// OBTENER HISTORIAL DE UN PERFIL
// ========================================
router.get("/:idPerfil", async (req, res) => {
  try {
    const { idPerfil } = req.params;
    const { limite = 50 } = req.query;

    const [historial] = await pool.execute(
      `SELECT 
        id,
        id_contenido,
        titulo,
        imagen,
        tipo,
        porcentaje_visto,
        tiempo_reproducido,
        duracion_total,
        fecha_visto
      FROM historial
      WHERE id_perfil = ?
      ORDER BY fecha_visto DESC
      LIMIT ?`,
      [idPerfil, parseInt(limite)]
    );

    res.json({
      success: true,
      data: { historial },
    });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener historial",
    });
  }
});

// ========================================
// AGREGAR O ACTUALIZAR HISTORIAL
// ========================================
router.post("/agregar", async (req, res) => {
  try {
    const {
      idPerfil,
      idContenido,
      titulo,
      imagen,
      tipo,
      porcentajeVisto = 0,
      tiempoReproducido = 0,
      duracionTotal = 0,
      fuente = 'desconocido' // Nuevo campo para identificar la fuente
    } = req.body;

    console.log(`🔍 [${fuente.toUpperCase()}] Solicitud de historial:`, {
      fuente,
      idPerfil,
      idContenido,
      titulo,
      tipo,
      porcentajeVisto
    });

    // Validaciones
    if (!idPerfil || !idContenido || !titulo || !tipo) {
      return res.status(400).json({
        success: false,
        mensaje: "Faltan campos requeridos",
      });
    }

    // Normalizar el tipo a los valores correctos de la base de datos
    let tipoNormalizado;
    if (tipo === 'tv' || tipo === 'serie') {
      tipoNormalizado = 'serie';
    } else if (tipo === 'movie' || tipo === 'pelicula') {
      tipoNormalizado = 'pelicula';
    } else {
      // Si viene con prefijo en el idContenido, usar eso como referencia
      if (typeof idContenido === 'string' && idContenido.includes('_')) {
        const partes = idContenido.split('_');
        if (partes.length === 2) {
          tipoNormalizado = partes[0] === 'tv' ? 'serie' : 'pelicula';
        } else {
          tipoNormalizado = 'pelicula'; // Por defecto
        }
      } else {
        tipoNormalizado = 'pelicula'; // Por defecto
      }
    }

    // Extraer ID numérico del ID compuesto si es necesario
    let idNumerico = idContenido;
    if (typeof idContenido === 'string' && idContenido.includes('_')) {
      const partes = idContenido.split('_');
      if (partes.length === 2 && (partes[0] === 'movie' || partes[0] === 'tv')) {
        idNumerico = partes[1];
      }
    }

    // IMPORTANTE: Siempre guardar solo el ID numérico, sin prefijos
    const idParaGuardar = idNumerico;

    console.log(`🔍 Buscando duplicados para: ${titulo} (Perfil: ${idPerfil}, ID base: ${idNumerico}, Tipo: ${tipoNormalizado})`);

    // Buscar duplicados por ID base del contenido (sin importar el prefijo)
    const [existentePorId] = await pool.execute(
      `SELECT id, id_contenido, tipo, titulo FROM historial 
       WHERE id_perfil = ? AND (
         id_contenido = ? OR 
         id_contenido = ? OR 
         id_contenido = CONCAT('movie_', ?) OR 
         id_contenido = CONCAT('tv_', ?) OR
         id_contenido = ?
       )`,
      [idPerfil, idContenido, idNumerico, idNumerico, idNumerico, `${idNumerico}`]
    );

    // También buscar por título y perfil como respaldo
    const [existentePorTitulo] = await pool.execute(
      `SELECT id, id_contenido, tipo, titulo FROM historial 
       WHERE id_perfil = ? AND titulo = ?`,
      [idPerfil, titulo]
    );

    // Priorizar búsqueda por ID base, luego por título
    const existente = existentePorId.length > 0 ? existentePorId : existentePorTitulo;

    if (existente.length > 0) {
      console.log(`✅ Actualizando registro existente: ${existente[0].titulo} (ID: ${existente[0].id})`);
      // Si existe, actualizar la entrada existente
      await pool.execute(
        `UPDATE historial 
        SET id_contenido = ?,
            imagen = ?,
            tipo = ?,
            porcentaje_visto = ?,
            tiempo_reproducido = ?,
            duracion_total = ?,
            fecha_visto = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          idParaGuardar, // Guardar solo el ID numérico
          imagen,
          tipoNormalizado, // Usar el tipo normalizado
          porcentajeVisto,
          tiempoReproducido,
          duracionTotal,
          existente[0].id,
        ]
      );

      res.json({
        success: true,
        mensaje: "Historial actualizado",
        data: { id: existente[0].id },
      });
    } else {
      console.log(`➕ Insertando nuevo registro: ${titulo} (Tipo: ${tipoNormalizado})`);
      // Insertar nuevo
      const [resultado] = await pool.execute(
        `INSERT INTO historial 
        (id_perfil, id_contenido, titulo, imagen, tipo, porcentaje_visto, tiempo_reproducido, duracion_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          idPerfil,
          idParaGuardar, // Guardar solo el ID numérico
          titulo,
          imagen,
          tipoNormalizado, // Usar el tipo normalizado
          porcentajeVisto,
          tiempoReproducido,
          duracionTotal,
        ]
      );

      res.json({
        success: true,
        mensaje: "Agregado al historial",
        data: { id: resultado.insertId },
      });
    }
  } catch (error) {
    console.error("Error al agregar al historial:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al agregar al historial",
    });
  }
});

// ========================================
// ELIMINAR DEL HISTORIAL
// ========================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute("DELETE FROM historial WHERE id = ?", [id]);

    res.json({
      success: true,
      mensaje: "Eliminado del historial",
    });
  } catch (error) {
    console.error("Error al eliminar del historial:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al eliminar del historial",
    });
  }
});

// ========================================
// LIMPIAR TODO EL HISTORIAL DE UN PERFIL
// ========================================
router.delete("/perfil/:idPerfil", async (req, res) => {
  try {
    const { idPerfil } = req.params;

    await pool.execute("DELETE FROM historial WHERE id_perfil = ?", [idPerfil]);

    res.json({
      success: true,
      mensaje: "Historial limpiado",
    });
  } catch (error) {
    console.error("Error al limpiar historial:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al limpiar historial",
    });
  }
});

export default router;
