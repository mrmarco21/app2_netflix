// Importar configuración automática que detecta PC vs móvil
import { API_BASE_URL } from './config.js';

// Renombrar para consistencia con otros archivos
const BASE_URL = API_BASE_URL;

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
    
    if (response.status === 404) {
      // No hay calificación - esto es normal, no es un error
      return null;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al obtener calificación');
    }
    
    return data.calificacion;
  } catch (error) {
    // Solo mostrar error si no es un 404
    if (error.message && !error.message.includes('404')) {
      console.error('Error al obtener calificación:', error);
    }
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