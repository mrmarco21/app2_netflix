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
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Más títulos similares</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {peliculas.map((pelicula, index) => (
          <TouchableOpacity 
            key={pelicula.id || index}
            onPress={() => onPeliculaPress(pelicula)}
            style={styles.peliculaItem}
          >
            <Image 
              source={{ uri: pelicula.imagen }} 
              style={styles.peliculaImagen}
            />
            <Text style={styles.peliculaTitulo} numberOfLines={2}>
              {pelicula.titulo}
            </Text>
          </TouchableOpacity>
        ))}
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
  peliculaTitulo: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
});