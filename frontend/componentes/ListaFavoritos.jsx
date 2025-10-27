import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  ScrollView,
  FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ListaFavoritos({ contenido, navigation, onEliminar }) {
  const renderItem = ({ item }) => (
    <View style={styles.contenidoItem}>
      <Image source={item.imagen} style={styles.imagenContenido} />
      <View style={styles.contenidoInfo}>
        <Text style={styles.tituloContenido}>{item.titulo}</Text>
        <Text style={styles.tipoContenido}>
          {item.tipo === 'serie' ? 'Serie' : 'Película'}
        </Text>
        <Text style={styles.fechaAgregado}>
          Agregado el {new Date(item.fechaAgregado).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </Text>
      </View>
      <View style={styles.accionesContainer}>
        <TouchableOpacity 
          style={styles.botonAccion}
          onPress={() => {
            // Aquí iría la lógica para reproducir
            console.log('Reproducir:', item.titulo);
          }}
        >
          <Ionicons name="play" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.botonAccion}
          onPress={() => {
            // Aquí iría la lógica para ver información
            console.log('Ver información:', item.titulo);
          }}
        >
          <Ionicons name="information-circle-outline" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.botonAccion}
          onPress={() => {
            if (onEliminar) {
              onEliminar(item.id);
            }
          }}
        >
          <Ionicons name="remove-circle-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!contenido || contenido.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Series y películas que te gustaron</Text>
        <View style={styles.contenidoVacio}>
          <Ionicons name="heart-outline" size={48} color="#666" />
          <Text style={styles.textoVacio}>Aún no has agregado nada a tu lista</Text>
          <Text style={styles.subtextoVacio}>
            Toca el ícono + en cualquier serie o película para agregarla aquí
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Series y películas que te gustaron</Text>
      <FlatList
        data={contenido}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  titulo: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  contenidoVacio: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  textoVacio: {
    color: '#999',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtextoVacio: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  contenidoItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 10,
  },
  imagenContenido: {
    width: 120,
    height: 68,
    borderRadius: 6,
    marginRight: 15,
  },
  contenidoInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  tituloContenido: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tipoContenido: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  fechaAgregado: {
    color: '#666',
    fontSize: 12,
  },
  accionesContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingLeft: 10,
  },
  botonAccion: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#333',
    marginVertical: 2,
  },
});