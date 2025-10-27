import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BusquedasPopulares({ busquedasPopulares, onSeleccionarBusqueda }) {
  const renderBusquedaPopular = ({ item }) => (
    <TouchableOpacity 
      style={styles.busquedaPopularItem}
      onPress={() => onSeleccionarBusqueda(item.titulo)}
    >
      <Image source={{ uri: item.imagen }} style={styles.busquedaPopularImagen} />
      <Text style={styles.busquedaPopularTitulo}>{item.titulo}</Text>
      <Ionicons name="play-circle-outline" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.seccion}>
      <Text style={styles.tituloSeccion}>Búsquedas populares</Text>
      <FlatList
        data={busquedasPopulares}
        renderItem={renderBusquedaPopular}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: {
    marginVertical: 20,
  },
  tituloSeccion: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  busquedaPopularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  busquedaPopularImagen: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 15,
  },
  busquedaPopularTitulo: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
});