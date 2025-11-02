// Importar configuración automática que detecta PC vs móvil
import { API_BASE_URL } from './config.js';

// Función para registrar un nuevo usuario
export const registrarUsuario = async (nombres, correo, contrasena) => {
  try {
    // Agregar timeout para mejorar experiencia en móvil
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s

    const response = await fetch(`${API_BASE_URL}/usuarios/registro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombres,
        correo,
        contrasena: contrasena,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al registrar usuario");
    }

    return {
      success: true,
      data: data,
      mensaje: data.mensaje || "Usuario registrado exitosamente",
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        mensaje: "Tiempo de espera agotado. Verifica tu conexión a internet.",
      };
    }
    return {
      success: false,
      mensaje: error.message || "Error de conexión",
    };
  }
};

// Función para actualizar el PIN de un perfil
export const actualizarPinPerfil = async (perfilId, pin) => {
  try {
    const response = await fetch(`${API_BASE_URL}/perfiles/${perfilId}/pin`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al actualizar PIN");
    }

    return {
      success: true,
      data: data,
      mensaje: data.mensaje || "PIN actualizado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      mensaje: error.message || "Error de conexión",
    };
  }
};

// Función para verificar el PIN de un perfil
export const verificarPinPerfil = async (perfilId, pin) => {
  try {
    const response = await fetch(`${API_BASE_URL}/perfiles/${perfilId}/verificar-pin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al verificar PIN");
    }

    return {
      success: true,
      data: data,
      mensaje: data.mensaje || "PIN verificado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      mensaje: error.message || "Error de conexión",
    };
  }
};

// Función para iniciar sesión
export const loginUsuario = async (correo, contrasena) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s

    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        correo: correo,
        contrasena,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al iniciar sesión");
    }

    return {
      success: true,
      data: data,
      mensaje: data.mensaje || "Inicio de sesión exitoso",
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        mensaje: "Tiempo de espera agotado. Verifica tu conexión a internet.",
      };
    }
    return {
      success: false,
      mensaje: error.message || "Error de conexión",
    };
  }
};

// Actualizar correo del usuario
export const actualizarCorreoUsuario = async (idUsuario, nuevoCorreo) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${API_BASE_URL}/usuarios/${idUsuario}/correo`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo: nuevoCorreo }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al actualizar correo");
    }

    return {
      success: true,
      data,
      mensaje: data.mensaje || "Correo actualizado exitosamente",
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, mensaje: "Tiempo de espera agotado. Verifica tu conexión." };
    }
    return { success: false, mensaje: error.message || "Error de conexión" };
  }
};

// Actualizar contraseña del usuario
export const actualizarContrasenaUsuario = async (idUsuario, contrasenaActual, nuevaContrasena) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${API_BASE_URL}/usuarios/${idUsuario}/contrasena`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contrasenaActual, nuevaContrasena }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al actualizar contraseña");
    }

    return {
      success: true,
      data,
      mensaje: data.mensaje || "Contraseña actualizada exitosamente",
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, mensaje: "Tiempo de espera agotado. Verifica tu conexión." };
    }
    return { success: false, mensaje: error.message || "Error de conexión" };
  }
};

// Recuperar contraseña por correo (sin requerir contraseña actual)
export const recuperarContrasenaPorCorreo = async (correo, nuevaContrasena) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${API_BASE_URL}/usuarios/recuperar-contrasena`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, nuevaContrasena }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.mensaje || "Error al recuperar contraseña");
    }

    return {
      success: true,
      data,
      mensaje: data.mensaje || "Contraseña actualizada exitosamente",
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, mensaje: "Tiempo de espera agotado. Verifica tu conexión." };
    }
    console.error("Error en recuperarContrasenaPorCorreo:", error);
    return { success: false, mensaje: error.message || "Error de conexión" };
  }
};

// Eliminar usuario
export const eliminarUsuario = async (idUsuario) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${API_BASE_URL}/usuarios/${idUsuario}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al eliminar usuario");
    }

    return { success: true, data, mensaje: data.mensaje || "Usuario eliminado" };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, mensaje: "Tiempo de espera agotado. Verifica tu conexión." };
    }
    return { success: false, mensaje: error.message || "Error de conexión" };
  }
};

// Función para obtener todos los usuarios (opcional, para pruebas)
export const obtenerUsuarios = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al obtener usuarios");
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      mensaje: error.message || "Error de conexión",
    };
  }
};

// ===== FUNCIONES PARA PERFILES =====

// Función para crear un nuevo perfil
export const crearPerfil = async (nombre, id_usuario) => {
  try {
    // Crear un timeout para evitar que se cuelgue en móvil
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    const response = await fetch(`${API_BASE_URL}/perfiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre,
        id_usuario,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al crear perfil");
    }

    return {
      success: true,
      data: data,
      mensaje: data.mensaje || "Perfil creado exitosamente",
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        mensaje: "Tiempo de espera agotado. Verifica tu conexión a internet.",
      };
    }
    return {
      success: false,
      mensaje: error.message || "Error de conexión",
    };
  }
};

// Función para obtener perfiles de un usuario
export const obtenerPerfilesPorUsuario = async (id_usuario) => {
  try {
    const response = await fetch(`${API_BASE_URL}/perfiles/usuario/${id_usuario}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al obtener perfiles");
    }

    return {
      success: true,
      data: data,
      mensaje: data.mensaje || "Perfiles obtenidos exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      mensaje: error.message || "Error de conexión",
    };
  }
};

// Función para actualizar un perfil
export const actualizarPerfil = async (id, nombre) => {
  try {
    const response = await fetch(`${API_BASE_URL}/perfiles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al actualizar perfil");
    }

    return {
      success: true,
      data: data,
      mensaje: data.mensaje || "Perfil actualizado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      mensaje: error.message || "Error de conexión",
    };
  }
};

// Función para eliminar un perfil
export const eliminarPerfil = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/perfiles/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al eliminar perfil");
    }

    return {
      success: true,
      data: data,
      mensaje: data.mensaje || "Perfil eliminado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      mensaje: error.message || "Error de conexión",
    };
  }
};
