import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [requiereVerificacionPin, setRequiereVerificacionPin] = useState(false);
  const [tiempoUltimaActividad, setTiempoUltimaActividad] = useState(Date.now());
  const [sesionIniciada, setSesionIniciada] = useState(false);

  // Función para guardar sesión en AsyncStorage
  const guardarSesion = async (datosUsuario) => {
    try {
      await AsyncStorage.setItem('sesionUsuario', JSON.stringify(datosUsuario));
      await AsyncStorage.setItem('sesionIniciada', 'true');
    } catch (error) {
      console.error('Error al guardar sesión:', error);
    }
  };

  // Función para cargar sesión desde AsyncStorage
  const cargarSesion = async () => {
    try {
      const sesionGuardada = await AsyncStorage.getItem('sesionUsuario');
      const sesionActiva = await AsyncStorage.getItem('sesionIniciada');
      
      if (sesionGuardada && sesionActiva === 'true') {
        const datosUsuario = JSON.parse(sesionGuardada);
        setUsuario(datosUsuario);
        setSesionIniciada(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al cargar sesión:', error);
      return false;
    }
  };

  // Función para limpiar sesión de AsyncStorage
  const limpiarSesion = async () => {
    try {
      await AsyncStorage.removeItem('sesionUsuario');
      await AsyncStorage.removeItem('sesionIniciada');
    } catch (error) {
      console.error('Error al limpiar sesión:', error);
    }
  };

  // Función para establecer el usuario logueado
  const establecerUsuario = async (datosUsuario) => {
    setUsuario(datosUsuario);
    setSesionIniciada(true);
    await guardarSesion(datosUsuario);
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
    setRequiereVerificacionPin(false);
    setTiempoUltimaActividad(Date.now());
  }, []);

  // Función para actualizar actividad del usuario
  const actualizarActividad = useCallback(() => {
    const ahora = Date.now();
    console.log('⏰ Actualizando actividad:', new Date(ahora).toLocaleTimeString());
    setTiempoUltimaActividad(ahora);
    if (requiereVerificacionPin) {
      setRequiereVerificacionPin(false);
    }
  }, [requiereVerificacionPin]);

  // Función para verificar si se requiere PIN por inactividad
  const verificarInactividad = useCallback(() => {
    if (perfilActual?.pin) {
      const tiempoInactivo = Date.now() - tiempoUltimaActividad;
      const TIEMPO_LIMITE = 30 * 1000; // 30 SEGUNDOS para pruebas (cambiar a 30 * 60 * 1000 para producción)
      
      console.log('🔍 Verificando inactividad:', {
        tiempoInactivo: Math.round(tiempoInactivo / 1000) + 's',
        tiempoLimite: Math.round(TIEMPO_LIMITE / 1000) + 's',
        requierePIN: tiempoInactivo > TIEMPO_LIMITE
      });
      
      if (tiempoInactivo > TIEMPO_LIMITE) {
        console.log('🔐 Solicitando PIN por inactividad');
        setRequiereVerificacionPin(true);
        return true;
      }
    }
    return false;
  }, [perfilActual, tiempoUltimaActividad]);

  // Función para marcar que se requiere verificación de PIN
  const solicitarVerificacionPin = useCallback(() => {
    if (perfilActual?.pin) {
      setRequiereVerificacionPin(true);
    }
  }, [perfilActual]);

  // Función para cerrar sesión
const cerrarSesion = useCallback(async () => {
  try {
    console.log('🔴 Cerrando sesión desde contexto...');
    
    // Limpiar AsyncStorage primero
    await limpiarSesion();
    console.log('✅ AsyncStorage limpiado');
    
    // Luego limpiar todos los estados
    setUsuario(null);
    setPerfilActual(null);
    setPerfilesDisponibles([]);
    setSesionIniciada(false);
    setRequiereVerificacionPin(false);
    setTiempoUltimaActividad(Date.now());
    
    console.log('✅ Estados del contexto limpiados');
    
    return true;
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    return false;
  }
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
    requiereVerificacionPin,
    tiempoUltimaActividad,
    sesionIniciada,
    
    // Funciones
    establecerUsuario,
    establecerPerfilActual,
    cargarPerfilesDisponibles,
    cambiarPerfil,
    actualizarActividad,
    verificarInactividad,
    solicitarVerificacionPin,
    cerrarSesion,
    cargarSesion,
  };

  return (
    <UsuarioContext.Provider value={value}>
      {children}
    </UsuarioContext.Provider>
  );
};