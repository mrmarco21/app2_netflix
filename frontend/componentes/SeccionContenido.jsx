import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMiLista } from '../contextos/MiListaContext';
import { useNavigation } from '@react-navigation/native';

export default function SeccionContenido({ titulo, contenido, esContinuarViendo = false, onAgregarAMiLista }) {
  const { estaEnMiLista } = useMiLista();
  const navigation = useNavigation();

  const handlePeliculaPress = (item) => {
    // Navegar a DetallePelicula con los datos del item
    navigation.navigate('DetallePelicula', { pelicula: item });
  };

  const renderContenidoItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.contenidoItem}
      onPress={() => handlePeliculaPress(item)}
    >
      <Image source={{ uri: item.imagen }} style={styles.contenidoImagen} />
      {item.etiqueta && (
        <View style={styles.etiquetaContainer}>
          <Text style={styles.etiquetaTexto}>{item.etiqueta}</Text>
        </View>
      )}
      {esContinuarViendo && item.progreso && (
        <View style={styles.progresoContainer}>
          <View style={styles.progresoBarra}>
            <View style={[styles.progresoFill, { width: `${item.progreso * 100}%` }]} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.seccionContainer}>
      <Text style={styles.seccionTitulo}>{titulo}</Text>
      <FlatList
        data={contenido}
        renderItem={renderContenidoItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listaHorizontal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  seccionContainer: {
    marginVertical: 15,
  },
  seccionTitulo: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  listaHorizontal: {
    paddingHorizontal: 15,
  },
  contenidoItem: {
    width: 120,
    marginRight: 10,
    position: 'relative',
  },
  contenidoImagen: {
    width: 120,
    height: 180,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
  },
  progresoContainer: {
    position: 'absolute',
    bottom: 35,
    left: 0,
    right: 0,
    paddingHorizontal: 5,
  },
  progresoBarra: {
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  progresoFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 2,
  },
  etiquetaContainer: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#E50914',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  etiquetaTexto: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contenidoInfo: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    flexDirection: 'row',
    gap: 8,
  },
});