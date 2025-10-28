import * as modeloMiLista from '../modelos/modeloMiLista.js';

// Obtener la lista personal de un perfil
export const obtenerMiLista = async (req, res) => {
  try {
    const { id_perfil } = req.params;
    
    console.log('📋 Obteniendo Mi Lista para perfil:', id_perfil);

    if (!id_perfil) {
      console.log('❌ ID de perfil no proporcionado');
      return res.status(400).json({
        mensaje: 'El ID del perfil es requerido'
      });
    }

    const lista = await modeloMiLista.obtenerMiLista(id_perfil);
    
    console.log('✅ Mi Lista obtenida exitosamente:', lista.length, 'elementos');

    res.status(200).json({
      mensaje: 'Mi Lista obtenida exitosamente',
      lista
    });
  } catch (error) {
    console.error('❌ Error al obtener Mi Lista:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Agregar contenido a Mi Lista
export const agregarAMiLista = async (req, res) => {
  try {
    const { id_perfil, id_contenido, titulo, imagen, tipo } = req.body;

    // Validaciones
    if (!id_perfil || !id_contenido || !titulo || !tipo) {
      return res.status(400).json({
        mensaje: 'ID del perfil, ID del contenido, título y tipo son requeridos'
      });
    }

    if (!['pelicula', 'serie'].includes(tipo)) {
      return res.status(400).json({
        mensaje: 'El tipo debe ser "pelicula" o "serie"'
      });
    }

    const resultado = await modeloMiLista.agregarAMiLista(id_perfil, id_contenido, titulo, imagen, tipo);

    res.status(201).json({
      mensaje: 'Contenido agregado a Mi Lista exitosamente',
      id: resultado.insertId
    });
  } catch (error) {
    console.error('Error al agregar a Mi Lista:', error);
    
    if (error.message === 'El contenido ya está en Mi Lista') {
      return res.status(409).json({
        mensaje: 'El contenido ya está en Mi Lista'
      });
    }

    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

// Quitar contenido de Mi Lista
export const quitarDeMiLista = async (req, res) => {
  try {
    const { id_perfil, id_contenido } = req.params;

    if (!id_perfil || !id_contenido) {
      return res.status(400).json({
        mensaje: 'ID del perfil e ID del contenido son requeridos'
      });
    }

    const resultado = await modeloMiLista.quitarDeMiLista(id_perfil, id_contenido);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'El contenido no se encontró en Mi Lista'
      });
    }

    res.status(200).json({
      mensaje: 'Contenido eliminado de Mi Lista exitosamente'
    });
  } catch (error) {
    console.error('Error al quitar de Mi Lista:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

// Verificar si un contenido está en Mi Lista
export const verificarEnMiLista = async (req, res) => {
  try {
    const { id_perfil, id_contenido } = req.params;

    if (!id_perfil || !id_contenido) {
      return res.status(400).json({
        mensaje: 'ID del perfil e ID del contenido son requeridos'
      });
    }

    const existe = await modeloMiLista.verificarEnMiLista(id_perfil, id_contenido);

    res.status(200).json({
      mensaje: 'Verificación completada',
      enMiLista: existe
    });
  } catch (error) {
    console.error('Error al verificar en Mi Lista:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

// Actualizar un elemento específico de Mi Lista
export const actualizarElementoMiLista = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    if (!id) {
      return res.status(400).json({
        mensaje: 'ID del elemento es requerido'
      });
    }

    // Validar tipo si se está actualizando
    if (datosActualizacion.tipo && !['pelicula', 'serie'].includes(datosActualizacion.tipo)) {
      return res.status(400).json({
        mensaje: 'El tipo debe ser "pelicula" o "serie"'
      });
    }

    const resultado = await modeloMiLista.actualizarElementoMiLista(id, datosActualizacion);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Elemento no encontrado en Mi Lista'
      });
    }

    res.status(200).json({
      mensaje: 'Elemento actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar elemento de Mi Lista:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};