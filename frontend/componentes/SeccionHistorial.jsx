import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

export default function SeccionHistorial({ historial = [], navigation, cargando = false }) {
  const handleVerMas = () => {
    navigation.navigate('Historial');
  };

  const handlePressPelicula = (pelicula) => {
    navigation.navigate('DetallePelicula', { peliculaId: pelicula.id });
  };

  if (cargando) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Historial</Text>
        </View>
        <Text style={styles.cargandoTexto}>Cargando...</Text>
      </View>
    );
  }

  if (!historial || historial.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Historial</Text>
        </View>
        <Text style={styles.vacio}>No hay películas en tu historial</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Historial</Text>
        <TouchableOpacity 
          style={styles.verMasBoton}
          onPress={handleVerMas}
        >
          <ChevronRight color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {historial.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.peliculaCard}
            onPress={() => handlePressPelicula(item)}
          >
            <Image
              source={{ uri: item.poster || item.imagen }}
              style={styles.poster}
              resizeMode="cover"
            />
            <Text style={styles.titulo_pelicula} numberOfLines={1}>
              {item.titulo}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  titulo: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  verMasBoton: {
    padding: 5,
  },
  scrollContent: {
    paddingHorizontal: 15,
  },
  peliculaCard: {
    marginHorizontal: 5,
    width: 120,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  titulo_pelicula: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  vacio: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  cargandoTexto: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});