import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMiLista } from '../contextos/MiListaContext';
import { useNavigation } from '@react-navigation/native';

export default function BannerDestacado({ contenidoDestacado, onAgregarAMiLista, onReproducir }) {
  const { estaEnMiLista } = useMiLista();
  const navigation = useNavigation();
  
  const handleMiLista = () => {
    if (onAgregarAMiLista && contenidoDestacado) {
      onAgregarAMiLista(contenidoDestacado);
    }
  };

  const handleReproducir = () => {
    if (onReproducir && contenidoDestacado) {
      onReproducir(contenidoDestacado);
    }
  };

  const handleBannerPress = () => {
    // Navegar a DetallePelicula con los datos del contenido destacado
    const contenidoParaNavegar = {
      ...contenidoDestacado,
      id: contenidoDestacado.id,
      titulo: contenidoDestacado.titulo || contenidoDestacado.title || contenidoDestacado.name,
      imagen: contenidoDestacado.imagen || contenidoDestacado.poster_url,
      tipo: contenidoDestacado.tipo
        ? contenidoDestacado.tipo
        : (Array.isArray(contenidoDestacado.generos) && contenidoDestacado.generos.includes('Serie')
            ? 'serie'
            : (Array.isArray(contenidoDestacado.generos) && contenidoDestacado.generos.includes('Película')
                ? 'pelicula'
                : (contenidoDestacado.name ? 'serie' : 'pelicula')))
    };

    navigation.navigate('DetallePelicula', { pelicula: contenidoParaNavegar });
  };

  if (!contenidoDestacado) return null;

  return (
    <TouchableOpacity style={styles.bannerContainer} onPress={handleBannerPress}>
      <Image source={{ uri: contenidoDestacado.imagen }} style={styles.bannerImagen} />
      <View style={styles.bannerOverlay}>
        <Text style={styles.bannerTitulo}>{contenidoDestacado.titulo}</Text>
        {contenidoDestacado.subtitulo && (
          <Text style={styles.bannerSubtitulo}>{contenidoDestacado.subtitulo}</Text>
        )}
        <View style={styles.generosContainer}>
          {contenidoDestacado.generos?.map((genero, index) => (
            <Text key={index} style={styles.generoTexto}>
              {genero}{index < contenidoDestacado.generos.length - 1 ? ' • ' : ''}
            </Text>
          ))}
        </View>
        {contenidoDestacado.descripcion && (
          <Text style={styles.descripcion } numberOfLines={2}
      ellipsizeMode="tail">{contenidoDestacado.descripcion}</Text>
        )}
        <View style={styles.bannerButtons}>
          <TouchableOpacity style={styles.playButton} onPress={handleReproducir}>
            <Ionicons name="play" size={20} color="black" />
            <Text style={styles.playButtonText}>Reproducir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listButton} onPress={handleMiLista}>
            <Ionicons 
              name={estaEnMiLista(contenidoDestacado.id) ? "checkmark" : "add"} 
              size={20} 
              color="white" 
            />
            <Text style={styles.listButtonText}>
              {estaEnMiLista(contenidoDestacado.id) ? "En Mi lista" : "Mi lista"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    height: 400,
    position: 'relative',
    paddingHorizontal: 10,
  },
  bannerImagen: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  bannerTitulo: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bannerSubtitulo: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  generosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  generoTexto: {
    color: 'white',
    fontSize: 12,
  },
  descripcion: {
    color: 'white',
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  bannerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 15,
  },
  playButtonText: {
    color: 'black',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  listButtonText: {
    color: 'white',
    marginLeft: 5,
  },
});