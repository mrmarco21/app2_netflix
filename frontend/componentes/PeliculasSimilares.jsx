import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 3; // 3 columnas con espaciado

export default function PeliculasSimilares({ peliculas, onPeliculaPress }) {
  // Si no hay películas, no mostrar el componente
  if (!peliculas || peliculas.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Más títulos similares</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {peliculas.map((pelicula, index) => {
          // Formatear datos según el formato de la API de TMDB
          const titulo = pelicula.title || pelicula.name || pelicula.titulo || 'Sin título';
          
          // Intentar múltiples fuentes de imagen con fallbacks
          let imagen = null;
          if (pelicula.poster_url && pelicula.poster_url !== 'null') {
            imagen = pelicula.poster_url;
          } else if (pelicula.poster_small && pelicula.poster_small !== 'null') {
            imagen = pelicula.poster_small;
          } else if (pelicula.imagen && pelicula.imagen !== 'null') {
            imagen = pelicula.imagen;
          } else if (pelicula.poster_path) {
            imagen = `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`;
          } else {
            imagen = 'https://via.placeholder.com/150x225/333333/FFFFFF?text=Sin+Imagen';
          }
          
          const descripcion = pelicula.descripcion || pelicula.overview || '';
          const tipo = pelicula.tipo || (pelicula.media_type === 'tv' || pelicula.name ? 'Serie' : 'Película');
          
          console.log(`Película ${index}:`, { titulo, imagen, tipo }); // Debug
          
          return (
            <TouchableOpacity 
              key={pelicula.id || index}
              onPress={() => onPeliculaPress(pelicula)}
              style={styles.peliculaItem}
            >
              <Image 
                source={{ uri: imagen }} 
                style={styles.peliculaImagen}
                onError={(error) => {
                  console.log('❌ Error cargando imagen:', imagen, error.nativeEvent);
                }}
                onLoad={() => {
                  console.log('✅ Imagen cargada exitosamente:', imagen);
                }}
                onLoadStart={() => {
                  console.log('🔄 Iniciando carga de imagen:', imagen);
                }}
                resizeMode="cover"
                defaultSource={require('../assets/icon.png')}
              />
              <View style={styles.infoContainer}>
                <Text style={styles.peliculaTitulo} numberOfLines={2}>
                  {titulo}
                </Text>
                <Text style={styles.peliculaTipo} numberOfLines={1}>
                  {tipo}
                </Text>
                {descripcion ? (
                  <Text style={styles.peliculaDescripcion} numberOfLines={3}>
                    {descripcion}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    paddingVertical: 20,
  },
  titulo: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  peliculaItem: {
    width: itemWidth,
    marginRight: 8,
  },
  peliculaImagen: {
    width: itemWidth,
    height: itemWidth * 1.5, // Aspect ratio típico de pósters
    borderRadius: 8,
    backgroundColor: '#333',
  },
  infoContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  peliculaTitulo: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 4,
  },
  peliculaTipo: {
    color: '#E50914',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  peliculaDescripcion: {
    color: '#999',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
});