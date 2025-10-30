import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMiLista } from '../contextos/MiListaContext';
import { useUsuario } from '../contextos/UsuarioContext';
import ModalPinPerfil from '../componentes/ModalPinPerfil';

// Servicios TMDB
import {
  obtenerPeliculasPopulares,
  obtenerSeriesPopulares,
  obtenerSeriesTendencia,
  obtenerPeliculasPorGenero,
  obtenerSeriesPorGenero
} from '../servicios/tmdbService';

// Componentes modulares
import HeaderInicio from '../componentes/HeaderInicio';
import FiltrosInicio from '../componentes/FiltrosInicio';
import BannerDestacado from '../componentes/BannerDestacado';
import SeccionContenido from '../componentes/SeccionContenido';
import ModalCategorias from '../componentes/ModalCategorias';
import NavegacionInferior from '../componentes/NavegacionInferior';

export default function InicioApp({ navigation, route }) {
  const { perfil, idUsuario } = route.params || {};
  const [filtroActivo, setFiltroActivo] = useState('Inicio');
  const [modalVisible, setModalVisible] = useState(false);
  const [contenidoDestacado, setContenidoDestacado] = useState(null);
  const [continuarViendo, setContinuarViendo] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [modalPinVisible, setModalPinVisible] = useState(false);

  const { toggleMiLista } = useMiLista();
  const { 
    establecerUsuario, 
    establecerPerfilActual, 
    perfilActual,
    requiereVerificacionPin,
    actualizarActividad,
    verificarInactividad,
    solicitarVerificacionPin
  } = useUsuario();

  // Mapeo de géneros para películas (IDs de TMDB)
  const generosPeliculas = {
    'Acción': 28,
    'Comedia': 35,
    'Drama': 18,
    'Terror': 27,
    'Ciencia Ficción': 878,
    'Thriller': 53,
    'Romance': 10749,
    'Animación': 16
  };

  // Mapeo de géneros para series (IDs de TMDB)
  const generosSeries = {
    'Acción y Aventura': 10759,
    'Comedia de Series': 35,
    'Drama de Series': 18,
    'Crimen': 80,
    'Ciencia Ficción y Fantasía': 10765,
    'Misterio': 9648
  };

  // Establecer el usuario y perfil en el contexto global cuando se monta el componente
  useEffect(() => {
    if (idUsuario && perfil) {
      console.log('🔄 Estableciendo usuario y perfil en InicioApp:', { idUsuario, perfil: perfil.nombre });
      establecerUsuario({ id: idUsuario });
      // Solo establecer el perfil si es diferente al actual para evitar re-renders innecesarios
      if (!perfilActual || perfilActual.id !== perfil.id) {
        establecerPerfilActual(perfil);
      }
    }
  }, [idUsuario, perfil, perfilActual]);

  // Manejar verificación de PIN cuando se requiere
  useEffect(() => {
    if (requiereVerificacionPin && perfilActual?.pin && !modalPinVisible) {
      console.log('🔐 Mostrando modal PIN por verificación requerida');
      setModalPinVisible(true);
    }
  }, [requiereVerificacionPin, perfilActual?.pin, modalPinVisible]);

  // Manejar cambios en el estado de la aplicación
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      console.log('📱 Estado de la app cambió a:', nextAppState);
      
      if (nextAppState === 'active') {
        console.log('🔄 App volvió a estar activa, verificando inactividad...');
        // La app volvió a estar activa, verificar si necesita PIN
        if (verificarInactividad()) {
          console.log('✅ Se requiere PIN, mostrando modal');
          setModalPinVisible(true);
        } else {
          console.log('❌ No se requiere PIN');
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('⏸️ App se fue al fondo, actualizando tiempo de actividad');
        // La app se fue al fondo, actualizar tiempo de actividad
        actualizarActividad();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [verificarInactividad, actualizarActividad]);

  // Actualizar actividad en interacciones del usuario
  const manejarInteraccionUsuario = () => {
    actualizarActividad();
  };

  // Manejar acceso permitido después de verificar PIN
  const manejarAccesoPermitido = (perfil) => {
    setModalPinVisible(false);
    actualizarActividad();
    // No es necesario cambiar el perfil aquí ya que ya está establecido
    // Solo actualizamos la actividad para resetear el timer de inactividad
  };

  // Manejar cierre del modal de PIN
  const cerrarModalPin = () => {
    setModalPinVisible(false);
    // Si se cierra sin verificar, solicitar verificación nuevamente
    if (requiereVerificacionPin) {
      solicitarVerificacionPin();
    }
  };

  // Función para cargar contenido según el filtro activo
  const cargarContenido = async (filtro) => {
    setCargando(true);
    try {
      let nuevasSecciones = [];
      let nuevoContenidoDestacado = null;

      if (filtro === 'Inicio') {
        // Cargar contenido inicial con todas las categorías
        const peliculasPopulares = await obtenerPeliculasPopulares();
        const seriesPopulares = await obtenerSeriesPopulares();

        // Contenido destacado (primera película popular)
        if (peliculasPopulares.results && peliculasPopulares.results.length > 0) {
          const destacada = peliculasPopulares.results[0];
          nuevoContenidoDestacado = {
            id: destacada.id,
            titulo: destacada.title,
            imagen: destacada.poster_url,
            generos: ['Popular', 'Destacado'],
            descripcion: destacada.overview
          };
        }

        // Inicializar array de secciones
        nuevasSecciones = [];

        // 1. Películas Populares
        if (peliculasPopulares.results) {
          nuevasSecciones.push({
            titulo: 'Películas Populares',
            contenido: peliculasPopulares.results.slice(0, 8).map(item => ({
              id: item.id,
              titulo: item.title,
              imagen: item.poster_url,
              tipo: 'pelicula'
            }))
          });
        }

        // 2. Series Populares
        if (seriesPopulares.results) {
          nuevasSecciones.push({
            titulo: 'Series Populares',
            contenido: seriesPopulares.results.slice(0, 6).map(item => ({
              id: item.id,
              titulo: item.name,
              imagen: item.poster_url,
              tipo: 'serie'
            }))
          });
        }

        // 3. Películas de Acción
        try {
          const peliculasAccion = await obtenerPeliculasPorGenero(generosPeliculas['Acción']);
          if (peliculasAccion.results && peliculasAccion.results.length > 0) {
            nuevasSecciones.push({
              titulo: 'Películas de Acción',
              contenido: peliculasAccion.results.slice(0, 8).map(item => ({
                id: item.id,
                titulo: item.title,
                imagen: item.poster_url,
                tipo: 'pelicula'
              }))
            });
          }
        } catch (error) {
          console.error('Error cargando películas de acción:', error);
        }

        // 4. Series de Drama
        try {
          const seriesDrama = await obtenerSeriesPorGenero(generosSeries['Drama de Series']);
          if (seriesDrama.results && seriesDrama.results.length > 0) {
            nuevasSecciones.push({
              titulo: 'Series de Drama',
              contenido: seriesDrama.results.slice(0, 6).map(item => ({
                id: item.id,
                titulo: item.name,
                imagen: item.poster_url,
                tipo: 'serie'
              }))
            });
          }
        } catch (error) {
          console.error('Error cargando series de drama:', error);
        }

        // 5. Películas de Comedia
        try {
          const peliculasComedia = await obtenerPeliculasPorGenero(generosPeliculas['Comedia']);
          if (peliculasComedia.results && peliculasComedia.results.length > 0) {
            nuevasSecciones.push({
              titulo: 'Películas de Comedia',
              contenido: peliculasComedia.results.slice(0, 8).map(item => ({
                id: item.id,
                titulo: item.title,
                imagen: item.poster_url,
                tipo: 'pelicula'
              }))
            });
          }
        } catch (error) {
          console.error('Error cargando películas de comedia:', error);
        }

        // 6. Series de Crimen
        try {
          const seriesCrimen = await obtenerSeriesPorGenero(generosSeries['Crimen']);
          if (seriesCrimen.results && seriesCrimen.results.length > 0) {
            nuevasSecciones.push({
              titulo: 'Series de Crimen',
              contenido: seriesCrimen.results.slice(0, 6).map(item => ({
                id: item.id,
                titulo: item.name,
                imagen: item.poster_url,
                tipo: 'serie'
              }))
            });
          }
        } catch (error) {
          console.error('Error cargando series de crimen:', error);
        }

        // 7. Películas de Terror
        try {
          const peliculasTerror = await obtenerPeliculasPorGenero(generosPeliculas['Terror']);
          if (peliculasTerror.results && peliculasTerror.results.length > 0) {
            nuevasSecciones.push({
              titulo: 'Películas de Terror',
              contenido: peliculasTerror.results.slice(0, 8).map(item => ({
                id: item.id,
                titulo: item.title,
                imagen: item.poster_url,
                tipo: 'pelicula'
              }))
            });
          }
        } catch (error) {
          console.error('Error cargando películas de terror:', error);
        }

        // 8. Series de Ciencia Ficción y Fantasía
        try {
          const seriesSciFi = await obtenerSeriesPorGenero(generosSeries['Ciencia Ficción y Fantasía']);
          if (seriesSciFi.results && seriesSciFi.results.length > 0) {
            nuevasSecciones.push({
              titulo: 'Series de Ciencia Ficción y Fantasía',
              contenido: seriesSciFi.results.slice(0, 6).map(item => ({
                id: item.id,
                titulo: item.name,
                imagen: item.poster_url,
                tipo: 'serie'
              }))
            });
          }
        } catch (error) {
          console.error('Error cargando series de ciencia ficción:', error);
        }

        // 9. Películas de Romance
        try {
          const peliculasRomance = await obtenerPeliculasPorGenero(generosPeliculas['Romance']);
          if (peliculasRomance.results && peliculasRomance.results.length > 0) {
            nuevasSecciones.push({
              titulo: 'Películas de Romance',
              contenido: peliculasRomance.results.slice(0, 8).map(item => ({
                id: item.id,
                titulo: item.title,
                imagen: item.poster_url,
                tipo: 'pelicula'
              }))
            });
          }
        } catch (error) {
          console.error('Error cargando películas de romance:', error);
        }

        // 10. Series de Misterio
        try {
          const seriesMisterio = await obtenerSeriesPorGenero(generosSeries['Misterio']);
          if (seriesMisterio.results && seriesMisterio.results.length > 0) {
            nuevasSecciones.push({
              titulo: 'Series de Misterio',
              contenido: seriesMisterio.results.slice(0, 6).map(item => ({
                id: item.id,
                titulo: item.name,
                imagen: item.poster_url,
                tipo: 'serie'
              }))
            });
          }
        } catch (error) {
          console.error('Error cargando series de misterio:', error);
        }

      } else if (filtro === 'Películas') {
        // Cargar múltiples categorías de películas
        const peliculasPopulares = await obtenerPeliculasPopulares();

        if (peliculasPopulares.results && peliculasPopulares.results.length > 0) {
          const destacada = peliculasPopulares.results[0];
          nuevoContenidoDestacado = {
            id: destacada.id,
            titulo: destacada.title,
            subtitulo: 'Destacado de la semana - Películas',
            imagen: destacada.poster_url,
            generos: ['Popular', 'Película'],
            descripcion: destacada.overview
          };
        }

        // Cargar múltiples categorías de películas
        nuevasSecciones = [];

        // Películas Populares
        if (peliculasPopulares.results) {
          nuevasSecciones.push({
            titulo: 'Películas Populares',
            contenido: peliculasPopulares.results.slice(0, 8).map(item => ({
              id: item.id,
              titulo: item.title,
              imagen: item.poster_url,
              tipo: 'pelicula'
            }))
          });
        }

        // Cargar películas por cada género
        for (const [nombreGenero, idGenero] of Object.entries(generosPeliculas)) {
          try {
            const peliculasPorGenero = await obtenerPeliculasPorGenero(idGenero);
            if (peliculasPorGenero.results && peliculasPorGenero.results.length > 0) {
              nuevasSecciones.push({
                titulo: `Películas de ${nombreGenero}`,
                contenido: peliculasPorGenero.results.slice(0, 8).map(item => ({
                  id: item.id,
                  titulo: item.title,
                  imagen: item.poster_url,
                  tipo: 'pelicula'
                }))
              });
            }
          } catch (error) {
            console.error(`Error cargando películas de ${nombreGenero}:`, error);
          }
        }

      } else if (filtro === 'Series') {
        // Cargar múltiples categorías de series
        const seriesPopulares = await obtenerSeriesPopulares();

        if (seriesPopulares.results && seriesPopulares.results.length > 0) {
          const destacada = seriesPopulares.results[0];
          nuevoContenidoDestacado = {
            id: destacada.id,
            titulo: destacada.name,
            subtitulo: 'Destacado de la semana - Series',
            imagen: destacada.poster_url,
            generos: ['Popular', 'Serie'],
            descripcion: destacada.overview
          };
        }

        // Cargar múltiples categorías de series
        nuevasSecciones = [];

        // Series Populares
        if (seriesPopulares.results) {
          nuevasSecciones.push({
            titulo: 'Series Populares',
            contenido: seriesPopulares.results.slice(0, 6).map(item => ({
              id: item.id,
              titulo: item.name,
              imagen: item.poster_url,
              tipo: 'serie'
            }))
          });
        }

        // Cargar series por cada género
        for (const [nombreGenero, idGenero] of Object.entries(generosSeries)) {
          try {
            const seriesPorGenero = await obtenerSeriesPorGenero(idGenero);
            if (seriesPorGenero.results && seriesPorGenero.results.length > 0) {
              nuevasSecciones.push({
                titulo: `Series de ${nombreGenero}`,
                contenido: seriesPorGenero.results.slice(0, 6).map(item => ({
                  id: item.id,
                  titulo: item.name,
                  imagen: item.poster_url,
                  tipo: 'serie'
                }))
              });
            }
          } catch (error) {
            console.error(`Error cargando series de ${nombreGenero}:`, error);
          }
        }

      } else if (generosPeliculas[filtro]) {
        // Cargar películas por género
        const peliculasPorGenero = await obtenerPeliculasPorGenero(generosPeliculas[filtro]);

        if (peliculasPorGenero.results && peliculasPorGenero.results.length > 0) {
          const destacada = peliculasPorGenero.results[0];
          nuevoContenidoDestacado = {
            id: destacada.id,
            titulo: destacada.title,
            subtitulo: `Destacado de la semana - ${filtro}`,
            imagen: destacada.poster_url,
            generos: [filtro, 'Película'],
            descripcion: destacada.overview
          };

          nuevasSecciones = [{
            titulo: `Películas de ${filtro}`,
            contenido: peliculasPorGenero.results.slice(0, 8).map(item => ({
              id: item.id,
              titulo: item.title,
              imagen: item.poster_url,
              tipo: 'pelicula'
            }))
          }];
        }

      } else if (generosSeries[filtro]) {
        // Cargar series por género
        const seriesPorGenero = await obtenerSeriesPorGenero(generosSeries[filtro]);

        if (seriesPorGenero.results && seriesPorGenero.results.length > 0) {
          const destacada = seriesPorGenero.results[0];
          nuevoContenidoDestacado = {
            id: destacada.id,
            titulo: destacada.name,
            subtitulo: `Destacado de la semana - ${filtro}`,
            imagen: destacada.poster_url,
            generos: [filtro, 'Serie'],
            descripcion: destacada.overview
          };

          nuevasSecciones = [{
            titulo: `Series de ${filtro}`,
            contenido: seriesPorGenero.results.slice(0, 6).map(item => ({
              id: item.id,
              titulo: item.name,
              imagen: item.poster_url,
              tipo: 'serie'
            }))
          }];
        }

      } else if (filtro === 'Mi lista') {
        // Cargar películas populares para Mi lista
        const peliculasPopulares = await obtenerPeliculasPopulares(1);
        if (peliculasPopulares.results && peliculasPopulares.results.length > 0) {
          nuevasSecciones = [{
            titulo: 'Mi lista',
            contenido: peliculasPopulares.results.slice(0, 4).map(item => ({
              id: item.id,
              titulo: item.title,
              imagen: item.poster_url,
              tipo: 'pelicula'
            }))
          }];
        }
      }

      setContenidoDestacado(nuevoContenidoDestacado);
      setSecciones(nuevasSecciones);

    } catch (error) {
      console.error('Error al cargar contenido:', error);
      // Mantener contenido por defecto en caso de error
    } finally {
      setCargando(false);
    }
  };

  // useEffect para cargar contenido cuando cambia el filtro
  useEffect(() => {
    cargarContenido(filtroActivo);
  }, [filtroActivo]);

  // Cargar "Continuar viendo" con datos reales
  useEffect(() => {
    const cargarContinuarViendo = async () => {
      try {
        const seriesTendencia = await obtenerSeriesTendencia(1);
        if (seriesTendencia.results && seriesTendencia.results.length > 0) {
          const continuarViendoData = seriesTendencia.results.slice(0, 4).map((item, index) => ({
            id: item.id,
            titulo: item.name,
            imagen: item.poster_url,
            progreso: [0.65, 0.30, 0.85, 0.45][index] || 0.50 // Progreso simulado
          }));
          setContinuarViendo(continuarViendoData);
        }
      } catch (error) {
        console.error('Error al cargar continuar viendo:', error);
        // Fallback con datos mínimos si hay error
        setContinuarViendo([]);
      }
    };
    
    cargarContinuarViendo();
  }, []);

  // Categorías para el modal (actualizadas con las nuevas categorías)
  const categorias = [
    'Inicio', 'Mi lista',
    // Películas
    'Acción', 'Comedia', 'Drama', 'Terror', 'Ciencia Ficción', 'Thriller', 'Romance', 'Animación',
    // Series
    'Acción y Aventura', 'Crimen', 'Sci-Fi & Fantasy', 'Misterio'
  ];

  const handleBuscarPress = () => {
    navigation.navigate('Buscar');
  };

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FFFFFF', fontSize: 18 }}>Cargando contenido...</Text>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />

      <HeaderInicio
        filtroActivo={filtroActivo}
        onPressBuscar={() => navigation.navigate('Buscar')}
      />

      <FiltrosInicio
        filtroActivo={filtroActivo}
        setFiltroActivo={setFiltroActivo}
        setModalVisible={setModalVisible}
      />

      <ScrollView 
        style={styles.scrollContainer}
        onTouchStart={manejarInteraccionUsuario}
        onScrollBeginDrag={manejarInteraccionUsuario}
      >
        <BannerDestacado
          contenidoDestacado={contenidoDestacado}
          onAgregarAMiLista={toggleMiLista}
        />

        {continuarViendo.length > 0 && (
          <SeccionContenido
            titulo="Continuar viendo"
            contenido={continuarViendo}
            esContinuarViendo={true}
            onAgregarAMiLista={toggleMiLista}
          />
        )}

        {secciones.map((seccion, index) => (
          <SeccionContenido
            key={index}
            titulo={seccion.titulo}
            contenido={seccion.contenido}
            onAgregarAMiLista={toggleMiLista}
            categoriaCompleta={seccion.contenido} // Pasar el contenido completo para el botón "Ver más"
          />
        ))}
      </ScrollView>

      <NavegacionInferior navigation={navigation} activeTab="Inicio" />

      <ModalCategorias
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        categorias={categorias}
        setFiltroActivo={setFiltroActivo}
        filtroActivo={filtroActivo}
      />

      <ModalPinPerfil
        visible={modalPinVisible}
        perfil={perfilActual}
        onAccesoPermitido={manejarAccesoPermitido}
        onCerrar={cerrarModalPin}
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
});