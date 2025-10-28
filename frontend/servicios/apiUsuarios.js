// URL base de la API
const API_BASE_URL = "http://192.168.18.31:3000";

// Función para registrar un nuevo usuario
export const registrarUsuario = async (nombres, correo, contrasena) => {
  try {
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
    });

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
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        correo: correo,
        contrasena,
      }),
    });

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
    return {
      success: false,
      mensaje: error.message || "Error de conexión",
    };
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
    const response = await fetch(`${API_BASE_URL}/perfiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre,
        id_usuario,
      }),
    });

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
