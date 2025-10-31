import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ResultadosBusqueda({ resultados, textoBusqueda }) {
  const navigation = useNavigation();

  const navegarADetalle = (item) => {
    // Normalizar el objeto para DetallePelicula
    const contenidoParaNavegar = {
      ...item,
      id: item.id,
      titulo: item.titulo || item.title || item.name || 'Sin título',
      imagen: item.imagen || item.poster_url || item.poster_path
        ? (item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : item.poster_url)
        : undefined,
      tipo: item.tipo === 'tv' ? 'serie' : (item.tipo === 'movie' ? 'pelicula' : (item.tipo || (item.name ? 'serie' : 'pelicula')))
    };

    navigation.navigate('DetallePelicula', { pelicula: contenidoParaNavegar });
  };

  const renderResultadoItem = ({ item }) => (
    <TouchableOpacity style={styles.resultadoItem} onPress={() => navegarADetalle(item)}>
      <Image source={{ uri: item.imagen }} style={styles.resultadoImagen} />
      <View style={styles.resultadoInfo}>
        <Text style={styles.resultadoTitulo}>{item.titulo}</Text>
        <View style={styles.resultadoAcciones}>
          <TouchableOpacity style={styles.botonPlay} onPress={() => navegarADetalle(item)}>
            <Ionicons name="play" size={16} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonInfo} onPress={() => navegarADetalle(item)}>
            <Ionicons name="information-circle-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.seccionResultados}>
      <Text style={styles.tituloSeccion}>
        {resultados.length > 0 ? `Resultados para "${textoBusqueda}"` : 'Sin resultados'}
      </Text>
      <FlatList
        data={resultados}
        renderItem={renderResultadoItem}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  seccionResultados: {
    marginTop: 20,
  },
  tituloSeccion: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  resultadoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  resultadoImagen: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 15,
  },
  resultadoInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultadoTitulo: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  resultadoAcciones: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botonPlay: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  botonInfo: {
    padding: 5,
  },
});