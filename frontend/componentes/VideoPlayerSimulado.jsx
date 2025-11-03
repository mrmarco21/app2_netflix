import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  StatusBar,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useHistorial } from '../contextos/HistorialContext';
import { useUsuario } from '../contextos/UsuarioContext';
import { detectarTipoContenido } from '../utilidades/tipoContenido';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const getLandscapeDimensions = () => {
  return {
    width: Math.max(screenWidth, screenHeight),
    height: Math.min(screenWidth, screenHeight),
  };
};

export default function VideoPlayerSimulado({ 
  visible, 
  onClose, 
  titulo,
  pelicula, // Desde DetallePelicula
  contenido, // Desde InicioApp
  esSerie = false, // Nuevo prop para determinar el tipo correctamente
  progresoInicial = 0 // Nuevo prop para continuar viendo
}) {
  const { agregarAlHistorial } = useHistorial();
  const { perfilActual } = useUsuario();
  
  const [reproduciendo, setReproduciendo] = useState(false);
  const [mostrarControles, setMostrarControles] = useState(true);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(Math.floor(progresoInicial * 7320 / 100) || 4);
  const [duracionTotal] = useState(7320);
  const [progreso, setProgreso] = useState(progresoInicial || 0.33);
  const [yaGuardadoEnHistorial, setYaGuardadoEnHistorial] = useState(false);

  const landscapeDimensions = getLandscapeDimensions();

  // Función para guardar en historial
  const guardarEnHistorial = async (progresoActual) => {
    // Usar pelicula o contenido según lo que esté disponible
    const datosContenido = pelicula || contenido;
    if (!perfilActual?.id || !datosContenido) return;

    // Usar la función centralizada para detectar el tipo de contenido
    const { tipoHistorial, tipoTMDB } = detectarTipoContenido(datosContenido);
    
    // Si se pasa explícitamente esSerie, respetarlo (para compatibilidad)
    let tipoFinal = tipoHistorial;
    if (esSerie !== undefined) {
      tipoFinal = esSerie ? 'serie' : 'pelicula';
      console.log('🎬 VideoPlayerSimulado: Usando tipo explícito pasado como prop:', tipoFinal);
    } else {
      console.log('🎬 VideoPlayerSimulado: Tipo detectado automáticamente:', tipoFinal);
    }

    // Crear ID compuesto para evitar conflictos entre películas y series
    const tipoTMDBFinal = tipoFinal === 'serie' ? 'tv' : 'movie';
    const idCompuesto = `${tipoTMDBFinal}_${datosContenido.id}`;

    const datosHistorial = {
      idPerfil: perfilActual.id,
      idContenido: idCompuesto, // Usar ID compuesto
      titulo: titulo || datosContenido.title || datosContenido.name || datosContenido.titulo,
      tipo: tipoFinal, // Usar el tipo final determinado
      imagen: datosContenido.poster_path || datosContenido.imagen,
      porcentajeVisto: Math.round(progresoActual),
      tiempoReproducido: tiempoTranscurrido,
      duracionTotal: duracionTotal
    };

    console.log('🎬 [VIDEO_PLAYER] VideoPlayerSimulado guardando en historial:', {
      fuente: 'VideoPlayerSimulado.jsx',
      titulo: datosHistorial.titulo,
      tipo: datosHistorial.tipo,
      idCompuesto: datosHistorial.idContenido,
      progreso: `${Math.round(progresoActual)}%`,
      tipoDetectado: tipoHistorial,
      tipoFinal: tipoFinal,
      esSerieProp: esSerie
    });
    
    try {
      await agregarAlHistorial({
        ...datosHistorial,
        fuente: 'VideoPlayerSimulado' // Identificador de origen
      });
      setYaGuardadoEnHistorial(true);
    } catch (error) {
      console.error('❌ Error al guardar en historial:', error);
    }
  };

  const cambiarOrientacion = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
      StatusBar.setHidden(true);
    } catch (error) {
      console.log('Error cambiando orientación:', error);
      if (typeof document !== 'undefined') {
        const body = document.body;
        const html = document.documentElement;
        
        // Obtener dimensiones de la ventana
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Aplicar transformación con centrado mejorado
        body.style.transform = 'rotate(90deg)';
        body.style.transformOrigin = 'center center';
        body.style.width = `${windowHeight}px`;
        body.style.height = `${windowWidth}px`;
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.top = '50%';
        body.style.left = '50%';
        body.style.marginTop = `${-windowWidth / 2}px`;
        body.style.marginLeft = `${-windowHeight / 2}px`;
        body.style.padding = '0';
        
        // Asegurar que el html también esté configurado correctamente
        html.style.overflow = 'hidden';
        html.style.width = '100%';
        html.style.height = '100%';
      }
    }
  };

  const restaurarOrientacion = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      StatusBar.setHidden(false);
    } catch (error) {
      console.log('Error restaurando orientación:', error);
      if (typeof document !== 'undefined') {
        const body = document.body;
        const html = document.documentElement;
        
        // Limpiar todas las transformaciones y estilos
        body.style.transform = '';
        body.style.transformOrigin = '';
        body.style.width = '';
        body.style.height = '';
        body.style.overflow = '';
        body.style.position = '';
        body.style.top = '';
        body.style.left = '';
        body.style.margin = '';
        body.style.marginTop = '';
        body.style.marginLeft = '';
        body.style.padding = '';
        
        // Restaurar estilos del html
        html.style.overflow = '';
        html.style.width = '';
        html.style.height = '';
      }
    }
  };

  useEffect(() => {
    if (visible) {
      cambiarOrientacion();
    } else {
      restaurarOrientacion();
    }

    return () => {
      if (visible) {
        restaurarOrientacion();
      }
    };
  }, [visible]);

  useEffect(() => {
    let intervalo;
    if (reproduciendo) {
      intervalo = setInterval(() => {
        setTiempoTranscurrido(prev => {
          const nuevoTiempo = prev + 1;
          const nuevoProgreso = (nuevoTiempo / duracionTotal) * 100;
          setProgreso(nuevoProgreso);
          
          // Guardar en historial después de 10 segundos de reproducción
          // y luego cada 30 segundos para actualizar el progreso
          if ((nuevoTiempo === 10 && !yaGuardadoEnHistorial) || 
              (nuevoTiempo > 10 && nuevoTiempo % 30 === 0)) {
            guardarEnHistorial(nuevoProgreso);
          }
          
          return nuevoTiempo;
        });
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [reproduciendo, duracionTotal, yaGuardadoEnHistorial]);

  useEffect(() => {
    if (mostrarControles) {
      const timer = setTimeout(() => {
        setMostrarControles(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mostrarControles]);

  const cerrarVideo = async () => {
    setReproduciendo(false);
    
    // Guardar progreso final si se reprodujo algo
    if (tiempoTranscurrido > 10) {
      await guardarEnHistorial(progreso);
    }
    
    restaurarOrientacion();
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  const toggleReproduccion = () => {
    setReproduciendo(!reproduciendo);
  };

  const formatearTiempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    
    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  const mostrarControlesHandler = () => {
    setMostrarControles(true);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={cerrarVideo}
      supportedOrientations={['landscape-left', 'landscape-right', 'portrait']}
    >
      <View style={[
        styles.videoContainer,
        {
          width: landscapeDimensions.width,
          height: landscapeDimensions.height,
        }
      ]}>
        <TouchableOpacity 
          style={[styles.videoContainer, { width: '100%', height: '100%' }]}
          activeOpacity={1}
          onPress={mostrarControlesHandler}
        >
          <TouchableOpacity 
            style={styles.botonSalirFijo}
            onPress={cerrarVideo}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          <View style={styles.videoBackground}>
            {pelicula?.backdrop_path ? (
              <Image 
                source={{ uri: `https://image.tmdb.org/t/p/w1280${pelicula.backdrop_path}` }}
                style={styles.videoImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.videoPlaceholder}>
                <Ionicons name="film-outline" size={80} color="rgba(255,255,255,0.3)" />
                <Text style={styles.videoPlaceholderText}>
                  {titulo || pelicula?.title || pelicula?.name || 'Reproduciendo video...'}
                </Text>
              </View>
            )}
            
            <View style={styles.videoOverlay} />
            
            {!reproduciendo && (
              <TouchableOpacity 
                style={styles.playButtonCenter}
                onPress={toggleReproduccion}
              >
                <Ionicons name="play" size={60} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {mostrarControles && (
            <View style={styles.controlesContainer}>
              <View style={styles.headerControles}>
                <TouchableOpacity 
                  style={styles.botonCerrar}
                  onPress={cerrarVideo}
                >
                  <Ionicons name="chevron-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.tituloVideo} numberOfLines={1}>
                  {titulo || pelicula?.title || pelicula?.name || 'Video'}
                </Text>
                <View style={styles.espaciador} />
              </View>

              <View style={styles.controlesInferiores}>
                <View style={styles.barraProgresoContainer}>
                  <Text style={styles.tiempoTexto}>
                    {formatearTiempo(tiempoTranscurrido)}
                  </Text>
                  <View style={styles.barraProgreso}>
                    <View style={styles.barraProgresoFondo} />
                    <View 
                      style={[
                        styles.barraProgresoLlena, 
                        { width: `${progreso}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.tiempoTexto}>
                    {formatearTiempo(duracionTotal)}
                  </Text>
                </View>

                <View style={styles.botonesControl}>
                  <TouchableOpacity style={styles.botonControl}>
                    <Ionicons name="play-skip-back" size={24} color="white" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.botonPlayPause}
                    onPress={toggleReproduccion}
                  >
                    <Ionicons 
                      name={reproduciendo ? "pause" : "play"} 
                      size={32} 
                      color="white" 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.botonControl}>
                    <Ionicons name="play-skip-forward" size={24} color="white" />
                  </TouchableOpacity>
                  
                  <View style={styles.espaciadorBotones} />
                  
                  <TouchableOpacity style={styles.botonControl}>
                    <Ionicons name="volume-high" size={24} color="white" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.botonControl}>
                    <Ionicons name="settings" size={24} color="white" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.botonControl}>
                    <Ionicons name="expand" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  botonSalirFijo: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 8,
  },
  videoBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  videoOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  playButtonCenter: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 50,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  headerControles: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
  },
  botonCerrar: {
    padding: 8,
  },
  tituloVideo: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 16,
    flex: 1,
  },
  espaciador: {
    width: 44,
  },
  controlesInferiores: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  barraProgresoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  tiempoTexto: {
    color: 'white',
    fontSize: 14,
    minWidth: 60,
    textAlign: 'center',
  },
  barraProgreso: {
    flex: 1,
    height: 4,
    marginHorizontal: 16,
    position: 'relative',
  },
  barraProgresoFondo: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  barraProgresoLlena: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 2,
  },
  botonesControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonControl: {
    padding: 12,
    marginHorizontal: 8,
  },
  botonPlayPause: {
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
  },
  espaciadorBotones: {
    flex: 1,
  },
});