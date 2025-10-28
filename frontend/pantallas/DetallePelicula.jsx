import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  BackHandler,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMiLista } from '../contextos/MiListaContext';
import { useUsuario } from '../contextos/UsuarioContext';
import { obtenerDetallePelicula, obtenerDetalleSerie, obtenerSerieCompleta } from '../servicios/tmdbService';
import * as apiCalificaciones from '../servicios/apiCalificaciones';

// Componentes modulares
import HeaderDetalle from '../componentes/HeaderDetalle';
import VideoPlayer from '../componentes/VideoPlayer';
import InfoPelicula from '../componentes/InfoPelicula';
import BotonesAccion from '../componentes/BotonesAccion';
import DescripcionPelicula from '../componentes/DescripcionPelicula';
import BotonesInteraccion from '../componentes/BotonesInteraccion';
import PeliculasSimilares from '../componentes/PeliculasSimilares';
import TemporadasSerie from '../componentes/TemporadasSerie';
import ModalCalificacion from '../componentes/ModalCalificacion';

export default function DetallePelicula({ navigation, route }) {
  const { pelicula } = route.params || {};
  const [enMiLista, setEnMiLista] = useState(false);
  const [detallesCompletos, setDetallesCompletos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [esSerie, setEsSerie] = useState(false);
  const [modalCalificacionVisible, setModalCalificacionVisible] = useState(false);
  const [calificacionActual, setCalificacionActual] = useState(0);
  const { toggleMiLista, estaEnMiLista } = useMiLista();
  const { perfilActual } = useUsuario();

  // Detectar si es película o serie
  useEffect(() => {
    const detectarTipo = () => {
      console.log('🔍 DETECTANDO TIPO DE CONTENIDO');
      console.log('Datos de película recibidos:', JSON.stringify(pelicula, null, 2));
      
      // Verificar primero si tiene la propiedad 'tipo' explícita
      if (pelicula?.tipo === 'serie') {
        console.log('✅ Detectado como SERIE por propiedad "tipo"');
        setEsSerie(true);
        return;
      }
      
      // Verificar si tiene propiedades específicas de serie
      if (pelicula?.name || pelicula?.first_air_date || pelicula?.number_of_seasons || pelicula?.media_type === 'tv') {
        console.log('✅ Detectado como SERIE por propiedades específicas:', {
          name: !!pelicula?.name,
          first_air_date: !!pelicula?.first_air_date,
          number_of_seasons: !!pelicula?.number_of_seasons,
          media_type: pelicula?.media_type
        });
        setEsSerie(true);
        return;
      }
      
      console.log('❌ Detectado como PELÍCULA por defecto');
      // Por defecto, asumir que es película
      setEsSerie(false);
    };

    if (pelicula) {
      detectarTipo();
      cargarDetallesCompletos();
    }
  }, [pelicula]);

  const cargarDetallesCompletos = async () => {
    try {
      setCargando(true);
      console.log('Cargando detalles para:', pelicula);
      
      // Determinar si es serie basándose en múltiples criterios
      const esSerieDetectada = pelicula?.tipo === 'serie' || 
                     pelicula?.type === 'serie' ||
                     pelicula?.name || 
                     pelicula?.first_air_date || 
                     pelicula?.number_of_seasons || 
                     pelicula?.number_of_episodes ||
                     pelicula?.seasons ||
                     pelicula?.temporadas ||
                     pelicula?.media_type === 'tv' ||
                     // Si no tiene release_date pero tiene first_air_date
                     (!pelicula?.release_date && pelicula?.first_air_date) ||
                     // Si el título usa 'name' en lugar de 'title'
                     (!pelicula?.title && pelicula?.name);
      
      console.log('Detectado como:', esSerieDetectada ? 'serie' : 'película');
      console.log('Criterios de detección:', {
        tipo: pelicula?.tipo,
        type: pelicula?.type,
        name: !!pelicula?.name,
        first_air_date: !!pelicula?.first_air_date,
        number_of_seasons: !!pelicula?.number_of_seasons,
        number_of_episodes: !!pelicula?.number_of_episodes,
        seasons: !!pelicula?.seasons,
        temporadas: !!pelicula?.temporadas,
        media_type: pelicula?.media_type
      });
      setEsSerie(esSerieDetectada);
      
      // Si ya tenemos datos completos (desde TMDB), usarlos directamente
      if (pelicula?.overview || pelicula?.genres || pelicula?.cast || pelicula?.temporadas || pelicula?.seasons) {
        console.log('Usando datos completos existentes');
        console.log('Temporadas disponibles en datos existentes:', pelicula?.temporadas?.length || pelicula?.seasons?.length || 0);
        setDetallesCompletos(pelicula);
        return;
      }
      
      // Si solo tenemos datos básicos, cargar detalles completos desde TMDB
      console.log('Cargando detalles completos desde TMDB para ID:', pelicula.id);
      
      let detalles;
      if (esSerieDetectada) {
        console.log('Cargando detalles completos de serie con temporadas y episodios...');
        detalles = await obtenerSerieCompleta(pelicula.id);
      } else {
        console.log('Cargando detalles de película...');
        detalles = await obtenerDetallePelicula(pelicula.id);
      }
      
      if (detalles && !detalles.error) {
        console.log('Detalles cargados exitosamente:', detalles);
        console.log('Temporadas disponibles:', detalles.temporadas?.length || 0);
        console.log('Temporadas completas:', detalles.temporadas);
        setDetallesCompletos(detalles);
      } else {
        console.log('No se pudieron cargar detalles o error del backend:', detalles?.error || 'Sin detalles');
        // Si hay error del backend o no se pueden cargar detalles, usar los datos básicos disponibles
        setDetallesCompletos(pelicula);
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      // En caso de error, usar los datos básicos disponibles
      setDetallesCompletos(pelicula);
    } finally {
      setCargando(false);
    }
  };

  // Preparar datos para mostrar
  const datosParaMostrar = detallesCompletos || pelicula || {};
  
  // Formatear datos según el tipo de contenido
  const formatearDatos = () => {
    if (!datosParaMostrar || datosParaMostrar.error) {
      console.log('❌ No hay datos válidos para formatear o hay error:', datosParaMostrar?.error);
      return {
        id: pelicula?.id || 0,
        titulo: pelicula?.title || pelicula?.name || pelicula?.titulo || 'Título no disponible',
        año: 'Año no disponible',
        duracion: 'Duración no disponible',
        clasificacion: '13+',
        ranking: 0,
        imagen: pelicula?.poster_url || pelicula?.imagen || null,
        descripcion: 'Descripción no disponible',
        generos: 'Géneros no disponibles',
        protagonistas: 'Reparto no disponible',
        direccion: 'Director no disponible'
      };
    }
    
    console.log('Formateando datos para:', esSerie ? 'serie' : 'película', datosParaMostrar);
    
    if (esSerie) {
      return {
        id: datosParaMostrar.id,
        titulo: datosParaMostrar.name || datosParaMostrar.titulo,
        año: datosParaMostrar.first_air_date ? new Date(datosParaMostrar.first_air_date).getFullYear() : datosParaMostrar.año,
        duracion: datosParaMostrar.number_of_seasons 
          ? `${datosParaMostrar.number_of_seasons} temporada${datosParaMostrar.number_of_seasons !== 1 ? 's' : ''}${datosParaMostrar.number_of_episodes ? ` • ${datosParaMostrar.number_of_episodes} episodios` : ''}`
          : datosParaMostrar.duracion || 'Serie',
        clasificacion: datosParaMostrar.clasificacion || '13+',
        ranking: datosParaMostrar.vote_average ? Math.round(datosParaMostrar.vote_average * 10) : datosParaMostrar.ranking,
        imagen: datosParaMostrar.backdrop_url || datosParaMostrar.poster_url || datosParaMostrar.imagen,
        descripcion: datosParaMostrar.overview || datosParaMostrar.descripcion,
        generos: datosParaMostrar.genres?.map(g => g.name).join(', ') || datosParaMostrar.generos || '',
        protagonistas: datosParaMostrar.cast?.slice(0, 3).map(c => c.name).join(', ') || datosParaMostrar.protagonistas || 'Reparto principal',
        direccion: datosParaMostrar.created_by?.map(c => c.name).join(', ') || datosParaMostrar.direccion || 'Varios creadores',
        temporadas: datosParaMostrar.temporadas || datosParaMostrar.seasons || [],
        episodios: datosParaMostrar.number_of_episodes || datosParaMostrar.episodios,
        tipo: 'serie'
      };
    } else {
      return {
        id: datosParaMostrar.id,
        titulo: datosParaMostrar.title || datosParaMostrar.titulo,
        año: datosParaMostrar.release_date ? new Date(datosParaMostrar.release_date).getFullYear() : datosParaMostrar.año,
        duracion: datosParaMostrar.runtime ? `${Math.floor(datosParaMostrar.runtime / 60)} h ${datosParaMostrar.runtime % 60} min` : datosParaMostrar.duracion,
        clasificacion: datosParaMostrar.clasificacion || '13+',
        ranking: datosParaMostrar.vote_average ? Math.round(datosParaMostrar.vote_average * 10) : datosParaMostrar.ranking,
        imagen: datosParaMostrar.backdrop_url || datosParaMostrar.poster_url || datosParaMostrar.imagen,
        descripcion: datosParaMostrar.overview || datosParaMostrar.descripcion,
        generos: datosParaMostrar.genres?.map(g => g.name).join(', ') || datosParaMostrar.generos || '',
        protagonistas: datosParaMostrar.cast?.slice(0, 3).map(c => c.name).join(', ') || datosParaMostrar.protagonistas || 'Reparto principal',
        direccion: datosParaMostrar.crew?.find(c => c.job === 'Director')?.name || datosParaMostrar.direccion || 'Director desconocido',
        tipo: 'pelicula'
      };
    }
  };

  const peliculaData = formatearDatos();

  // Contenido similar (sin filtrado estricto por tipo para garantizar contenido)
  const peliculasSimilares = React.useMemo(() => {
    // Usar datos similares de la API si están disponibles
    const similares = detallesCompletos?.similar || detallesCompletos?.recommendations || [];
    
    if (similares && similares.length > 0) {
      console.log('🎬 Procesando contenido similar de la API:', similares.length, 'items');
      console.log('📊 Datos similares recibidos:', similares);
      
      // Formatear contenido similar SIN filtrado estricto por tipo
      const contenidoFormateado = similares
        .map(item => {
          // Detectar tipo de contenido de manera más flexible
          const esSerieItem = item.media_type === 'tv' || item.name || item.first_air_date || item.number_of_seasons;
          const esPeliculaItem = item.media_type === 'movie' || item.title || item.release_date;
          
          return {
            ...item,
            titulo: item.title || item.name || item.titulo || 'Sin título',
            imagen: item.poster_url || item.poster_small || item.imagen,
            descripcion: item.overview || 'Sin descripción disponible',
            tipo: esSerieItem ? 'serie' : 'pelicula',
            esSerieItem,
            esPeliculaItem
          };
        })
        .slice(0, 12); // Tomar los primeros 12 sin filtrar por tipo
      
      console.log(`✅ Mostrando ${contenidoFormateado.length} títulos similares (mixto)`);
      console.log('🔍 Contenido formateado:', contenidoFormateado.map(item => ({ 
        titulo: item.titulo, 
        tipo: item.tipo,
        id: item.id 
      })));
      
      return contenidoFormateado;
    }
    
    // Si no hay contenido similar, mostrar un mensaje o array vacío
    console.log(`❌ No hay contenido similar disponible para esta ${esSerie ? 'serie' : 'película'}`);
    return [];
  }, [detallesCompletos, esSerie]);

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

  useEffect(() => {
    if (peliculaData && peliculaData.id) {
      setEnMiLista(estaEnMiLista(peliculaData.id));
      // Cargar calificación actual del perfil
      cargarCalificacionActual();
    }
  }, [peliculaData, estaEnMiLista, perfilActual]);

  const cargarCalificacionActual = async () => {
    if (!perfilActual?.id || !peliculaData?.id) return;
    
    try {
      const calificacion = await apiCalificaciones.obtenerCalificacion(
        perfilActual.id, 
        peliculaData.id?.toString() || '0'
      );
      setCalificacionActual(calificacion?.calificacion || 0);
    } catch (error) {
      console.error('Error al cargar calificación:', error);
      setCalificacionActual(0);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleDownload = () => {
    // Lógica para descargar
    console.log('Descargando película:', peliculaData.titulo);
  };

  const handleSearch = () => {
    navigation.navigate('Buscar');
  };

  const handlePlay = () => {
    // Lógica para reproducir video
    console.log('Reproduciendo:', peliculaData.titulo);
  };

  const handleVer = () => {
    // Lógica para ver la película
    console.log('Ver película:', peliculaData.titulo);
  };

  // Función para manejar la reproducción del video
  const handlePlayVideo = () => {
    // URLs de videos de prueba aleatorios
    const videosAleatorios = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
    ];
    
    const videoAleatorio = videosAleatorios[Math.floor(Math.random() * videosAleatorios.length)];
    
    // Aquí podrías navegar a una pantalla de reproductor de video
    // o abrir un modal con el video
    console.log('Reproduciendo video:', videoAleatorio);
    // navigation.navigate('ReproductorVideo', { videoUrl: videoAleatorio });
  };

  const handleAgregarMiLista = async () => {
    const resultado = await toggleMiLista(peliculaData);
    if (resultado !== undefined) {
      setEnMiLista(!enMiLista);
    }
  };

  const handleCalificar = () => {
    setModalCalificacionVisible(true);
  };

  const handleCalificacionGuardada = (nuevaCalificacion) => {
    setCalificacionActual(nuevaCalificacion);
  };

  const handleCompartir = () => {
    // Lógica para compartir
    console.log('Compartir:', peliculaData.titulo);
  };

  const handlePeliculaPress = (pelicula) => {
    console.log('Navegando a contenido similar:', pelicula);
    
    // Crear objeto con el formato correcto para la navegación
    const contenidoParaNavegar = {
      ...pelicula,
      // Asegurar que tenga las propiedades necesarias
      titulo: pelicula.title || pelicula.name || pelicula.titulo,
      imagen: pelicula.poster_url || pelicula.poster_small || pelicula.imagen,
      // Agregar tipo si no existe
      tipo: pelicula.tipo || (pelicula.media_type === 'tv' || pelicula.name || pelicula.first_air_date ? 'serie' : 'pelicula')
    };
    
    // Navegar a los detalles del contenido similar
    navigation.push('DetallePelicula', { pelicula: contenidoParaNavegar });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
      
      <HeaderDetalle 
        onGoBack={handleGoBack}
        onDownload={handleDownload}
        onSearch={handleSearch}
      />

      {cargando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <VideoPlayer 
            imagen={peliculaData.imagen}
            onPlay={handlePlayVideo}
          />

          <InfoPelicula 
            titulo={peliculaData.titulo}
            año={peliculaData.año}
            duracion={peliculaData.duracion}
            clasificacion={peliculaData.clasificacion}
            ranking={peliculaData.ranking}
            generos={peliculaData.generos}
            esSerie={esSerie}
            temporadas={peliculaData.temporadas}
            episodios={peliculaData.episodios}
          />

          <BotonesAccion 
            onVer={handleVer}
            onDescargar={handleDownload}
          />

          <DescripcionPelicula 
            descripcion={peliculaData.descripcion}
            protagonistas={peliculaData.protagonistas}
            direccion={peliculaData.direccion}
            generos={peliculaData.generos}
            esSerie={esSerie}
          />

          <BotonesInteraccion 
            onMiLista={handleAgregarMiLista}
            onCalificar={handleCalificar}
            onCompartir={handleCompartir}
            enMiLista={enMiLista}
          />

          {/* Componente específico para series */}
          <TemporadasSerie 
            temporadas={esSerie ? (detallesCompletos?.temporadas || detallesCompletos?.seasons || []) : []}
            esSerie={esSerie}
          />

          <PeliculasSimilares 
            peliculas={peliculasSimilares}
            onPeliculaPress={handlePeliculaPress}
          />
        </ScrollView>
      )}

      {/* Modal de calificación */}
      <ModalCalificacion
        visible={modalCalificacionVisible}
        onClose={() => setModalCalificacionVisible(false)}
        contenido={peliculaData}
        calificacionActual={calificacionActual}
        onCalificacionGuardada={handleCalificacionGuardada}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
});