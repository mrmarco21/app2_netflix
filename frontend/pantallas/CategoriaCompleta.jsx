import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMiLista } from '../contextos/MiListaContext';

// Servicios TMDB
import {
  obtenerPeliculasPopulares,
  obtenerSeriesPopulares,
  obtenerPeliculasPorGenero,
  obtenerSeriesPorGenero
} from '../servicios/tmdbService';

export default function CategoriaCompleta({ route }) {
  const { titulo, categoriaCompleta } = route.params;
  const navigation = useNavigation();
  const { toggleMiLista } = useMiLista();
  
  const [contenido, setContenido] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMasPaginas, setHayMasPaginas] = useState(true);

  // Controla el botón de atrás del dispositivo
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true; // Previene el comportamiento por defecto
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove(); // Limpia el listener al desmontar
  }, [navigation]);

  // Mapeo de géneros para películas (IDs de TMDB)
  const generosPeliculas = {
    'Acción': 28,
    'Aventura': 12,
    'Animación': 16,
    'Comedia': 35,
    'Crimen': 80,
    'Documental': 99,
    'Drama': 18,
    'Familia': 10751,
    'Fantasía': 14,
    'Historia': 36,
    'Terror': 27,
    'Música': 10402,
    'Misterio': 9648,
    'Romance': 10749,
    'Ciencia Ficción': 878,
    'Película de TV': 10770,
    'Suspense': 53,
    'Thriller': 53, // Alias para Suspense
    'Bélica': 10752,
    'Western': 37
  };

  // Mapeo de géneros para series (IDs de TMDB)
  const generosSeries = {
    'Acción y Aventura': 10759,
    'Action & Adventure': 10759,
    'Animación': 16,
    'Comedia': 35,
    'Comedia de Series': 35, // Alias para Comedia
    'Crimen': 80,
    'Documental': 99,
    'Drama': 18,
    'Drama de Series': 18, // Alias para Drama
    'Familia': 10751,
    'Kids': 10762,
    'Misterio': 9648,
    'News': 10763,
    'Reality': 10764,
    'Ciencia Ficción y Fantasía': 10765,
    'Sci-Fi & Fantasy': 10765,
    'Soap': 10766,
    'Talk': 10767,
    'Guerra y Política': 10768,
    'War & Politics': 10768,
    'Western': 37
  };

  const cargarContenido = async (paginaActual = 1, esNuevaCarga = true) => {
    if (esNuevaCarga) {
      setCargando(true);
    } else {
      setCargandoMas(true);
    }

    try {
      let respuesta = null;
      let contenidoFormateado = [];

      // Determinar qué tipo de contenido cargar basado en el título
      if (titulo.includes('Películas Populares')) {
        respuesta = await obtenerPeliculasPopulares(paginaActual);
        contenidoFormateado = respuesta.results?.map(item => ({
          id: item.id,
          titulo: item.title,
          imagen: item.poster_url,
          tipo: 'pelicula'
        })) || [];
      } else if (titulo.includes('Series Populares')) {
        respuesta = await obtenerSeriesPopulares(paginaActual);
        contenidoFormateado = respuesta.results?.map(item => ({
          id: item.id,
          titulo: item.name,
          imagen: item.poster_url,
          tipo: 'serie'
        })) || [];
      } else if (titulo.includes('Películas de')) {
        // Extraer el género del título
        const genero = titulo.replace('Películas de ', '');
        console.log('Buscando películas del género:', genero);
        
        // Buscar el género con normalización de texto
        let idGenero = generosPeliculas[genero];
        
        // Si no se encuentra, intentar con variaciones comunes
        if (!idGenero) {
          // Intentar sin acentos o con variaciones
          const generoNormalizado = genero.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          idGenero = generosPeliculas[generoNormalizado];
        }
        
        console.log('ID del género encontrado:', idGenero);
        if (idGenero) {
          respuesta = await obtenerPeliculasPorGenero(idGenero, paginaActual);
          console.log('Respuesta de películas por género:', respuesta);
          contenidoFormateado = respuesta.results?.map(item => ({
            id: item.id,
            titulo: item.title,
            imagen: item.poster_url,
            tipo: 'pelicula'
          })) || [];
        } else {
          console.log('No se encontró ID para el género:', genero);
        }
      } else if (titulo.includes('Series de')) {
        // Extraer el género del título
        let genero = titulo.replace('Series de ', '');
        console.log('Buscando series del género:', genero);
        
        // Buscar directamente el género sin mapeos adicionales
        let idGenero = generosSeries[genero];
        
        // Si no se encuentra, intentar con variaciones comunes
        if (!idGenero) {
          // Intentar sin acentos o con variaciones
          const generoNormalizado = genero.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          idGenero = generosSeries[generoNormalizado];
        }
        
        console.log('ID del género encontrado:', idGenero);
        
        if (idGenero) {
          respuesta = await obtenerSeriesPorGenero(idGenero, paginaActual);
          console.log('Respuesta de series por género:', respuesta);
          contenidoFormateado = respuesta.results?.map(item => ({
            id: item.id,
            titulo: item.name,
            imagen: item.poster_url,
            tipo: 'serie'
          })) || [];
        } else {
          console.log('No se encontró ID para el género:', genero);
        }
      }

      if (esNuevaCarga) {
        setContenido(contenidoFormateado);
      } else {
        setContenido(prev => [...prev, ...contenidoFormateado]);
      }

      // Verificar si hay más páginas
      setHayMasPaginas(respuesta && respuesta.page < respuesta.total_pages);

    } catch (error) {
      console.error('Error cargando contenido de categoría:', error);
    } finally {
      setCargando(false);
      setCargandoMas(false);
    }
  };

  useEffect(() => {
    cargarContenido(1, true);
  }, [titulo]);

  const manejarSeleccionContenido = (item) => {
    console.log('Navegando a DetallePelicula con:', item);
    navigation.navigate('DetallePelicula', { pelicula: item });
  };

  const cargarMasContenido = () => {
    if (!cargandoMas && hayMasPaginas) {
      const nuevaPagina = pagina + 1;
      setPagina(nuevaPagina);
      cargarContenido(nuevaPagina, false);
    }
  };

  const renderContenidoItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.contenidoItem}
      onPress={() => manejarSeleccionContenido(item)}
    >
      <Image 
        source={{ 
          uri: item.imagen || 'https://via.placeholder.com/300x450/333333/FFFFFF?text=Sin+Imagen'
        }} 
        style={styles.contenidoImagen}
        resizeMode="cover"
        onError={() => {
          console.log('Error cargando imagen:', item.imagen);
        }}
      />
      <Text style={styles.contenidoTitulo} numberOfLines={2}>
        {item.titulo}
      </Text>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!cargandoMas) return null;
    return (
      <View style={styles.footerCargando}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.textoCargando}>Cargando más contenido...</Text>
      </View>
    );
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.botonVolver}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.titulo}>{titulo}</Text>
        </View>
        <View style={styles.cargandoContainer}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.textoCargando}>Cargando contenido...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.botonVolver}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.titulo}>{titulo}</Text>
      </View>

      <FlatList
        data={contenido}
        renderItem={renderContenidoItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        onEndReached={cargarMasContenido}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  botonVolver: {
    padding: 8,
    marginRight: 15,
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  gridContainer: {
    padding: 15,
  },
  contenidoItem: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
  },
  contenidoImagen: {
    width: '100%',
    aspectRatio: 2/3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  contenidoTitulo: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  cargandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerCargando: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  textoCargando: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
});