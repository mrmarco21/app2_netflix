import React, { useState, useEffect, useRef } from 'react';
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
import { useHistorial } from '../contextos/HistorialContext';
import { obtenerDetallePelicula, obtenerDetalleSerie, obtenerSerieCompleta } from '../servicios/tmdbService';
import { buscarTrailerEnYouTube, obtenerTrailerManual, obtenerTrailerManualEpisodio } from '../servicios/youtubeService';
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
import VideoPlayerSimulado from '../componentes/VideoPlayerSimulado';
import ReproductorWeb from '../componentes/ReproductorWeb';
import ReproductorYouTube from '../componentes/ReproductorYouTube';
import { Platform } from 'react-native';
import { useDescargas } from '../contextos/DescargasContext';
import { detectarTipoContenido } from '../utilidades/tipoContenido';

export default function DetallePelicula({ navigation, route }) {
  const { pelicula } = route.params || {};
  const [enMiLista, setEnMiLista] = useState(false);
  const [detallesCompletos, setDetallesCompletos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [esSerie, setEsSerie] = useState(false);
  const [modalCalificacionVisible, setModalCalificacionVisible] = useState(false);
  const [calificacionActual, setCalificacionActual] = useState(0);
  const [reproductorVisible, setReproductorVisible] = useState(false);
  const { agregarAlHistorial } = useHistorial();
  const registroHistorialIdRef = useRef(null);
  const { toggleMiLista, estaEnMiLista, miLista } = useMiLista();
  const { perfilActual } = useUsuario();
  const { iniciarDescarga } = useDescargas();

  // Efecto para detectar el tipo de contenido y cargar detalles
  useEffect(() => {
    if (pelicula) {
      console.log('Datos de película recibidos:', JSON.stringify(pelicula, null, 2));
      
      // PRIORIZAR EL TIPO QUE VIENE DESDE LA NAVEGACIÓN (InicioApp.jsx, CategoriaCompleta.jsx, etc.)
      let esSerieDetectada;
      if (pelicula.tipo === 'serie') {
        console.log('✅ Tipo SERIE confirmado desde navegación');
        esSerieDetectada = true;
      } else if (pelicula.tipo === 'pelicula') {
        console.log('✅ Tipo PELÍCULA confirmado desde navegación');
        esSerieDetectada = false;
      } else {
        // Solo usar detección automática si no viene el tipo explícito
        const { esSerie: esSerieAuto } = detectarTipoContenido(pelicula);
        esSerieDetectada = esSerieAuto;
        console.log(`✅ Detectado automáticamente como: ${esSerieDetectada ? 'SERIE' : 'PELÍCULA'}`);
      }
      
      console.log(`🎯 TIPO FINAL DEFINITIVO: ${esSerieDetectada ? 'SERIE' : 'PELÍCULA'}`);
      setEsSerie(esSerieDetectada);
      
      cargarDetallesCompletos();
    }
  }, [pelicula]);

  const cargarDetallesCompletos = async () => {
    try {
      setCargando(true);
      console.log('Cargando detalles para:', pelicula);

      // Usar la función centralizada para detectar el tipo (solo para logs)
      const { esSerie: esSerieDetectada, tipoTMDB } = detectarTipoContenido(pelicula);

      console.log('Detectado como:', esSerieDetectada ? 'serie' : 'película');
      console.log('Tipo TMDB:', tipoTMDB);
      // NO llamar setEsSerie aquí para evitar múltiples cambios de estado

      // Si ya tenemos datos completos (desde TMDB), usarlos directamente
      if (pelicula?.overview || pelicula?.genres || pelicula?.cast || pelicula?.temporadas || pelicula?.seasons) {
        console.log('Usando datos completos existentes');
        console.log('Temporadas disponibles en datos existentes:', pelicula?.temporadas?.length || pelicula?.seasons?.length || 0);
        setDetallesCompletos(pelicula);
        return;
      }

      // PRIORIDAD: Si viene del historial (searchByTitle), buscar directamente por título
      if (pelicula?.searchByTitle && (pelicula.titulo || pelicula.title || pelicula.name)) {
        const titulo = pelicula.titulo || pelicula.title || pelicula.name;
        console.log(`🎯 BÚSQUEDA PRIORITARIA POR TÍTULO (desde historial): "${titulo}"`);
        
        try {
          // Importar función de búsqueda
          const { buscarContenido } = await import('../servicios/tmdbService');
          const resultadosBusqueda = await buscarContenido(titulo);
          
          if (resultadosBusqueda?.results?.length > 0) {
            // Buscar el resultado más relevante
            const resultadoMasRelevante = resultadosBusqueda.results.find(item => {
              const tituloItem = item.title || item.name || '';
              const tituloOriginal = item.original_title || item.original_name || '';
              
              // Coincidencia exacta (ignorando mayúsculas/minúsculas)
              return tituloItem.toLowerCase() === titulo.toLowerCase() ||
                     tituloOriginal.toLowerCase() === titulo.toLowerCase();
            }) || resultadosBusqueda.results[0]; // Si no hay coincidencia exacta, tomar el primero
            
            console.log(`✅ Encontrado contenido por título desde historial:`, resultadoMasRelevante);
            
            // Cargar detalles completos del contenido encontrado
            const { esSerie: esSerieEncontrada } = detectarTipoContenido(resultadoMasRelevante);
            
            let detallesEncontrados;
            if (esSerieEncontrada) {
              detallesEncontrados = await obtenerSerieCompleta(resultadoMasRelevante.id);
            } else {
              detallesEncontrados = await obtenerDetallePelicula(resultadoMasRelevante.id);
            }
            
            if (detallesEncontrados && !detallesEncontrados.error) {
              console.log('✅ Detalles completos cargados desde búsqueda por título (historial)');
              setDetallesCompletos(detallesEncontrados);
              return;
            }
          }
        } catch (searchError) {
          console.error('❌ Error en búsqueda prioritaria por título:', searchError);
        }
      }

      // Si no es búsqueda por título o falló, intentar por ID (flujo normal)
      if (pelicula?.id) {
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
          console.log('Detalles cargados exitosamente por ID:', detalles);
          console.log('Temporadas disponibles:', detalles.temporadas?.length || 0);
          setDetallesCompletos(detalles);
          return;
        }
      }

      // FALLBACK: Buscar por título si no se encuentra por ID
      if (pelicula.titulo || pelicula.title || pelicula.name) {
        const titulo = pelicula.titulo || pelicula.title || pelicula.name;
          console.log(`🔍 Buscando contenido por título: "${titulo}"`);
          
          try {
            // Importar función de búsqueda
            const { buscarContenido } = await import('../servicios/tmdbService');
            const resultadosBusqueda = await buscarContenido(titulo);
            
            if (resultadosBusqueda?.results?.length > 0) {
              // Buscar el resultado más relevante
              const resultadoMasRelevante = resultadosBusqueda.results.find(item => {
                const tituloItem = item.title || item.name || '';
                const tituloOriginal = item.original_title || item.original_name || '';
                
                // Coincidencia exacta (ignorando mayúsculas/minúsculas)
                return tituloItem.toLowerCase() === titulo.toLowerCase() ||
                       tituloOriginal.toLowerCase() === titulo.toLowerCase();
              }) || resultadosBusqueda.results[0]; // Si no hay coincidencia exacta, tomar el primero
              
              console.log(`✅ Encontrado contenido por título:`, resultadoMasRelevante);
              
              // Cargar detalles completos del contenido encontrado
              const { esSerie: esSerieEncontrada } = detectarTipoContenido(resultadoMasRelevante);
              
              let detallesEncontrados;
              if (esSerieEncontrada) {
                detallesEncontrados = await obtenerSerieCompleta(resultadoMasRelevante.id);
              } else {
                detallesEncontrados = await obtenerDetallePelicula(resultadoMasRelevante.id);
              }
              
              if (detallesEncontrados && !detallesEncontrados.error) {
                console.log('✅ Detalles completos cargados desde búsqueda por título');
                setDetallesCompletos(detallesEncontrados);
                return;
              }
            }
          } catch (searchError) {
            console.error('❌ Error en búsqueda por título:', searchError);
          }
        }
        
      // Si la búsqueda por título también falla, usar los datos básicos disponibles
      console.log('📝 Usando datos básicos disponibles como fallback');
      setDetallesCompletos(pelicula);
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
        imagen: pelicula?.poster_path ? `https://image.tmdb.org/t/p/w300${pelicula.poster_path}` :
                pelicula?.poster_url || pelicula?.imagen || null,
        descripcion: 'Descripción no disponible',
        generos: 'Géneros no disponibles',
        protagonistas: 'Reparto no disponible',
        direccion: 'Director no disponible'
      };
    }

    console.log('Formateando datos para:', esSerie ? 'serie' : 'película', datosParaMostrar);

    // Función helper para obtener imagen válida
    const obtenerImagenValida = (datos) => {
      if (!datos) return null;
      return (datos.backdrop_path ? `https://image.tmdb.org/t/p/w500${datos.backdrop_path}` : null) ||
             (datos.poster_path ? `https://image.tmdb.org/t/p/w300${datos.poster_path}` : null) ||
             datos.backdrop_url || datos.poster_url || datos.imagen || null;
    };

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
        imagen: obtenerImagenValida(datosParaMostrar),
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
        imagen: obtenerImagenValida(datosParaMostrar),
        descripcion: datosParaMostrar.overview || datosParaMostrar.descripcion,
        generos: datosParaMostrar.genres?.map(g => g.name).join(', ') || datosParaMostrar.generos || '',
        protagonistas: datosParaMostrar.cast?.slice(0, 3).map(c => c.name).join(', ') || datosParaMostrar.protagonistas || 'Reparto principal',
        direccion: datosParaMostrar.crew?.find(c => c.job === 'Director')?.name || datosParaMostrar.direccion || 'Director desconocido',
        tipo: 'pelicula'
      };
    }
  };

  const peliculaData = React.useMemo(() => {
    return formatearDatos();
  }, [pelicula, detallesCompletos, esSerie]);

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
  }, [peliculaData, estaEnMiLista, perfilActual, miLista]); // Agregar miLista como dependencia

  // Agregar al historial cuando se abre la pantalla de detalle
  useEffect(() => {
    if (!peliculaData?.id || !perfilActual?.id) return;

    // USAR EL TIPO ORIGINAL DE LA NAVEGACIÓN PARA EVITAR CAMBIOS MÚLTIPLES
    let tipoFinal, tipoTMDBFinal;
    if (pelicula?.tipo === 'serie') {
      console.log('✅ Usando tipo SERIE original de navegación para historial');
      tipoFinal = 'serie';
      tipoTMDBFinal = 'tv';
    } else if (pelicula?.tipo === 'pelicula') {
      console.log('✅ Usando tipo PELÍCULA original de navegación para historial');
      tipoFinal = 'pelicula';
      tipoTMDBFinal = 'movie';
    } else {
      // Solo usar detección automática si no viene el tipo explícito
      const { tipoTMDB, tipoHistorial } = detectarTipoContenido(pelicula || peliculaData);
      tipoFinal = tipoHistorial;
      tipoTMDBFinal = tipoTMDB;
      console.log(`✅ Detectado automáticamente para historial: ${tipoFinal}`);
    }

    const idCompuesto = `${tipoTMDBFinal}_${peliculaData.id}`;

    // Evitar registrar múltiples veces el mismo contenido
    if (registroHistorialIdRef.current === idCompuesto) return;

    // Asegurar que siempre haya una imagen válida
    const imagenParaHistorial = pelicula?.imagen || 
                               peliculaData?.imagen || 
                               (pelicula?.poster_path ? `https://image.tmdb.org/t/p/w300${pelicula.poster_path}` : null) ||
                               (pelicula?.backdrop_path ? `https://image.tmdb.org/t/p/w300${pelicula.backdrop_path}` : null) ||
                               (detallesCompletos?.poster_path ? `https://image.tmdb.org/t/p/w300${detallesCompletos.poster_path}` : null) ||
                               (detallesCompletos?.backdrop_path ? `https://image.tmdb.org/t/p/w300${detallesCompletos.backdrop_path}` : null) ||
                               pelicula?.poster_url ||
                               pelicula?.backdrop_url ||
                               null;

    console.log('📝 [DETALLE_PELICULA] Guardando en historial (ÚNICA VEZ):', {
      fuente: 'DetallePelicula.jsx',
      idOriginal: peliculaData.id,
      idCompuesto: idCompuesto,
      titulo: peliculaData.titulo,
      imagen: imagenParaHistorial,
      tipo: tipoFinal,
      tipoTMDB: tipoTMDBFinal
    });

    agregarAlHistorial({
      idPerfil: perfilActual.id,
      idContenido: idCompuesto, // Usar ID compuesto
      titulo: peliculaData.titulo,
      imagen: imagenParaHistorial,
      tipo: tipoFinal, // Usar tipo determinado una sola vez
      fuente: 'DetallePelicula' // Identificador de origen
    });

    registroHistorialIdRef.current = idCompuesto;
  }, [peliculaData?.id, peliculaData?.titulo, perfilActual?.id]); // Remover peliculaData?.tipo de las dependencias

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
    if (!peliculaData) return;
    iniciarDescarga({
      id: peliculaData.id,
      titulo: peliculaData.titulo,
      imagen: peliculaData.imagen || peliculaData.poster_small || peliculaData.poster_url,
    });
    console.log('📥 Descarga iniciada:', peliculaData.titulo);
  };

  const handleSearch = () => {
    navigation.navigate('Buscar');
  };

  const handlePlay = () => {
    // Lógica para reproducir video
    console.log('Reproduciendo:', peliculaData.titulo);
  };

  const [reproductorWebVisible, setReproductorWebVisible] = useState(false);
  const [trailerFallbackUrl, setTrailerFallbackUrl] = useState(null);
  // Extrae la URL del tráiler desde la respuesta de TMDB (película o serie)
  const extraerTrailerUrl = (det) => {
    try {
      if (!det) return null;
      // Campos directos comunes
      if (det.trailer_url) return det.trailer_url;
      if (det.trailer && typeof det.trailer === 'string') return det.trailer;
      if (det.video_key) return `https://www.youtube.com/watch?v=${det.video_key}`;
      if (det.trailer_oficial?.key) return `https://www.youtube.com/watch?v=${det.trailer_oficial.key}`;

      // Estructura estándar de TMDB: videos.results
      const results = det?.videos?.results || det?.videos || det?.videos_results;
      if (Array.isArray(results) && results.length) {
        const pick =
          results.find(v => (v.type || '').toLowerCase() === 'trailer' && (v.site || '').toLowerCase() === 'youtube' && (v.official || /oficial/i.test(v.name || ''))) ||
          results.find(v => (v.type || '').toLowerCase() === 'trailer' && (v.site || '').toLowerCase() === 'youtube') ||
          results.find(v => (v.site || '').toLowerCase() === 'youtube');
        if (pick?.key) return `https://www.youtube.com/watch?v=${pick.key}`;
        if (pick?.url) return pick.url;
      }
    } catch (e) {
      // Ignorar y devolver null
    }
    return null;
  };

  // URL del tráiler priorizando detalles completos si están cargados
  // Priorizar el trailer manual si existe para el título
  const tituloBase = peliculaData?.titulo || peliculaData?.name;
  const manualUrl = obtenerTrailerManual(tituloBase);
  const trailerUrl = manualUrl || extraerTrailerUrl(detallesCompletos || peliculaData);
  const URL_REPRODUCCION = trailerUrl || null;
  if (URL_REPRODUCCION) {
    console.log('🎥 URL de tráiler:', URL_REPRODUCCION);
  } else {
    console.log('⚠️ No se encontró tráiler en TMDB para:', peliculaData?.titulo);
  }

  const handleVer = async () => {
    console.log('Ver película:', peliculaData?.titulo);
    if (URL_REPRODUCCION) {
      // Abrir reproductor WebView (YouTube embebido) en horizontal
      console.log('✅ Abriendo reproductor con URL:', URL_REPRODUCCION);
      setReproductorWebVisible(true);
    } else {
      // Fallback: buscar tráiler en YouTube según el título
      try {
        const url = await buscarTrailerEnYouTube(
          peliculaData?.titulo || peliculaData?.name,
          peliculaData?.año
        );
        if (url) {
          console.log('🔎 Tráiler encontrado en YouTube (fallback):', url);
          setTrailerFallbackUrl(url);
          setReproductorWebVisible(true);
        } else {
          // Fallback final: reproductor simulado
          console.log('🧪 Usando reproductor simulado: sin URL de YouTube');
          setReproductorVisible(true);
        }
      } catch (e) {
        console.log('Error al buscar tráiler en YouTube:', e);
        setReproductorVisible(true);
      }
    }
  };

  // Reproducir episodio desde TemporadasSerie
  const handleReproducirEpisodio = async (episodio) => {
    const serieTitulo = peliculaData?.titulo || peliculaData?.name;
    const numero = episodio?.episode_number;
    const nombre = episodio?.name;
    console.log('📺 Solicitud de reproducción de episodio:', { serieTitulo, numero, nombre });

    // 1) Intentar mapeo manual de episodio
    const manualEp = obtenerTrailerManualEpisodio(serieTitulo, numero, nombre);
    if (manualEp) {
      console.log('🎬 Tráiler manual de episodio encontrado =>', manualEp);
      setTrailerFallbackUrl(manualEp);
      setReproductorWebVisible(true);
      return;
    }

    // 2) Fallback: buscar en YouTube combinando serie + episodio
    try {
      const query = `${serieTitulo} episodio ${numero} ${nombre} trailer`;
      const url = await buscarTrailerEnYouTube(query, peliculaData?.año);
      if (url) {
        console.log('🔎 Tráiler de episodio encontrado en YouTube:', url);
        setTrailerFallbackUrl(url);
        setReproductorWebVisible(true);
        return;
      }
    } catch (e) {
      console.log('❗ Error buscando tráiler de episodio en YouTube:', e);
    }

    // 3) Fallback final: reproductor simulado
    console.log('🧪 Usando reproductor simulado para episodio: sin URL');
    setReproductorVisible(true);
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
      // No actualizar manualmente el estado, dejar que el useEffect lo haga
      // basado en el contexto actualizado
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
            onReproducirEpisodio={handleReproducirEpisodio}
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

      {/* Reproductor simulado */}
      <VideoPlayerSimulado
        visible={reproductorVisible}
        onClose={() => setReproductorVisible(false)}
        titulo={peliculaData?.titulo || 'Video'}
        pelicula={peliculaData}
        esSerie={esSerie}
      />

      {/* Reproducción: YouTube nativo en iOS/Android; iframe via WebView en web */}
      {Platform.OS === 'web' ? (
        <ReproductorWeb
          visible={reproductorWebVisible}
          onClose={() => setReproductorWebVisible(false)}
          url={trailerFallbackUrl || URL_REPRODUCCION}
          titulo={peliculaData?.titulo || 'Video'}
        />
      ) : (
        <ReproductorYouTube
          visible={reproductorWebVisible}
          onClose={() => setReproductorWebVisible(false)}
          url={trailerFallbackUrl || URL_REPRODUCCION}
          titulo={peliculaData?.titulo || 'Video'}
        />
      )}
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