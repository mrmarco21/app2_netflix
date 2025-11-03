import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

export default function SeccionHistorial({ historial = [], navigation, cargando = false }) {
  const handleVerMas = () => {
    navigation.navigate('Historial');
  };

  const handlePressPelicula = (pelicula) => {
    console.log('🎬 SeccionHistorial navegando con contenido:', pelicula);
    
    // USAR EL TIPO ORIGINAL DEL HISTORIAL - NO DETECTAR NUEVAMENTE
    // El tipo ya fue correctamente determinado cuando se guardó en el historial
    const tipoOriginal = pelicula.tipo || 'pelicula';
    
    console.log('🎬 SeccionHistorial - Tipo original guardado:', tipoOriginal);

    // Extraer el ID real del ID compuesto si es necesario
    let idReal = pelicula.id_contenido;
    if (typeof pelicula.id_contenido === 'string' && pelicula.id_contenido.includes('_')) {
      const partes = pelicula.id_contenido.split('_');
      if (partes.length === 2) {
        idReal = parseInt(partes[1]);
      }
    }

    // Crear objeto con el formato correcto para la navegación
    const contenidoParaNavegar = {
      id: idReal,
      titulo: pelicula.titulo,
      imagen: pelicula.imagen || pelicula.poster,
      tipo: tipoOriginal, // MANTENER EL TIPO ORIGINAL
      searchByTitle: true
    };

    console.log('🎬 SeccionHistorial navegando:', {
      idOriginal: pelicula.id_contenido,
      idExtraido: idReal,
      titulo: pelicula.titulo,
      tipoOriginal: tipoOriginal
    });

    navigation.navigate('DetallePelicula', { pelicula: contenidoParaNavegar });
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
        {historial.slice(0, 5).map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.peliculaCard}
            onPress={() => handlePressPelicula(item)}
          >
            <View style={styles.posterContainer}>
              <Image
                source={{ uri: item.poster || item.imagen }}
                style={styles.poster}
                resizeMode="cover"
              />
              {/* Barra de progreso */}
              {/* <View style={styles.progresoContainer}>
                <View style={styles.progresoBar}>
                  <View
                    style={[
                      styles.progresoFill,
                      { width: `${item.porcentaje_visto || 0}%` }
                    ]}
                  />
                </View>
              </View> */}
            </View>
            {/* <Text style={styles.titulo_pelicula} numberOfLines={1}>
              {item.titulo}
            </Text>
            <Text style={styles.progreso_texto} numberOfLines={1}>
              {item.porcentaje_visto || 0}% visto
            </Text> */}
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
  posterContainer: {
    position: 'relative',
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  progresoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  progresoBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progresoFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 2,
  },
  titulo_pelicula: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  progreso_texto: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
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