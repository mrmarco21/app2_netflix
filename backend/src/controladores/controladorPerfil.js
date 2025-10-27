import * as modeloPerfil from '../modelos/modeloPerfil.js';

// Crear un nuevo perfil
export const crearPerfil = async (req, res) => {
  try {
    const { nombre, id_usuario } = req.body;

    // Validaciones
    if (!nombre || !id_usuario) {
      return res.status(400).json({
        mensaje: 'El nombre y el ID de usuario son requeridos'
      });
    }

    if (nombre.length > 50) {
      return res.status(400).json({
        mensaje: 'El nombre del perfil no puede exceder 50 caracteres'
      });
    }

    // Verificar cuántos perfiles tiene el usuario (máximo 5)
    const perfilesExistentes = await modeloPerfil.obtenerPerfilesPorUsuario(id_usuario);
    if (perfilesExistentes.length >= 5) {
      return res.status(400).json({
        mensaje: 'No puedes tener más de 5 perfiles por cuenta'
      });
    }

    const resultado = await modeloPerfil.crearPerfil(nombre, id_usuario);

    res.status(201).json({
      mensaje: 'Perfil creado exitosamente',
      perfil: {
        id: resultado.insertId,
        nombre,
        id_usuario
      }
    });
  } catch (error) {
    console.error('Error al crear perfil:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

// Obtener todos los perfiles de un usuario
export const obtenerPerfilesPorUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    if (!id_usuario) {
      return res.status(400).json({
        mensaje: 'El ID de usuario es requerido'
      });
    }

    const perfiles = await modeloPerfil.obtenerPerfilesPorUsuario(id_usuario);

    res.status(200).json({
      mensaje: 'Perfiles obtenidos exitosamente',
      perfiles
    });
  } catch (error) {
    console.error('Error al obtener perfiles:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

// Actualizar un perfil
export const actualizarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({
        mensaje: 'El nombre es requerido'
      });
    }

    if (nombre.length > 50) {
      return res.status(400).json({
        mensaje: 'El nombre del perfil no puede exceder 50 caracteres'
      });
    }

    // Verificar que el perfil existe
    const perfilExistente = await modeloPerfil.obtenerPerfilPorId(id);
    if (!perfilExistente) {
      return res.status(404).json({
        mensaje: 'Perfil no encontrado'
      });
    }

    await modeloPerfil.actualizarPerfil(id, nombre);

    res.status(200).json({
      mensaje: 'Perfil actualizado exitosamente',
      perfil: {
        id: parseInt(id),
        nombre,
        id_usuario: perfilExistente.id_usuario
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

// Eliminar un perfil
export const eliminarPerfil = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el perfil existe
    const perfilExistente = await modeloPerfil.obtenerPerfilPorId(id);
    if (!perfilExistente) {
      return res.status(404).json({
        mensaje: 'Perfil no encontrado'
      });
    }

    // Verificar que no sea el único perfil del usuario
    const perfilesUsuario = await modeloPerfil.obtenerPerfilesPorUsuario(perfilExistente.id_usuario);
    if (perfilesUsuario.length <= 1) {
      return res.status(400).json({
        mensaje: 'No puedes eliminar el único perfil de la cuenta'
      });
    }

    await modeloPerfil.eliminarPerfil(id);

    res.status(200).json({
      mensaje: 'Perfil eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar perfil:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};