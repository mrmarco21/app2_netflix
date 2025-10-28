import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMiLista } from '../contextos/MiListaContext';

// Componentes modulares
import HeaderDetalle from '../componentes/HeaderDetalle';
import VideoPlayer from '../componentes/VideoPlayer';
import InfoPelicula from '../componentes/InfoPelicula';
import BotonesAccion from '../componentes/BotonesAccion';
import DescripcionPelicula from '../componentes/DescripcionPelicula';
import BotonesInteraccion from '../componentes/BotonesInteraccion';
import PeliculasSimilares from '../componentes/PeliculasSimilares';

export default function DetallePelicula({ navigation, route }) {
  const { pelicula } = route.params || {};
  const [enMiLista, setEnMiLista] = useState(false);
  const { toggleMiLista, estaEnMiLista } = useMiLista();

  // Datos de ejemplo para la película (normalmente vendrían de una API)
  const peliculaData = pelicula || {
    id: 1,
    titulo: 'Caramelo',
    año: '2025',
    duracion: '1 h 41 min',
    clasificacion: '13+',
    ranking: 'N.° 1 en películas hoy',
    imagen: 'https://via.placeholder.com/400x600/8B4513/FFFFFF?text=CARAMELO',
    descripcion: 'Dirigida por Diego Freitas, esta comedia dramática cuenta la historia de un chef que enfrenta una grave enfermedad y el amigo de cuatro patas que le cambia la vida para siempre.',
    protagonistas: 'Rafael Vitti, Amendoim, Arianne Botelho',
    direccion: 'Diego Freitas'
  };

  // Películas similares de ejemplo
  const peliculasSimilares = [
    { id: 1, titulo: 'La Culpa es Mía', imagen: 'https://via.placeholder.com/150x225/4169E1/FFFFFF?text=LA+CULPA' },
    { id: 2, titulo: 'No se Aceptan Devoluciones', imagen: 'https://via.placeholder.com/150x225/FF6347/FFFFFF?text=NO+DEVOL' },
    { id: 3, titulo: 'Mod Avión', imagen: 'https://via.placeholder.com/150x225/32CD32/FFFFFF?text=MOD+AVION' },
    { id: 4, titulo: 'Paternidad', imagen: 'https://via.placeholder.com/150x225/8B0000/FFFFFF?text=PATERNIDAD' },
    { id: 5, titulo: 'Un Mejor Papá', imagen: 'https://via.placeholder.com/150x225/4B0082/FFFFFF?text=MEJOR+PAPA' },
    { id: 6, titulo: 'Alfa', imagen: 'https://via.placeholder.com/150x225/FF8C00/FFFFFF?text=ALFA' },
    { id: 7, titulo: 'Benji', imagen: 'https://via.placeholder.com/150x225/DC143C/FFFFFF?text=BENJI' },
    { id: 8, titulo: 'Mi Amigo Enzo', imagen: 'https://via.placeholder.com/150x225/228B22/FFFFFF?text=ENZO' },
    { id: 9, titulo: 'Mi Año en Oxford', imagen: 'https://via.placeholder.com/150x225/800080/FFFFFF?text=OXFORD' }
  ];

  useEffect(() => {
    if (peliculaData) {
      setEnMiLista(estaEnMiLista(peliculaData.id));
    }
  }, [peliculaData]);

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

  const handleMiLista = () => {
    toggleMiLista(peliculaData);
    setEnMiLista(!enMiLista);
  };

  const handleCalificar = () => {
    // Lógica para calificar
    console.log('Calificar:', peliculaData.titulo);
  };

  const handleCompartir = () => {
    // Lógica para compartir
    console.log('Compartir:', peliculaData.titulo);
  };

  const handlePeliculaPress = (pelicula) => {
    // Navegar a los detalles de otra película
    navigation.push('DetallePelicula', { pelicula });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
      
      <HeaderDetalle 
        onGoBack={handleGoBack}
        onDownload={handleDownload}
        onSearch={handleSearch}
      />

      <ScrollView style={styles.scrollContainer}>
        <VideoPlayer 
          imagen={peliculaData.imagen || peliculaData.poster_url || peliculaData.backdrop_url}
          onPlay={handlePlay}
        />

        <InfoPelicula 
          titulo={peliculaData.titulo}
          año={peliculaData.año}
          duracion={peliculaData.duracion}
          clasificacion={peliculaData.clasificacion}
          ranking={peliculaData.ranking}
        />

        <BotonesAccion 
          onVer={handleVer}
          onDescargar={handleDownload}
        />

        <DescripcionPelicula 
          descripcion={peliculaData.descripcion}
          protagonistas={peliculaData.protagonistas}
          direccion={peliculaData.direccion}
        />

        <BotonesInteraccion 
          onMiLista={handleMiLista}
          onCalificar={handleCalificar}
          onCompartir={handleCompartir}
          enMiLista={enMiLista}
        />

        <PeliculasSimilares 
          peliculas={peliculasSimilares}
          onPeliculaPress={handlePeliculaPress}
        />
      </ScrollView>
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