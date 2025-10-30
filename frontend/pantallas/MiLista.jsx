import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { useMiLista } from '../contextos/MiListaContext';

export default function MiLista({ navigation }) {
  const { miLista, quitarDeMiLista, cargando } = useMiLista();

  const handleEliminar = async (contenidoId) => {
    await quitarDeMiLista(contenidoId);
  };

  const handleVerDetalle = (pelicula) => {
    navigation.navigate('DetallePelicula', { peliculaId: pelicula.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#fff" size={28} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Mis Favoritos</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {cargando ? (
          <Text style={styles.cargandoTexto}>Cargando...</Text>
        ) : miLista.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTexto}>No tienes películas favoritas aún</Text>
            <Text style={styles.emptySubtexto}>
              Agrega películas a tu lista desde los detalles
            </Text>
          </View>
        ) : (
          <View style={styles.listaContainer}>
            <Text style={styles.cantidadTexto}>
              {miLista.length} {miLista.length === 1 ? 'película' : 'películas'}
            </Text>
            
            {miLista.map((pelicula) => (
              <View key={pelicula.id} style={styles.peliculaItem}>
                <TouchableOpacity 
                  style={styles.peliculaContenido}
                  onPress={() => handleVerDetalle(pelicula)}
                >
                  <Image
                    source={{ uri: pelicula.poster || pelicula.imagen }}
                    style={styles.poster}
                    resizeMode="cover"
                  />
                  <View style={styles.infoContainer}>
                    <Text style={styles.tituloPelicula} numberOfLines={2}>
                      {pelicula.titulo}
                    </Text>
                    {pelicula.anio && (
                      <Text style={styles.anio}>{pelicula.anio}</Text>
                    )}
                    {pelicula.generos && (
                      <Text style={styles.generos} numberOfLines={1}>
                        {pelicula.generos.join(', ')}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.eliminarButton}
                  onPress={() => handleEliminar(pelicula.id)}
                >
                  <Trash2 color="#E50914" size={24} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  titulo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 38,
  },
  scrollContainer: {
    flex: 1,
  },
  cargandoTexto: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyTexto: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtexto: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  listaContainer: {
    padding: 15,
  },
  cantidadTexto: {
    color: '#888',
    fontSize: 14,
    marginBottom: 15,
  },
  peliculaItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  peliculaContenido: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  tituloPelicula: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  anio: {
    color: '#888',
    fontSize: 13,
    marginBottom: 3,
  },
  generos: {
    color: '#aaa',
    fontSize: 12,
  },
  eliminarButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
});