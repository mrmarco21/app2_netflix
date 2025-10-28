import pool from "../config/basedatos.js";

// Crear un nuevo perfil
export const crearPerfil = async (nombre, id_usuario) => {
  try {
    const [resultado] = await pool.execute(
      "INSERT INTO perfiles (nombre, id_usuario) VALUES (?, ?)",
      [nombre, id_usuario]
    );
    return resultado;
  } catch (error) {
    console.error("Error al crear perfil:", error);
    throw error;
  }
};

// Obtener perfiles por usuario
export const obtenerPerfilesPorUsuario = async (id_usuario) => {
  try {
    const [perfiles] = await pool.execute(
      "SELECT * FROM perfiles WHERE id_usuario = ?",
      [id_usuario]
    );
    return perfiles;
  } catch (error) {
    console.error("Error al obtener perfiles:", error);
    throw error;
  }
};

// Actualizar un perfil
export const actualizarPerfil = async (id, nombre) => {
  try {
    const [resultado] = await pool.execute(
      "UPDATE perfiles SET nombre = ? WHERE id = ?",
      [nombre, id]
    );
    return resultado;
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    throw error;
  }
};

// Actualizar PIN de un perfil
export const actualizarPinPerfil = async (id, pin) => {
  try {
    const [resultado] = await pool.execute(
      "UPDATE perfiles SET pin = ? WHERE id = ?",
      [pin, id]
    );
    return resultado;
  } catch (error) {
    console.error("Error al actualizar PIN del perfil:", error);
    throw error;
  }
};

// Verificar PIN de un perfil
export const verificarPinPerfil = async (id, pin) => {
  try {
    const [perfiles] = await pool.execute(
      "SELECT pin FROM perfiles WHERE id = ?",
      [id]
    );
    
    if (perfiles.length === 0) {
      return { valido: false, mensaje: 'Perfil no encontrado' };
    }
    
    const perfilPin = perfiles[0].pin;
    
    // Si el perfil no tiene PIN configurado, permitir acceso
    if (!perfilPin) {
      return { valido: true, mensaje: 'Perfil sin PIN' };
    }
    
    // Verificar si el PIN coincide
    if (perfilPin === pin) {
      return { valido: true, mensaje: 'PIN correcto' };
    } else {
      return { valido: false, mensaje: 'PIN incorrecto' };
    }
  } catch (error) {
    console.error("Error al verificar PIN del perfil:", error);
    throw error;
  }
};

// Eliminar un perfil
export const eliminarPerfil = async (id) => {
  try {
    const [resultado] = await pool.execute(
      "DELETE FROM perfiles WHERE id = ?",
      [id]
    );
    return resultado;
  } catch (error) {
    console.error("Error al eliminar perfil:", error);
    throw error;
  }
};

// Obtener un perfil por ID
export const obtenerPerfilPorId = async (id) => {
  try {
    const [perfiles] = await pool.execute(
      "SELECT * FROM perfiles WHERE id = ?",
      [id]
    );
    return perfiles[0];
  } catch (error) {
    console.error("Error al obtener perfil por ID:", error);
    throw error;
  }
};