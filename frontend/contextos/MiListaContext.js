import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUsuario } from './UsuarioContext';
import * as apiMiLista from '../servicios/apiMiLista';

const MiListaContext = createContext();

export const useMiLista = () => {
  const context = useContext(MiListaContext);
  if (!context) {
    throw new Error('useMiLista debe ser usado dentro de MiListaProvider');
  }
  return context;
};

export const MiListaProvider = ({ children }) => {
  const [miLista, setMiLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const { perfilActual } = useUsuario();

  // Cargar Mi Lista cuando cambie el perfil
  useEffect(() => {
    if (perfilActual?.id) {
      cargarMiLista();
    } else {
      setMiLista([]);
    }
  }, [perfilActual]);

  const cargarMiLista = async () => {
    if (!perfilActual?.id) return;
    
    try {
      setCargando(true);
      const lista = await apiMiLista.obtenerMiLista(perfilActual.id);
      setMiLista(lista || []);
    } catch (error) {
      console.error('Error al cargar Mi Lista:', error);
      setMiLista([]);
    } finally {
      setCargando(false);
    }
  };

  const agregarAMiLista = async (contenido) => {
    if (!perfilActual?.id) {
      console.error('No hay perfil activo');
      return false;
    }

    try {
      const resultado = await apiMiLista.agregarAMiLista(perfilActual.id, contenido);
      
      // Recargar la lista completa para obtener el tipo correcto desde el servidor
      await cargarMiLista();
      
      return true;
    } catch (error) {
      console.error('Error al agregar a Mi Lista:', error);
      return false;
    }
  };

  const quitarDeMiLista = async (contenidoId) => {
    if (!perfilActual?.id) {
      console.error('No hay perfil activo');
      return false;
    }

    try {
      await apiMiLista.quitarDeMiLista(perfilActual.id, contenidoId.toString());
      
      // Actualizar estado local
      setMiLista(prev => prev.filter(item => item.id_contenido !== contenidoId.toString()));
      
      return true;
    } catch (error) {
      console.error('Error al quitar de Mi Lista:', error);
      return false;
    }
  };

  const estaEnMiLista = (contenidoId) => {
    return miLista.some(item => item.id_contenido === contenidoId.toString());
  };

  const toggleMiLista = async (contenido) => {
    const esta = estaEnMiLista(contenido.id);
    
    if (esta) {
      return await quitarDeMiLista(contenido.id);
    } else {
      return await agregarAMiLista(contenido);
    }
  };

  const value = {
    miLista,
    cargando,
    agregarAMiLista,
    quitarDeMiLista,
    estaEnMiLista,
    toggleMiLista,
    cargarMiLista
  };

  return (
    <MiListaContext.Provider value={value}>
      {children}
    </MiListaContext.Provider>
  );
};