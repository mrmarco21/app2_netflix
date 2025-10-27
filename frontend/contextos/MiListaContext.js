import React, { createContext, useContext, useState } from 'react';

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

  const agregarAMiLista = (contenido) => {
    setMiLista(prev => {
      const existe = prev.find(item => item.id === contenido.id);
      if (!existe) {
        return [...prev, { ...contenido, fechaAgregado: new Date().toISOString() }];
      }
      return prev;
    });
  };

  const quitarDeMiLista = (contenidoId) => {
    setMiLista(prev => prev.filter(item => item.id !== contenidoId));
  };

  const estaEnMiLista = (contenidoId) => {
    return miLista.some(item => item.id === contenidoId);
  };

  const toggleMiLista = (contenido, agregar) => {
    if (agregar) {
      agregarAMiLista(contenido);
    } else {
      quitarDeMiLista(contenido.id);
    }
  };

  const value = {
    miLista,
    agregarAMiLista,
    quitarDeMiLista,
    estaEnMiLista,
    toggleMiLista
  };

  return (
    <MiListaContext.Provider value={value}>
      {children}
    </MiListaContext.Provider>
  );
};