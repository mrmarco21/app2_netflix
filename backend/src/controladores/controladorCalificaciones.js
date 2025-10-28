import * as modeloCalificaciones from '../modelos/modeloCalificaciones.js';

// Obtener todas las calificaciones de un perfil
export const obtenerCalificacionesPorPerfil = async (req, res) => {
  try {
    const { id_perfil } = req.params;

    if (!id_perfil) {
      return res.status(400).json({
        mensaje: 'El ID del perfil es requerido'
      });
    }

    const calificaciones = await modeloCalificaciones.obtenerCalificacionesPorPerfil(id_perfil);

    res.status(200).json({
      mensaje: 'Calificaciones obtenidas exitosamente',
      calificaciones
    });
  } catch (error) {
    console.error('Error al obtener calificaciones:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

// Obtener calificación específica de un contenido por perfil
export const obtenerCalificacion = async (req, res) => {
  try {
    const { id_perfil, id_contenido } = req.params;

    if (!id_perfil || !id_contenido) {
      return res.status(400).json({
        mensaje: 'ID del perfil e ID del contenido son requeridos'
      });
    }

    const calificacion = await modeloCalificaciones.obtenerCalificacion(id_perfil, id_contenido);

    if (!calificacion) {
      return res.status(404).json({
        mensaje: 'No se encontró calificación para este contenido'
      });
    }

    res.status(200).json({
      mensaje: 'Calificación obtenida exitosamente',
      calificacion
    });
  } catch (error) {
    console.error('Error al obtener calificación:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

// Crear o actualizar una calificación
export const calificarContenido = async (req, res) => {
  try {
    const { id_perfil, id_contenido, titulo, calificacion } = req.body;

    // Validaciones
    if (!id_perfil || !id_contenido || !titulo || !calificacion) {
      return res.status(400).json({
        mensaje: 'ID del perfil, ID del contenido, título y calificación son requeridos'
      });
    }

    if (calificacion < 1 || calificacion > 5 || !Number.isInteger(calificacion)) {
      return res.status(400).json({
        mensaje: 'La calificación debe ser un número entero entre 1 y 5'
      });
    }

    const resultado = await modeloCalificaciones.calificarContenido(id_perfil, id_contenido, titulo, calificacion);

    res.status(200).json({
      mensaje: 'Contenido calificado exitosamente',
      calificacion: {
        id_perfil,
        id_contenido,
        titulo,
        calificacion
      }
    });
  } catch (error) {
    console.error('Error al calificar contenido:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

// Eliminar una calificación
export const eliminarCalificacion = async (req, res) => {
  try {
    const { id_perfil, id_contenido } = req.params;

    if (!id_perfil || !id_contenido) {
      return res.status(400).json({
        mensaje: 'ID del perfil e ID del contenido son requeridos'
      });
    }

    const resultado = await modeloCalificaciones.eliminarCalificacion(id_perfil, id_contenido);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'No se encontró calificación para eliminar'
      });
    }

    res.status(200).json({
      mensaje: 'Calificación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar calificación:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};