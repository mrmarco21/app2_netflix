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
import { 
  buscarContenido, 
  obtenerPeliculasPopulares, 
  obtenerSeriesPopulares,
  obtenerGenerosPeliculas,
  obtenerGenerosSeries 
} from '../servicios/tmdbService';

export default function Buscar({ navigation }) {
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [busquedasPopulares, setBusquedasPopulares] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(false);

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

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      
      // Cargar contenido popular para búsquedas populares
      const [peliculasPopulares, seriesPopulares, generosPeliculas, generosSeries] = await Promise.all([
        obtenerPeliculasPopulares(1),
        obtenerSeriesPopulares(1),
        obtenerGenerosPeliculas(),
        obtenerGenerosSeries()
      ]);

      console.log('Respuestas TMDB:', { peliculasPopulares, seriesPopulares, generosPeliculas, generosSeries });

      // Validar que las respuestas tengan la estructura esperada
      const peliculasValidas = peliculasPopulares?.results || [];
      const seriesValidas = seriesPopulares?.results || [];
      const generosPeliculasValidos = generosPeliculas?.genres || [];
      const generosSeriesValidos = generosSeries?.genres || [];

      // Combinar películas y series populares (tomar las primeras 6)
      const contenidoPopular = [
        ...peliculasValidas.slice(0, 3).map(item => ({
          id: item.id,
          titulo: item.title,
          imagen: item.poster_path 
            ? `https://image.tmdb.org/t/p/w300${item.poster_path}` 
            : 'https://via.placeholder.com/150x200/333/FFFFFF?text=SIN+IMAGEN',
          tipo: 'pelicula'
        })),
        ...seriesValidas.slice(0, 3).map(item => ({
          id: item.id,
          titulo: item.name,
          imagen: item.poster_path 
            ? `https://image.tmdb.org/t/p/w300${item.poster_path}` 
            : 'https://via.placeholder.com/150x200/333/FFFFFF?text=SIN+IMAGEN',
          tipo: 'serie'
        }))
      ];

      setBusquedasPopulares(contenidoPopular);

      // Combinar géneros de películas y series
      const todosLosGeneros = [
        ...generosPeliculasValidos.map(g => g.name),
        ...generosSeriesValidos.map(g => g.name)
      ];
      
      // Eliminar duplicados y tomar los primeros 10
      const generosUnicos = [...new Set(todosLosGeneros)].slice(0, 10);
      setCategorias(generosUnicos);

    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      // Fallback a datos de ejemplo en caso de error
      setBusquedasPopulares(ejemploBusquedasPopulares);
      setCategorias(ejemploCategorias);
    } finally {
      setCargando(false);
    }
  };

  const buscarContenidoReal = async (texto) => {
    if (texto.trim() === '') {
      setResultados([]);
      return;
    }

    try {
      setCargando(true);
      const respuesta = await buscarContenido(texto, 1);
      
      console.log('Respuesta búsqueda TMDB:', respuesta);
      
      // Validar que la respuesta tenga la estructura esperada
      const resultadosValidos = respuesta?.results || [];
      
      // Formatear resultados para que coincidan con la estructura esperada
      const resultadosFormateados = resultadosValidos.map(item => ({
        id: item.id,
        titulo: item.title || item.name, // title para películas, name para series
        imagen: item.poster_path 
          ? `https://image.tmdb.org/t/p/w300${item.poster_path}` 
          : 'https://via.placeholder.com/150x200/333/FFFFFF?text=SIN+IMAGEN',
        tipo: item.media_type || (item.title ? 'pelicula' : 'serie'),
        fecha: item.release_date || item.first_air_date,
        puntuacion: item.vote_average
      }));

      setResultados(resultadosFormateados);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      // Fallback a búsqueda local en caso de error
      const resultadosFiltrados = busquedasPopulares.filter(item =>
        item.titulo.toLowerCase().includes(texto.toLowerCase())
      );
      setResultados(resultadosFiltrados);
    } finally {
      setCargando(false);
    }
  };

  const manejarCambioTexto = (texto) => {
    setTextoBusqueda(texto);
    buscarContenidoReal(texto);
  };

  const limpiarBusqueda = () => {
    setTextoBusqueda('');
    setResultados([]);
  };

  const seleccionarBusqueda = (titulo) => {
    setTextoBusqueda(titulo);
    buscarContenidoReal(titulo);
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
            cargando={cargando}
          />
        ) : (
          <>
            <BusquedasPopulares 
              busquedasPopulares={busquedasPopulares}
              onSeleccionarBusqueda={seleccionarBusqueda}
              cargando={cargando}
            />
            <CategoriasBusqueda 
              categorias={categorias}
              onSeleccionarCategoria={seleccionarBusqueda}
              cargando={cargando}
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