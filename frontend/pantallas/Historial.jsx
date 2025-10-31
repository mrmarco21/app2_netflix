import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, Trash2 } from 'lucide-react-native';
import { useHistorial } from '../contextos/HistorialContext';
import { useUsuario } from '../contextos/UsuarioContext';

export default function Historial({ navigation }) {
  const { historial, cargando, obtenerHistorial, eliminarDelHistorial, limpiarHistorial } = useHistorial();
  const { perfilActual } = useUsuario();
  const [eliminando, setEliminando] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // Cargar historial al montar el componente
  useEffect(() => {
    if (perfilActual?.id) {
      obtenerHistorial(perfilActual.id);
    }
  }, [perfilActual?.id]);

  const handleVerDetalle = (contenido) => {
    if (contenido.tipo === 'movie') {
      navigation.navigate('DetallePelicula', { peliculaId: contenido.id_contenido });
    } else {
      navigation.navigate('DetalleSerie', { serieId: contenido.id_contenido });
    }
  };

  const handleEliminar = async (id) => {
    Alert.alert(
      'Eliminar del historial',
      '¿Estás seguro de que quieres eliminar este elemento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setEliminando(id);
            await eliminarDelHistorial(id, perfilActual?.id);
            setEliminando(null);
          },
        },
      ]
    );
  };

  const handleLimpiarTodo = () => {
    // En web, Alert.alert no soporta múltiples botones. Usamos un modal propio.
    setMostrarConfirmacion(true);
  };

  const confirmarLimpiarTodo = async () => {
    if (perfilActual?.id) {
      await limpiarHistorial(perfilActual.id);
    }
    setMostrarConfirmacion(false);
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

  if (cargando) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        {historial.length > 0 && (
          <TouchableOpacity onPress={handleLimpiarTodo}>
            <Trash2 color="#E50914" size={24} />
          </TouchableOpacity>
        )}
        {historial.length === 0 && <View style={styles.placeholder} />}
      </View>

      <ScrollView style={styles.scrollContainer}>
        {historial.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Clock color="#888" size={64} />
            <Text style={styles.emptyTexto}>No has visto películas o series aún</Text>
            <Text style={styles.emptySubtexto}>
              Tu historial aparecerá aquí cuando empieces a ver contenido
            </Text>
          </View>
        ) : (
          <View style={styles.listaContainer}>
            <Text style={styles.cantidadTexto}>
              {historial.length} {historial.length === 1 ? 'elemento' : 'elementos'} en tu historial
            </Text>
            
            {historial.map((contenido) => (
              <TouchableOpacity
                key={contenido.id}
                style={[
                  styles.contenidoItem,
                  eliminando === contenido.id && styles.contenidoItemEliminando
                ]}
                onPress={() => handleVerDetalle(contenido)}
                onLongPress={() => handleEliminar(contenido.id)}
                disabled={eliminando === contenido.id}
              >
                <Image
                  source={{ 
                    uri: contenido.imagen || 'https://via.placeholder.com/80x120?text=Sin+Imagen'
                  }}
                  style={styles.poster}
                  resizeMode="cover"
                />
                
                <View style={styles.infoContainer}>
                  <Text style={styles.tituloContenido} numberOfLines={2}>
                    {contenido.titulo}
                  </Text>
                  
                  <View style={styles.metaInfo}>
                    <View style={styles.tipoContainer}>
                      <Text style={styles.tipoTexto}>
                        {contenido.tipo === 'movie' ? 'Película' : 'Serie'}
                      </Text>
                    </View>
                    <Clock color="#888" size={14} />
                    <Text style={styles.fechaTexto}>
                      {formatearFecha(contenido.fecha_visto)}
                    </Text>
                  </View>

                  {/* Barra de progreso */}
                  <View style={styles.progresoContainer}>
                    <View style={styles.progresoBar}>
                      <View 
                        style={[
                          styles.progresoFill, 
                          { width: `${contenido.porcentaje_visto}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progresoTexto}>
                      {contenido.porcentaje_visto}%
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleEliminar(contenido.id)}
                  disabled={eliminando === contenido.id}
                >
                  {eliminando === contenido.id ? (
                    <ActivityIndicator size="small" color="#E50914" />
                  ) : (
                    <Trash2 color="#666" size={20} />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal de confirmación para borrar todo el historial */}
      <Modal
        visible={mostrarConfirmacion}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarConfirmacion(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Borrar todo el historial</Text>
            <Text style={styles.modalMessage}>¿Quieres borrar todo el historial?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancelar]}
                onPress={() => setMostrarConfirmacion(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirmar]}
                onPress={confirmarLimpiarTodo}
              >
                <Text style={styles.modalButtonText}>Sí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
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
  contenidoItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  contenidoItemEliminando: {
    opacity: 0.5,
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
  tituloContenido: {
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
  tipoContainer: {
    backgroundColor: '#E50914',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  tipoTexto: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
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
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  // Estilos del modal de confirmación
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalButtonCancelar: {
    backgroundColor: '#333',
  },
  modalButtonConfirmar: {
    backgroundColor: '#E50914',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});