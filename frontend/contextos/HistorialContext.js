import React, { createContext, useContext, useState, useCallback } from 'react';
import { API_BASE_URL } from '../servicios/config.js';

const HistorialContext = createContext();

export const useHistorial = () => {
  const context = useContext(HistorialContext);
  if (!context) {
    throw new Error('useHistorial debe ser usado dentro de un HistorialProvider');
  }
  return context;
};

export const HistorialProvider = ({ children }) => {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Obtener historial de un perfil
  const obtenerHistorial = useCallback(async (idPerfil) => {
    if (!idPerfil) {
      console.warn('No se puede obtener historial sin ID de perfil');
      return;
    }

    try {
      setCargando(true);
      console.log('📜 Obteniendo historial para perfil:', idPerfil);

      const response = await fetch(`${API_BASE_URL}/historial/${idPerfil}`);
      const data = await response.json();

      if (data.success) {
        setHistorial(data.data.historial);
        console.log('✅ Historial obtenido:', data.data.historial.length, 'elementos');
      } else {
        console.error('❌ Error al obtener historial:', data.mensaje);
        setHistorial([]);
      }
    } catch (error) {
      console.error('❌ Error al obtener historial:', error);
      setHistorial([]);
    } finally {
      setCargando(false);
    }
  }, []);

  // Agregar o actualizar en el historial
  const agregarAlHistorial = useCallback(async (datosContenido) => {
    try {
      console.log('➕ Agregando al historial:', datosContenido.titulo);
      console.log('📤 URL de la API:', `${API_BASE_URL}/historial/agregar`);
      console.log('📤 Datos enviados:', datosContenido);

      const response = await fetch(`${API_BASE_URL}/historial/agregar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosContenido),
      });

      console.log('📥 Status de respuesta:', response.status);
      console.log('📥 Headers de respuesta:', response.headers);

      if (!response.ok) {
        console.error('❌ Respuesta no OK:', response.status, response.statusText);
        
        // Intentar obtener el mensaje de error del servidor
        try {
          const errorData = await response.text();
          console.error('❌ Respuesta del servidor:', errorData);
        } catch (e) {
          console.error('❌ No se pudo leer la respuesta de error');
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 Datos de respuesta:', data);

      if (data.success) {
        console.log('✅ Agregado al historial exitosamente');
        // Actualizar lista local
        if (datosContenido.idPerfil) {
          await obtenerHistorial(datosContenido.idPerfil);
        }
        return true;
      } else {
        console.error('❌ Error en respuesta del servidor:', data.mensaje);
        throw new Error(data.mensaje || 'Error desconocido del servidor');
      }
    } catch (error) {
      console.error('❌ Error completo al agregar al historial:', error);
      console.error('❌ Stack trace:', error.stack);
      throw error; // Re-lanzar el error para que se propague
    }
  }, [obtenerHistorial]);

  // Eliminar del historial
  const eliminarDelHistorial = useCallback(async (id, idPerfil) => {
    try {
      console.log('🗑️ Eliminando del historial:', id);

      const response = await fetch(`${API_BASE_URL}/historial/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Eliminado del historial');
        // Actualizar lista local
        if (idPerfil) {
          await obtenerHistorial(idPerfil);
        }
        return true;
      } else {
        console.error('❌ Error al eliminar del historial:', data.mensaje);
        return false;
      }
    } catch (error) {
      console.error('❌ Error al eliminar del historial:', error);
      return false;
    }
  }, [obtenerHistorial]);

  // Limpiar todo el historial de un perfil
  const limpiarHistorial = useCallback(async (idPerfil) => {
    try {
      console.log('🧹 Limpiando historial del perfil:', idPerfil);

      const response = await fetch(`${API_BASE_URL}/historial/perfil/${idPerfil}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Historial limpiado');
        setHistorial([]);
        return true;
      } else {
        console.error('❌ Error al limpiar historial:', data.mensaje);
        return false;
      }
    } catch (error) {
      console.error('❌ Error al limpiar historial:', error);
      return false;
    }
  }, []);

  const value = {
    historial,
    cargando,
    obtenerHistorial,
    agregarAlHistorial,
    eliminarDelHistorial,
    limpiarHistorial,
  };

  return (
    <HistorialContext.Provider value={value}>
      {children}
    </HistorialContext.Provider>
  );
};