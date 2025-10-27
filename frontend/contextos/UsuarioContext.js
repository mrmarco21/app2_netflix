import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { obtenerPerfilesPorUsuario } from '../servicios/apiUsuarios';

// Crear el contexto
const UsuarioContext = createContext();

// Hook personalizado para usar el contexto
export const useUsuario = () => {
  const context = useContext(UsuarioContext);
  if (!context) {
    throw new Error('useUsuario debe ser usado dentro de un UsuarioProvider');
  }
  return context;
};

// Proveedor del contexto
export const UsuarioProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [perfilActual, setPerfilActual] = useState(null);
  const [perfilesDisponibles, setPerfilesDisponibles] = useState([]);
  const [cargandoPerfiles, setCargandoPerfiles] = useState(false);

  // Función para establecer el usuario logueado
  const establecerUsuario = (datosUsuario) => {
    setUsuario(datosUsuario);
  };

  // Función para establecer el perfil actual
  const establecerPerfilActual = (perfil) => {
    setPerfilActual(perfil);
  };

  // Función para cargar perfiles disponibles del usuario
  const cargarPerfilesDisponibles = useCallback(async (idUsuario) => {
    if (!idUsuario) return;
    
    try {
      setCargandoPerfiles(true);
      const resultado = await obtenerPerfilesPorUsuario(idUsuario);
      
      if (resultado.success) {
        setPerfilesDisponibles(resultado.data.perfiles || []);
      } else {
        console.error('Error al cargar perfiles:', resultado.mensaje);
        setPerfilesDisponibles([]);
      }
    } catch (error) {
      console.error('Error al cargar perfiles:', error);
      setPerfilesDisponibles([]);
    } finally {
      setCargandoPerfiles(false);
    }
  }, []);

  // Función para cambiar de perfil
  const cambiarPerfil = useCallback((nuevoPerfil) => {
    setPerfilActual(nuevoPerfil);
  }, []);

  // Función para cerrar sesión
  const cerrarSesion = useCallback(() => {
    setUsuario(null);
    setPerfilActual(null);
    setPerfilesDisponibles([]);
  }, []);

  // Cargar perfiles cuando se establece un usuario
  useEffect(() => {
    if (usuario?.id) {
      cargarPerfilesDisponibles(usuario.id);
    }
  }, [usuario?.id]);

  const value = {
    // Estados
    usuario,
    perfilActual,
    perfilesDisponibles,
    cargandoPerfiles,
    
    // Funciones
    establecerUsuario,
    establecerPerfilActual,
    cargarPerfilesDisponibles,
    cambiarPerfil,
    cerrarSesion,
  };

  return (
    <UsuarioContext.Provider value={value}>
      {children}
    </UsuarioContext.Provider>
  );
};