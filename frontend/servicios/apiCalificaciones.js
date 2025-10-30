const BASE_URL = 'http://192.168.56.1:3000';

// Obtener todas las calificaciones de un perfil
export const obtenerCalificacionesPorPerfil = async (idPerfil) => {
  try {
    const response = await fetch(`${BASE_URL}/calificaciones/perfil/${idPerfil}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al obtener calificaciones');
    }
    
    return data.calificaciones;
  } catch (error) {
    console.error('Error al obtener calificaciones:', error);
    throw error;
  }
};

// Obtener calificación específica de un contenido
export const obtenerCalificacion = async (idPerfil, idContenido) => {
  try {
    const response = await fetch(`${BASE_URL}/calificaciones/perfil/${idPerfil}/contenido/${idContenido}`);
    const data = await response.json();
    
    if (response.status === 404) {
      return null; // No hay calificación
    }
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al obtener calificación');
    }
    
    return data.calificacion;
  } catch (error) {
    console.error('Error al obtener calificación:', error);
    return null;
  }
};

// Calificar contenido
export const calificarContenido = async (idPerfil, contenido, calificacion) => {
  try {
    const response = await fetch(`${BASE_URL}/calificaciones/calificar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_perfil: idPerfil,
        id_contenido: contenido.id.toString(),
        titulo: contenido.titulo || contenido.title || contenido.name,
        calificacion: calificacion
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al calificar contenido');
    }
    
    return data;
  } catch (error) {
    console.error('Error al calificar contenido:', error);
    throw error;
  }
};

// Eliminar calificación
export const eliminarCalificacion = async (idPerfil, idContenido) => {
  try {
    const response = await fetch(`${BASE_URL}/calificaciones/eliminar/${idPerfil}/${idContenido}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al eliminar calificación');
    }
    
    return data;
  } catch (error) {
    console.error('Error al eliminar calificación:', error);
    throw error;
  }
};