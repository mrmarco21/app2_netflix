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

// Actualizar PIN de un perfil
export const actualizarPinPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;

    // Validaciones
    if (pin !== null && pin !== undefined) {
      // Si se proporciona un PIN, validar que sea de 4 dígitos
      if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({
          mensaje: 'El PIN debe ser exactamente 4 dígitos numéricos'
        });
      }
    }

    // Verificar que el perfil existe
    const perfilExistente = await modeloPerfil.obtenerPerfilPorId(id);
    if (!perfilExistente) {
      return res.status(404).json({
        mensaje: 'Perfil no encontrado'
      });
    }

    await modeloPerfil.actualizarPinPerfil(id, pin);

    res.status(200).json({
      mensaje: pin ? 'PIN configurado exitosamente' : 'PIN eliminado exitosamente',
      perfil: {
        id: parseInt(id),
        nombre: perfilExistente.nombre,
        id_usuario: perfilExistente.id_usuario,
        tienePIN: !!pin
      }
    });
  } catch (error) {
    console.error('Error al actualizar PIN del perfil:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};

// Verificar PIN de un perfil
export const verificarPinPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({
        mensaje: 'El PIN es requerido'
      });
    }

    if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        mensaje: 'El PIN debe ser exactamente 4 dígitos numéricos'
      });
    }

    const resultado = await modeloPerfil.verificarPinPerfil(id, pin);

    if (resultado.valido) {
      res.status(200).json({
        mensaje: 'PIN verificado exitosamente',
        acceso: true
      });
    } else {
      res.status(401).json({
        mensaje: resultado.mensaje,
        acceso: false
      });
    }
  } catch (error) {
    console.error('Error al verificar PIN del perfil:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor'
    });
  }
};