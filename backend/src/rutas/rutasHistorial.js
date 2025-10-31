import express from 'express';
import pool from '../config/basedatos.js';

const router = express.Router();

// ========================================
// OBTENER HISTORIAL DE UN PERFIL
// ========================================
router.get('/:idPerfil', async (req, res) => {
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
      data: { historial }
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener historial'
    });
  }
});

// ========================================
// AGREGAR O ACTUALIZAR HISTORIAL
// ========================================
router.post('/agregar', async (req, res) => {
  try {
    const {
      idPerfil,
      idContenido,
      titulo,
      imagen,
      tipo,
      porcentajeVisto = 0,
      tiempoReproducido = 0,
      duracionTotal = 0
    } = req.body;

    // Validaciones
    if (!idPerfil || !idContenido || !titulo || !tipo) {
      return res.status(400).json({
        success: false,
        mensaje: 'Faltan campos requeridos'
      });
    }

    // Verificar si ya existe en el historial
    const [existente] = await pool.execute(
      'SELECT id FROM historial WHERE id_perfil = ? AND id_contenido = ?',
      [idPerfil, idContenido]
    );

    if (existente.length > 0) {
      // Actualizar existente
      await pool.execute(
        `UPDATE historial 
        SET porcentaje_visto = ?,
            tiempo_reproducido = ?,
            duracion_total = ?,
            fecha_visto = CURRENT_TIMESTAMP
        WHERE id_perfil = ? AND id_contenido = ?`,
        [porcentajeVisto, tiempoReproducido, duracionTotal, idPerfil, idContenido]
      );

      res.json({
        success: true,
        mensaje: 'Historial actualizado',
        data: { id: existente[0].id }
      });
    } else {
      // Insertar nuevo
      const [resultado] = await pool.execute(
        `INSERT INTO historial 
        (id_perfil, id_contenido, titulo, imagen, tipo, porcentaje_visto, tiempo_reproducido, duracion_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [idPerfil, idContenido, titulo, imagen, tipo, porcentajeVisto, tiempoReproducido, duracionTotal]
      );

      res.json({
        success: true,
        mensaje: 'Agregado al historial',
        data: { id: resultado.insertId }
      });
    }
  } catch (error) {
    console.error('Error al agregar al historial:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al agregar al historial'
    });
  }
});

// ========================================
// ELIMINAR DEL HISTORIAL
// ========================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'DELETE FROM historial WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      mensaje: 'Eliminado del historial'
    });
  } catch (error) {
    console.error('Error al eliminar del historial:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar del historial'
    });
  }
});

// ========================================
// LIMPIAR TODO EL HISTORIAL DE UN PERFIL
// ========================================
router.delete('/perfil/:idPerfil', async (req, res) => {
  try {
    const { idPerfil } = req.params;

    await pool.execute(
      'DELETE FROM historial WHERE id_perfil = ?',
      [idPerfil]
    );

    res.json({
      success: true,
      mensaje: 'Historial limpiado'
    });
  } catch (error) {
    console.error('Error al limpiar historial:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al limpiar historial'
    });
  }
});

export default router;