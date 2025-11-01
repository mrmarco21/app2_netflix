import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUsuario } from './UsuarioContext';

const DescargasContext = createContext();

export const useDescargas = () => {
  const ctx = useContext(DescargasContext);
  if (!ctx) throw new Error('useDescargas debe usarse dentro de DescargasProvider');
  return ctx;
};

// Utilidad para generar tamaños simulados
const generarTamano = () => {
  const tamanos = ['800 MB', '950 MB', '1.2 GB', '1.6 GB', '2.1 GB'];
  return tamanos[Math.floor(Math.random() * tamanos.length)];
};

// Estima tiempo restante en base a porcentaje restante
const estimarTiempo = (progreso) => {
  const restante = Math.max(0, 100 - progreso);
  const minutos = Math.ceil(restante / 6); // ~100% ≈ 16 min
  return minutos <= 1 ? '1 min' : `${minutos} min`;
};

export const DescargasProvider = ({ children }) => {
  // Mapa de descargas por usuario:perfil -> Array<descarga>
  const [descargasPorPerfilUsuario, setDescargasPorPerfilUsuario] = useState({});
  const intervalosRef = useRef({});
  const { perfilActual, usuario } = useUsuario();

  // Persistencia en web (localStorage) y móvil (AsyncStorage)
  const STORAGE_KEY = 'descargas_map_v1';
  const esWeb = Platform.OS === 'web';
  const puedePersistirWeb = esWeb && typeof window !== 'undefined' && !!window.localStorage;

  // Rehidratar al montar
  useEffect(() => {
    const rehidratar = async () => {
      try {
        if (puedePersistirWeb) {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
              setDescargasPorPerfilUsuario(parsed);
            }
          }
          return;
        }

        // Móvil: AsyncStorage
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            setDescargasPorPerfilUsuario(parsed);
          }
        }
      } catch (e) {
        console.warn('No se pudo rehidratar descargas:', e?.message || e);
      }
    };
    rehidratar();
  }, []);

  // Guardar cambios
  useEffect(() => {
    const persistir = async () => {
      try {
        const data = JSON.stringify(descargasPorPerfilUsuario);
        if (puedePersistirWeb) {
          window.localStorage.setItem(STORAGE_KEY, data);
        } else {
          await AsyncStorage.setItem(STORAGE_KEY, data);
        }
      } catch (e) {
        console.warn('No se pudo persistir descargas:', e?.message || e);
      }
    };
    persistir();
  }, [descargasPorPerfilUsuario]);

  // Limpieza de intervalos al desmontar
  useEffect(() => {
    return () => {
      Object.values(intervalosRef.current).forEach(clearInterval);
      intervalosRef.current = {};
    };
  }, []);

  const iniciarDescarga = useCallback((contenido, perfilIdParam) => {
    const perfilId = perfilIdParam || perfilActual?.id;
    if (!perfilId) {
      console.warn('No hay perfil seleccionado para iniciar la descarga');
      return null;
    }
    const perfilKey = `${usuario?.id ?? 'anon'}:${perfilId}`;
    const id = Date.now();
    const nueva = {
      id,
      contenidoId: contenido?.id || contenido?.id_contenido || id,
      titulo: contenido?.titulo || contenido?.name || 'Contenido',
      temporada: contenido?.temporada || '',
      imagen: contenido?.imagen || contenido?.poster_small || contenido?.poster_url || contenido?.backdrop_url || 'https://via.placeholder.com/150x200/333/FFFFFF?text=NETFLIX',
      tamano: contenido?.tamano || generarTamano(),
      progreso: 0,
      fechaDescarga: new Date().toISOString().split('T')[0],
      tiempoRestante: 'Calculando...',
      estado: 'descargando',
      perfilId,
      usuarioId: usuario?.id,
    };

    setDescargasPorPerfilUsuario(prev => {
      const actual = prev[perfilKey] || [];
      return { ...prev, [perfilKey]: [...actual, nueva] };
    });

    // Simulación de progreso
    const intervalo = setInterval(() => {
      setDescargasPorPerfilUsuario(prev => {
        const arr = prev[perfilKey] || [];
        const actualizado = arr.map(item => {
          if (item.id !== id) return item;
          if (item.estado !== 'descargando') return item;
          const delta = Math.floor(5 + Math.random() * 10); // 5-14%
          const nuevoProgreso = Math.min(100, (item.progreso || 0) + delta);
          const completada = nuevoProgreso >= 100;
          return {
            ...item,
            progreso: nuevoProgreso,
            tiempoRestante: completada ? null : estimarTiempo(nuevoProgreso),
            estado: completada ? 'completada' : 'descargando',
          };
        });
        return { ...prev, [perfilKey]: actualizado };
      });
    }, 1200);

    intervalosRef.current[id] = intervalo;
    return id;
  }, [perfilActual?.id, usuario?.id]);

  const pausarReanudarDescarga = useCallback((id) => {
    setDescargasPorPerfilUsuario(prev => {
      // Buscar el perfil que contiene la descarga
      const entradas = Object.entries(prev);
      for (const [pid, arr] of entradas) {
        if (arr.some(d => d.id === id)) {
          const actualizado = arr.map(item => {
            if (item.id !== id) return item;
            if (item.estado === 'descargando') {
              return { ...item, estado: 'pausada', tiempoRestante: item.tiempoRestante || estimarTiempo(item.progreso) };
            }
            if (item.estado === 'pausada') {
              return { ...item, estado: 'descargando' };
            }
            return item;
          });
          return { ...prev, [pid]: actualizado };
        }
      }
      return prev;
    });
  }, []);

  // Observar cambios para detener intervalos al completar
  useEffect(() => {
    // Recorre todas las descargas de todos los perfiles/usuarios y detiene intervalos al completar
    Object.values(descargasPorPerfilUsuario).forEach(arr => {
      arr.forEach(d => {
        if (d.estado === 'completada' && intervalosRef.current[d.id]) {
          clearInterval(intervalosRef.current[d.id]);
          delete intervalosRef.current[d.id];
        }
      });
    });
  }, [descargasPorPerfilUsuario]);

  const eliminarDescarga = useCallback((id) => {
    if (intervalosRef.current[id]) {
      clearInterval(intervalosRef.current[id]);
      delete intervalosRef.current[id];
    }
    setDescargasPorPerfilUsuario(prev => {
      const nuevo = { ...prev };
      Object.keys(nuevo).forEach(pid => {
        nuevo[pid] = (nuevo[pid] || []).filter(d => d.id !== id);
      });
      return nuevo;
    });
  }, []);

  const limpiarDescargas = useCallback((perfilIdParam) => {
    const perfilId = perfilIdParam || perfilActual?.id;
    if (!perfilId) return;
    const perfilKey = `${usuario?.id ?? 'anon'}:${perfilId}`;
    // Detener intervalos de ese perfil
    const arr = descargasPorPerfilUsuario[perfilKey] || [];
    arr.forEach(d => {
      if (intervalosRef.current[d.id]) {
        clearInterval(intervalosRef.current[d.id]);
        delete intervalosRef.current[d.id];
      }
    });
    setDescargasPorPerfilUsuario(prev => ({ ...prev, [perfilKey]: [] }));
  }, [descargasPorPerfilUsuario, perfilActual?.id, usuario?.id]);

  // Lista derivada: descargas del perfil/usuario actual
  // Usamos el mismo fallback de almacenamiento ('anon') cuando no hay usuario.id
  const perfilKeyActual = perfilActual?.id
    ? `${usuario?.id ?? 'anon'}:${perfilActual.id}`
    : null;
  const [descargas, setDescargas] = useState([]);

  // Actualizar descargas cuando cambie el usuario o perfil actual
  useEffect(() => {
    if (perfilKeyActual) {
      const descargasDelPerfil = descargasPorPerfilUsuario[perfilKeyActual] || [];
      console.log(`📱 Cargando ${descargasDelPerfil.length} descargas para perfil: ${perfilActual?.nombre} (${perfilKeyActual})`);
      setDescargas(descargasDelPerfil);
    } else {
      console.log('📱 No hay perfil activo, limpiando descargas');
      setDescargas([]);
    }
  }, [perfilKeyActual, descargasPorPerfilUsuario, perfilActual?.nombre]);

  const value = {
    descargas,
    iniciarDescarga,
    pausarReanudarDescarga,
    eliminarDescarga,
    limpiarDescargas,
    // Para usos avanzados
    _descargasPorPerfilUsuario: descargasPorPerfilUsuario,
  };

  return (
    <DescargasContext.Provider value={value}>{children}</DescargasContext.Provider>
  );
};