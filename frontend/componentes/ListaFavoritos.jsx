import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  FlatList,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ListaFavoritos({ contenido, navigation, onEliminar, cargando }) {
  const renderItem = ({ item }) => {
    // Manejar diferentes formatos de imagen
    const imagenSource = item.imagen && typeof item.imagen === 'string' 
      ? { uri: item.imagen }
      : item.imagen || require('../assets/imgFondo1.jpg'); // Imagen por defecto

    // Asegurar que tenemos un ID válido
    const contenidoId = item.id || item.id_contenido;
    if (!contenidoId) {
      console.warn('⚠️ Item sin ID válido:', item);
      return null; // No renderizar items sin ID
    }

    return (
      <View style={styles.contenidoItem}>
        <Image source={imagenSource} style={styles.imagenContenido} />
        <View style={styles.contenidoInfo}>
          <Text style={styles.tituloContenido}>{item.titulo}</Text>
          <Text style={styles.tipoContenido}>
            {item.tipo === 'serie' ? 'Serie' : 'Película'}
          </Text>
          <Text style={styles.fechaAgregado}>
            Agregado el {new Date(item.fecha_agregado || item.fechaAgregado).toLocaleDateString('es-ES', {
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
              // Usar id_contenido para TMDB, no el id local de la base de datos
              const tmdbId = parseInt(item.id_contenido || item.id);
              const contenidoParaNavegar = {
                ...item,
                id: tmdbId,
                titulo: item.titulo,
                imagen: item.imagen,
                tipo: item.tipo,
                // Agregar propiedades específicas para series si es una serie
                ...(item.tipo === 'serie' && {
                  name: item.titulo, // Para que la detección funcione
                  media_type: 'tv',
                  first_air_date: item.first_air_date || '2020-01-01' // Fecha por defecto
                })
              };
              console.log('🎬 Navegando a DetallePelicula desde Mi Lista con datos completos:', contenidoParaNavegar);
              navigation.navigate('DetallePelicula', { pelicula: contenidoParaNavegar });
            }}
          >
            <Ionicons name="play" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.botonAccion}
            onPress={() => {
              // Usar id_contenido para TMDB, no el id local de la base de datos
              const tmdbId = parseInt(item.id_contenido || item.id);
              const contenidoParaNavegar = {
                ...item,
                id: tmdbId,
                titulo: item.titulo,
                imagen: item.imagen,
                tipo: item.tipo,
                // Agregar propiedades específicas para series si es una serie
                ...(item.tipo === 'serie' && {
                  name: item.titulo, // Para que la detección funcione
                  media_type: 'tv',
                  first_air_date: item.first_air_date || '2020-01-01' // Fecha por defecto
                })
              };
              console.log('ℹ️ Navegando a DetallePelicula desde Mi Lista con datos completos:', contenidoParaNavegar);
              navigation.navigate('DetallePelicula', { pelicula: contenidoParaNavegar });
            }}
          >
            <Ionicons name="information-circle-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.botonAccion}
            onPress={() => {
              if (onEliminar) {
                // Usar id_contenido específicamente para la eliminación
                const idParaEliminar = item.id_contenido || item.id;
                console.log('🗑️ Eliminando contenido con ID:', idParaEliminar);
                onEliminar(parseInt(idParaEliminar));
              }
            }}
          >
            <Ionicons name="remove-circle-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Mi Lista</Text>
        <View style={styles.cargandoContainer}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.textoCargando}>Cargando tu lista...</Text>
        </View>
      </View>
    );
  }

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
        data={contenido.slice(0, 5)}
        renderItem={renderItem}
        keyExtractor={(item, index) => {
          // Usar el ID si existe, sino usar el índice como fallback
          const id = item.id || item.id_contenido || index;
          return id.toString();
        }}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botonAccion: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  cargandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  textoCargando: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});