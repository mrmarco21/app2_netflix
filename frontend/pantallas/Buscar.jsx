import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavegacionInferior from '../componentes/NavegacionInferior';
import HeaderBusqueda from '../componentes/HeaderBusqueda';
import ResultadosBusqueda from '../componentes/ResultadosBusqueda';
import BusquedasPopulares from '../componentes/BusquedasPopulares';
import CategoriasBusqueda from '../componentes/CategoriasBusqueda';

export default function Buscar({ navigation }) {
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [busquedasPopulares, setBusquedasPopulares] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Datos de ejemplo para búsquedas populares
  const ejemploBusquedasPopulares = [
    { id: 1, titulo: 'Death Note', imagen: 'https://via.placeholder.com/150x200/8B0000/FFFFFF?text=DEATH+NOTE' },
    { id: 2, titulo: 'Stranger Things', imagen: 'https://via.placeholder.com/150x200/000080/FFFFFF?text=STRANGER+THINGS' },
    { id: 3, titulo: 'The Witcher', imagen: 'https://via.placeholder.com/150x200/4B0082/FFFFFF?text=THE+WITCHER' },
    { id: 4, titulo: 'Breaking Bad', imagen: 'https://via.placeholder.com/150x200/228B22/FFFFFF?text=BREAKING+BAD' },
    { id: 5, titulo: 'Casa de Papel', imagen: 'https://via.placeholder.com/150x200/FF6347/FFFFFF?text=CASA+PAPEL' },
    { id: 6, titulo: 'Dark', imagen: 'https://via.placeholder.com/150x200/2F4F4F/FFFFFF?text=DARK' },
  ];

  // Categorías de búsqueda
  const ejemploCategorias = [
    'Acción', 'Aventura', 'Anime', 'Comedias', 'Documentales', 
    'Dramas', 'Fantasía', 'Horror', 'Romance', 'Ciencia Ficción'
  ];

  useEffect(() => {
    setBusquedasPopulares(ejemploBusquedasPopulares);
    setCategorias(ejemploCategorias);
  }, []);

  const buscarContenido = (texto) => {
    if (texto.trim() === '') {
      setResultados([]);
      return;
    }

    // Simulación de búsqueda
    const resultadosFiltrados = ejemploBusquedasPopulares.filter(item =>
      item.titulo.toLowerCase().includes(texto.toLowerCase())
    );
    setResultados(resultadosFiltrados);
  };

  const manejarCambioTexto = (texto) => {
    setTextoBusqueda(texto);
    buscarContenido(texto);
  };

  const limpiarBusqueda = () => {
    setTextoBusqueda('');
    setResultados([]);
  };

  const seleccionarBusqueda = (titulo) => {
    setTextoBusqueda(titulo);
    buscarContenido(titulo);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
      
      <HeaderBusqueda
        textoBusqueda={textoBusqueda}
        onChangeText={manejarCambioTexto}
        onVolver={() => navigation.goBack()}
        onLimpiar={limpiarBusqueda}
      />

      <ScrollView style={styles.contenido}>
        {textoBusqueda.length > 0 ? (
          <ResultadosBusqueda 
            resultados={resultados} 
            textoBusqueda={textoBusqueda} 
          />
        ) : (
          <>
            <BusquedasPopulares 
              busquedasPopulares={busquedasPopulares}
              onSeleccionarBusqueda={seleccionarBusqueda}
            />
            <CategoriasBusqueda 
              categorias={categorias}
              onSeleccionarCategoria={seleccionarBusqueda}
            />
          </>
        )}
      </ScrollView>

      <NavegacionInferior navigation={navigation} activeTab="Buscar" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contenido: {
    flex: 1,
    paddingHorizontal: 15,
  },
});