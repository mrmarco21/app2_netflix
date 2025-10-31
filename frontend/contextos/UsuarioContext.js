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
      console.log('🔍 Intentando cargar sesión desde AsyncStorage...');
      const sesionGuardada = await AsyncStorage.getItem('sesionUsuario');
      const sesionActiva = await AsyncStorage.getItem('sesionIniciada');
      const perfilGuardado = await AsyncStorage.getItem('perfilActual');
      
      console.log('📋 Estado AsyncStorage:', {
        sesionGuardada: !!sesionGuardada,
        sesionActiva,
        perfilGuardado: !!perfilGuardado
      });
      
      if (sesionGuardada && sesionActiva === 'true') {
        const datosUsuario = JSON.parse(sesionGuardada);
        console.log('👤 Restaurando usuario desde AsyncStorage:', datosUsuario.id);
        
        // Cargar perfil actual si existe ANTES de establecer el usuario
        if (perfilGuardado) {
          const perfilActualData = JSON.parse(perfilGuardado);
          console.log('📱 Cargando perfil actual desde AsyncStorage:', perfilActualData.nombre);
          setPerfilActual(perfilActualData);
        } else {
          console.log('⚠️ No hay perfil guardado en AsyncStorage');
        }
        
        // Establecer usuario como restauración de sesión
        await establecerUsuario(datosUsuario, true);
        
        return true;
      } else {
        console.log('❌ No hay sesión válida en AsyncStorage');
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
      await AsyncStorage.removeItem('perfilActual');
      await AsyncStorage.removeItem('ultimaActividad');
    } catch (error) {
      console.error('Error al limpiar sesión:', error);
    }
  };

  // Función para establecer el usuario logueado
  const establecerUsuario = async (datosUsuario, esRestauracionSesion = false) => {
    console.log('👤 Estableciendo nuevo usuario:', datosUsuario.id, esRestauracionSesion ? '(restaurando sesión)' : '(nuevo login)');
    
    // Solo limpiar estado anterior si NO es una restauración de sesión
    if (!esRestauracionSesion) {
      console.log('🧹 Limpiando estado anterior para nuevo login');
      setPerfilActual(null);
      setPerfilesDisponibles([]);
      setRequiereVerificacionPin(false);
      setTiempoUltimaActividad(Date.now());
    } else {
      console.log('🔄 Restaurando sesión, preservando estado existente');
    }
    
    setUsuario(datosUsuario);
    setSesionIniciada(true);
    
    // Solo guardar sesión si no es una restauración
    if (!esRestauracionSesion) {
      await guardarSesion(datosUsuario);
    }
    
    console.log('✅ Usuario establecido correctamente');
  };

  // Función para establecer el perfil actual
  const establecerPerfilActual = async (perfil) => {
    setPerfilActual(perfil);
    
    // Guardar perfil actual en AsyncStorage si existe
    if (perfil) {
      try {
        await AsyncStorage.setItem('perfilActual', JSON.stringify(perfil));
        console.log('💾 Perfil establecido y guardado en AsyncStorage:', perfil.nombre);
      } catch (error) {
        console.error('Error al guardar perfil en AsyncStorage:', error);
      }
    }
  };

  // Función para cargar perfiles disponibles del usuario
  const cargarPerfilesDisponibles = useCallback(async (idUsuario) => {
    if (!idUsuario) {
      setPerfilesDisponibles([]);
      return;
    }
    
    try {
      setCargandoPerfiles(true);
      console.log('🔄 Cargando perfiles para usuario:', idUsuario);
      
      const resultado = await obtenerPerfilesPorUsuario(idUsuario);
      
      if (resultado.success) {
        const perfiles = resultado.data.perfiles || [];
        console.log('✅ Perfiles cargados:', perfiles.length);
        setPerfilesDisponibles(perfiles);
      } else {
        console.error('❌ Error al cargar perfiles:', resultado.mensaje);
        setPerfilesDisponibles([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar perfiles:', error);
      setPerfilesDisponibles([]);
    } finally {
      setCargandoPerfiles(false);
    }
  }, []); // Removemos perfilActual de las dependencias para evitar el loop

  // Función para cambiar de perfil
  const cambiarPerfil = useCallback(async (nuevoPerfil) => {
    console.log('🔄 Cambiando perfil a:', nuevoPerfil.nombre);
    setPerfilActual(nuevoPerfil);
    setRequiereVerificacionPin(false);
    setTiempoUltimaActividad(Date.now());
    
    // Guardar perfil actual en AsyncStorage
    try {
      await AsyncStorage.setItem('perfilActual', JSON.stringify(nuevoPerfil));
      console.log('💾 Perfil guardado en AsyncStorage:', nuevoPerfil.nombre);
    } catch (error) {
      console.error('Error al guardar perfil en AsyncStorage:', error);
    }
    
    console.log('✅ Perfil cambiado y PIN verificación desactivada');
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
      const TIEMPO_LIMITE = 30 * 1000; // 30 SEGUNDOS para pruebas
      
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
      
      // Limpiar todos los estados
      setUsuario(null);
      setPerfilActual(null);
      setPerfilesDisponibles([]);
      setSesionIniciada(false);
      setRequiereVerificacionPin(false);
      setTiempoUltimaActividad(Date.now());
      setCargandoPerfiles(false);
      
      console.log('✅ Estados del contexto limpiados');
      
      return true;
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      return false;
    }
  }, []);

  // Cargar sesión al inicializar la app
  useEffect(() => {
    cargarSesion();
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