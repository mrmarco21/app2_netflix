import pool from "../config/basedatos.js";
import bcrypt from "bcrypt"

// Registrar usuario
export const registrarUsuario = async (req, res) => {
  const { nombres, correo, contrasena } = req.body;

  try {
    // Verificar si el usuario ya existe
    const [resultado] = await pool.execute("SELECT * FROM usuarios WHERE correo = ?", [correo]);

    if (resultado.length > 0) {
      return res.status(400).json({
        success: false,
        mensaje: "El usuario ya existe con este correo"
      });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

    // Crear nuevo usuario
    const [resultadoInsertar] = await pool.execute(
      "INSERT INTO usuarios (nombres, correo, contrasena) VALUES (?, ?, ?)",
      [nombres, correo, contrasenaEncriptada]
    );

    res.status(201).json({
      success: true,
      mensaje: "Usuario registrado exitosamente",
      usuario: {
        id: resultadoInsertar.insertId,
        nombres,
        correo: correo
      }
    });
  } catch (err) {
    console.error("Error al registrar usuario:", err);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor",
      error: err.message
    });
  }
};

// Login usuario
export const loginUsuario = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    // Buscar usuario por correo
    const [usuarioExiste] = await pool.execute(
      "SELECT id, nombres, correo, contrasena FROM usuarios WHERE correo = ?", 
      [correo]
    );

    if (usuarioExiste.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "El usuario no existe. Por favor, verifica el correo o regístrate."
      });
    }

    const usuario = usuarioExiste[0];

    // Comparar la contraseña ingresada con la encriptada
    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!coincide) {
      return res.status(401).json({
        success: false,
        mensaje: "Contraseña incorrecta. Inténtalo nuevamente."
      });
    }

    // Si todo está correcto
    res.status(200).json({
      success: true,
      mensaje: "Inicio de sesión exitoso",
      usuario: {
        id: usuario.id,
        nombres: usuario.nombres,
        correo: usuario.correo
      }
    });

  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor",
      error: err.message
    });
  }
};

// Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const [resultado] = await pool.execute("SELECT id, nombres, correo FROM usuarios");

    res.status(200).json({
      success: true,
      usuarios: resultado
    });
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor",
      error: err.message
    });
  }
};

// Actualizar correo del usuario
export const actualizarCorreo = async (req, res) => {
  const { id } = req.params;
  const { correo } = req.body;

  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({
      success: false,
      mensaje: "Correo inválido",
    });
  }

  try {
    // Verificar si el correo ya está en uso por otro usuario
    const [existeCorreo] = await pool.execute(
      "SELECT id FROM usuarios WHERE correo = ? AND id <> ?",
      [correo, id]
    );

    if (existeCorreo.length > 0) {
      return res.status(409).json({
        success: false,
        mensaje: "El correo ya está registrado por otro usuario",
      });
    }

    const [resultado] = await pool.execute(
      "UPDATE usuarios SET correo = ? WHERE id = ?",
      [correo, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Usuario no encontrado",
      });
    }

    // Devolver usuario actualizado
    const [filas] = await pool.execute(
      "SELECT id, nombres, correo FROM usuarios WHERE id = ?",
      [id]
    );

    res.status(200).json({
      success: true,
      mensaje: "Correo actualizado exitosamente",
      usuario: filas[0],
    });
  } catch (err) {
    console.error("Error al actualizar correo:", err);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor",
      error: err.message,
    });
  }
};

// Actualizar contraseña del usuario
export const actualizarContrasena = async (req, res) => {
  const { id } = req.params;
  const { contrasenaActual, nuevaContrasena } = req.body;

  if (!nuevaContrasena || nuevaContrasena.length < 5) {
    return res.status(400).json({
      success: false,
      mensaje: "La nueva contraseña debe tener al menos 5 caracteres",
    });
  }

  try {
    // Obtener contraseña actual
    const [filas] = await pool.execute(
      "SELECT contrasena FROM usuarios WHERE id = ?",
      [id]
    );

    if (filas.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Usuario no encontrado",
      });
    }

    // Validar contraseña actual si se envía
    if (contrasenaActual) {
      const coincide = await bcrypt.compare(contrasenaActual, filas[0].contrasena);
      if (!coincide) {
        return res.status(401).json({
          success: false,
          mensaje: "La contraseña actual es incorrecta",
        });
      }
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(nuevaContrasena, salt);

    const [resultado] = await pool.execute(
      "UPDATE usuarios SET contrasena = ? WHERE id = ?",
      [contrasenaEncriptada, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      mensaje: "Contraseña actualizada exitosamente",
    });
  } catch (err) {
    console.error("Error al actualizar contraseña:", err);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor",
      error: err.message,
    });
  }
};

// Recuperar contraseña por correo (sin requerir la contraseña actual)
export const recuperarContrasenaPorCorreo = async (req, res) => {
  const { correo, nuevaContrasena } = req.body;

  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({
      success: false,
      mensaje: "Correo inválido",
    });
  }

  if (!nuevaContrasena || nuevaContrasena.length < 5) {
    return res.status(400).json({
      success: false,
      mensaje: "La nueva contraseña debe tener al menos 5 caracteres",
    });
  }

  try {
    // Verificar que el usuario exista por correo
    const [filas] = await pool.execute(
      "SELECT id FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (filas.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Usuario no encontrado",
      });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(nuevaContrasena, salt);

    const [resultado] = await pool.execute(
      "UPDATE usuarios SET contrasena = ? WHERE correo = ?",
      [contrasenaEncriptada, correo]
    );

    if (resultado.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        mensaje: "No se pudo actualizar la contraseña",
      });
    }

    res.status(200).json({
      success: true,
      mensaje: "Contraseña actualizada exitosamente",
    });
  } catch (err) {
    console.error("Error al recuperar contraseña por correo:", err);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor",
      error: err.message,
    });
  }
};

// Eliminar usuario y datos asociados (cascada por FK)
export const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar existencia
    const [filas] = await pool.execute(
      "SELECT id FROM usuarios WHERE id = ?",
      [id]
    );

    if (filas.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Usuario no encontrado",
      });
    }

    // Eliminar usuario (las FK en perfiles tienen ON DELETE CASCADE)
    const [resultado] = await pool.execute(
      "DELETE FROM usuarios WHERE id = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        mensaje: "No se pudo eliminar el usuario",
      });
    }

    return res.status(200).json({
      success: true,
      mensaje: "Usuario eliminado exitosamente",
    });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor",
      error: err.message,
    });
  }
};
