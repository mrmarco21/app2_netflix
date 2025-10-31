import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import NavegacionInferior from '../componentes/NavegacionInferior';
import { obtenerPeliculasProximamente } from '../servicios/tmdbService';

export default function Proximamente({ navigation }) {
  const [contenidoProximo, setContenidoProximo] = useState([]);
  const [notificacionesActivas, setNotificacionesActivas] = useState(new Set());
  const [cargando, setCargando] = useState(false);

  // Datos de ejemplo para contenido próximo (fallback)
  const ejemploContenidoProximo = [
    {
      id: 1,
      titulo: 'Stranger Things 5',
      fechaEstreno: '2024-07-15',
      tipo: 'Película',
      temporada: null,
      descripcion: 'La batalla final contra el Mundo del Revés llega a su conclusión en esta temporada épica.',
      imagen: 'https://via.placeholder.com/300x450/8B0000/FFFFFF?text=STRANGER+THINGS+5',
      trailer: true,
      generos: ['Ciencia Ficción', 'Horror', 'Drama'],
    },
    {
      id: 2,
      titulo: 'The Witcher: Sirenas del Abismo',
      fechaEstreno: '2024-02-11',
      tipo: 'Película',
      temporada: null,
      descripcion: 'Una nueva aventura animada de Geralt de Rivia en los mares del norte.',
      imagen: 'https://via.placeholder.com/300x450/4B0082/FFFFFF?text=THE+WITCHER+SIRENAS',
      trailer: true,
      generos: ['Fantasía', 'Aventura', 'Animación'],
    },
    {
      id: 3,
      titulo: 'Casa de Papel: Corea',
      fechaEstreno: '2024-03-20',
      tipo: 'Película',
      temporada: null,
      descripcion: 'La resistencia continúa en la península coreana unificada.',
      imagen: 'https://via.placeholder.com/300x450/FF6347/FFFFFF?text=CASA+PAPEL+COREA',
      trailer: false,
      generos: ['Acción', 'Drama', 'Thriller'],
    },
    {
      id: 4,
      titulo: 'Avatar: El Último Maestro Aire',
      fechaEstreno: '2024-04-10',
      tipo: 'Película',
      temporada: null,
      descripcion: 'Aang continúa su viaje para dominar todos los elementos.',
      imagen: 'https://via.placeholder.com/300x450/228B22/FFFFFF?text=AVATAR+S2',
      trailer: true,
      generos: ['Aventura', 'Fantasía', 'Familia'],
    },
    {
      id: 5,
      titulo: 'Cyberpunk: Edgerunners 2',
      fechaEstreno: '2024-05-25',
      tipo: 'Película',
      temporada: null,
      descripcion: 'Nuevos mercenarios en las calles de Night City.',
      imagen: 'https://via.placeholder.com/300x450/FF1493/FFFFFF?text=CYBERPUNK+2',
      trailer: false,
      generos: ['Anime', 'Ciencia Ficción', 'Acción'],
    },
  ];

  // Función para cargar datos reales de TMDB
  const cargarPeliculasProximamente = async () => {
    setCargando(true);
    try {
      console.log('Cargando películas próximamente desde TMDB...');
      const respuesta = await obtenerPeliculasProximamente(1);
      console.log('Respuesta TMDB próximamente:', respuesta);
      
      if (respuesta?.results && Array.isArray(respuesta.results)) {
        const peliculasFormateadas = respuesta.results.map(pelicula => ({
          id: pelicula.id,
          titulo: pelicula.title || pelicula.name || 'Título no disponible',
          fechaEstreno: pelicula.release_date || '2024-12-31',
          tipo: 'Película',
          temporada: null,
          descripcion: pelicula.overview || 'Descripción no disponible',
          imagen: pelicula.poster_path 
            ? `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`
            : 'https://via.placeholder.com/300x450/333333/FFFFFF?text=Sin+Imagen',
          trailer: true, // Asumimos que tienen trailer
          generos: ['Próximamente'], // Los géneros específicos requerirían otra llamada
        }));
        
        setContenidoProximo(peliculasFormateadas);
      } else {
        console.warn('Respuesta TMDB inválida, usando datos de ejemplo');
        setContenidoProximo(ejemploContenidoProximo);
      }
    } catch (error) {
      console.error('Error al cargar películas próximamente:', error);
      setContenidoProximo(ejemploContenidoProximo);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPeliculasProximamente();
  }, []);

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

  const toggleNotificacion = (id) => {
    const nuevasNotificaciones = new Set(notificacionesActivas);
    if (nuevasNotificaciones.has(id)) {
      nuevasNotificaciones.delete(id);
    } else {
      nuevasNotificaciones.add(id);
    }
    setNotificacionesActivas(nuevasNotificaciones);
  };

  const formatearFecha = (fecha) => {
    const fechaObj = new Date(fecha);
    const opciones = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return fechaObj.toLocaleDateString('es-ES', opciones);
  };

  const calcularDiasRestantes = (fecha) => {
    const hoy = new Date();
    const fechaEstreno = new Date(fecha);
    const diferencia = fechaEstreno.getTime() - hoy.getTime();
    const dias = Math.ceil(diferencia / (1000 * 3600 * 24));
    
    if (dias < 0) return 'Ya disponible';
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Mañana';
    return `En ${dias} días`;
  };

  const renderContenidoItem = ({ item }) => (
    <View style={styles.contenidoItem}>
      <Image source={{ uri: item.imagen }} style={styles.contenidoImagen} />
      
      <View style={styles.contenidoInfo}>
        <View style={styles.contenidoHeader}>
          <View style={styles.fechaContainer}>
            <Text style={styles.diasRestantes}>{calcularDiasRestantes(item.fechaEstreno)}</Text>
            <Text style={styles.fechaEstreno}>{formatearFecha(item.fechaEstreno)}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.botonNotificacion}
            onPress={() => toggleNotificacion(item.id)}
          >
            <Ionicons 
              name={notificacionesActivas.has(item.id) ? "notifications" : "notifications-outline"} 
              size={24} 
              color={notificacionesActivas.has(item.id) ? "#E50914" : "white"} 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.contenidoTitulo}>{item.titulo}</Text>
        
        {item.temporada && (
          <Text style={styles.contenidoTemporada}>{item.temporada}</Text>
        )}
        
        <Text style={styles.contenidoDescripcion}>{item.descripcion}</Text>
        
        <View style={styles.generosContainer}>
          {item.generos.map((genero, index) => (
            <Text key={index} style={styles.generoTag}>
              {genero}
              {index < item.generos.length - 1 && ' • '}
            </Text>
          ))}
        </View>

        <View style={styles.accionesContainer}>
          <TouchableOpacity style={styles.botonCompartir}>
            <Ionicons name="share-outline" size={20} color="white" />
            <Text style={styles.textoBoton}>Compartir</Text>
          </TouchableOpacity>
          
          {item.trailer && (
            <TouchableOpacity style={styles.botonTrailer}>
              <Ionicons name="play-outline" size={20} color="white" />
              <Text style={styles.textoBoton}>Ver tráiler</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.botonInfo}>
            <Ionicons name="information-circle-outline" size={20} color="white" />
            <Text style={styles.textoBoton}>Más info</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Próximamente</Text>
        {/* <TouchableOpacity style={styles.botonBuscar}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity> */}
      </View>

      {/* Contenido */}
      <FlatList
        data={contenidoProximo}
        renderItem={renderContenidoItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaContenido}
      />

      <NavegacionInferior navigation={navigation} activeTab="Proximamente" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitulo: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  botonBuscar: {
    padding: 5,
  },
  listaContenido: {
    paddingBottom: 100,
  },
  contenidoItem: {
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  contenidoImagen: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  contenidoInfo: {
    paddingHorizontal: 5,
  },
  contenidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  fechaContainer: {
    flex: 1,
  },
  diasRestantes: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fechaEstreno: {
    color: '#999',
    fontSize: 14,
    marginTop: 2,
  },
  botonNotificacion: {
    padding: 5,
  },
  contenidoTitulo: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contenidoTemporada: {
    color: '#999',
    fontSize: 14,
    marginBottom: 10,
  },
  contenidoDescripcion: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  generosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  generoTag: {
    color: '#999',
    fontSize: 12,
  },
  accionesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  botonCompartir: {
    alignItems: 'center',
    flex: 1,
  },
  botonTrailer: {
    alignItems: 'center',
    flex: 1,
  },
  botonInfo: {
    alignItems: 'center',
    flex: 1,
  },
  textoBoton: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
});