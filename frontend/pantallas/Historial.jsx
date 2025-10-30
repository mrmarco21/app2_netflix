import React from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock } from 'lucide-react-native';

export default function Historial({ navigation }) {
  // TODO: Conectar con tu contexto de historial cuando lo crees
  const historialEjemplo = [
    {
      id: 1,
      titulo: 'El Amateur',
      poster: 'https://image.tmdb.org/t/p/w500/example1.jpg',
      fechaVista: '2025-01-15',
      porcentajeVisto: 100,
    },
    {
      id: 2,
      titulo: 'La llave de Sarah',
      poster: 'https://image.tmdb.org/t/p/w500/example2.jpg',
      fechaVista: '2025-01-14',
      porcentajeVisto: 75,
    },
    {
      id: 3,
      titulo: 'Matabot T1',
      poster: 'https://image.tmdb.org/t/p/w500/example3.jpg',
      fechaVista: '2025-01-13',
      porcentajeVisto: 45,
    },
  ];

  const handleVerDetalle = (pelicula) => {
    navigation.navigate('DetallePelicula', { peliculaId: pelicula.id });
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
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
        <Text style={styles.titulo}>Historial</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {historialEjemplo.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Clock color="#888" size={64} />
            <Text style={styles.emptyTexto}>No has visto películas aún</Text>
            <Text style={styles.emptySubtexto}>
              Tu historial aparecerá aquí
            </Text>
          </View>
        ) : (
          <View style={styles.listaContainer}>
            <Text style={styles.cantidadTexto}>
              {historialEjemplo.length} {historialEjemplo.length === 1 ? 'película' : 'películas'} en tu historial
            </Text>
            
            {historialEjemplo.map((pelicula) => (
              <TouchableOpacity
                key={pelicula.id}
                style={styles.peliculaItem}
                onPress={() => handleVerDetalle(pelicula)}
              >
                <Image
                  source={{ uri: pelicula.poster }}
                  style={styles.poster}
                  resizeMode="cover"
                />
                
                <View style={styles.infoContainer}>
                  <Text style={styles.tituloPelicula} numberOfLines={2}>
                    {pelicula.titulo}
                  </Text>
                  
                  <View style={styles.metaInfo}>
                    <Clock color="#888" size={14} />
                    <Text style={styles.fechaTexto}>
                      {formatearFecha(pelicula.fechaVista)}
                    </Text>
                  </View>

                  {/* Barra de progreso */}
                  <View style={styles.progresoContainer}>
                    <View style={styles.progresoBar}>
                      <View 
                        style={[
                          styles.progresoFill, 
                          { width: `${pelicula.porcentajeVisto}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progresoTexto}>
                      {pelicula.porcentajeVisto}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
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
    marginTop: 20,
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
    padding: 10,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fechaTexto: {
    color: '#888',
    fontSize: 13,
    marginLeft: 5,
  },
  progresoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progresoBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 10,
  },
  progresoFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 2,
  },
  progresoTexto: {
    color: '#888',
    fontSize: 12,
    width: 40,
  },
});