import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUsuario } from '../contextos/UsuarioContext';
import * as apiCalificaciones from '../servicios/apiCalificaciones';

const ModalCalificacion = ({ visible, onClose, contenido, calificacionActual, onCalificacionGuardada }) => {
  const [calificacionSeleccionada, setCalificacionSeleccionada] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const { perfilActual } = useUsuario();

  useEffect(() => {
    if (visible) {
      setCalificacionSeleccionada(calificacionActual || 0);
    }
  }, [visible, calificacionActual]);

  const manejarCalificacion = async () => {
    if (!perfilActual?.id) {
      Alert.alert('Error', 'No hay perfil activo');
      return;
    }

    if (calificacionSeleccionada === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    try {
      setGuardando(true);
      await apiCalificaciones.calificarContenido(
        perfilActual.id,
        contenido,
        calificacionSeleccionada
      );

      Alert.alert(
        'Éxito',
        `Has calificado "${contenido.titulo || contenido.title || contenido.name}" con ${calificacionSeleccionada} estrella${calificacionSeleccionada > 1 ? 's' : ''}`,
        [
          {
            text: 'OK',
            onPress: () => {
              onCalificacionGuardada?.(calificacionSeleccionada);
              onClose();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error al calificar:', error);
      Alert.alert('Error', 'No se pudo guardar la calificación. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCalificacion = async () => {
    if (!perfilActual?.id || !calificacionActual) {
      return;
    }

    try {
      setGuardando(true);
      await apiCalificaciones.eliminarCalificacion(perfilActual.id, contenido.id.toString());
      
      Alert.alert(
        'Calificación eliminada',
        'Has eliminado tu calificación de este contenido',
        [
          {
            text: 'OK',
            onPress: () => {
              onCalificacionGuardada?.(0);
              onClose();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error al eliminar calificación:', error);
      Alert.alert('Error', 'No se pudo eliminar la calificación. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const renderEstrella = (numero) => {
    const estaSeleccionada = numero <= calificacionSeleccionada;
    
    return (
      <TouchableOpacity
        key={numero}
        onPress={() => setCalificacionSeleccionada(numero)}
        style={styles.estrella}
        disabled={guardando}
      >
        <MaterialIcons
          name={estaSeleccionada ? 'star' : 'star-border'}
          size={40}
          color={estaSeleccionada ? '#FFD700' : '#666'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.titulo}>Calificar</Text>
          <Text style={styles.nombreContenido}>
            {contenido?.titulo || contenido?.title || contenido?.name}
          </Text>
          
          <View style={styles.estrellas}>
            {[1, 2, 3, 4, 5].map(renderEstrella)}
          </View>
          
          {calificacionSeleccionada > 0 && (
            <Text style={styles.textoCalificacion}>
              {calificacionSeleccionada} estrella{calificacionSeleccionada > 1 ? 's' : ''}
            </Text>
          )}
          
          <View style={styles.botones}>
            <TouchableOpacity
              style={[styles.boton, styles.botonCancelar]}
              onPress={onClose}
              disabled={guardando}
            >
              <Text style={styles.textoBotonCancelar}>Cancelar</Text>
            </TouchableOpacity>
            
            {calificacionActual > 0 && (
              <TouchableOpacity
                style={[styles.boton, styles.botonEliminar]}
                onPress={eliminarCalificacion}
                disabled={guardando}
              >
                <Text style={styles.textoBotonEliminar}>
                  {guardando ? 'Eliminando...' : 'Eliminar'}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.boton,
                styles.botonGuardar,
                (calificacionSeleccionada === 0 || guardando) && styles.botonDeshabilitado
              ]}
              onPress={manejarCalificacion}
              disabled={calificacionSeleccionada === 0 || guardando}
            >
              <Text style={styles.textoBotonGuardar}>
                {guardando ? 'Guardando...' : 'Calificar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  titulo: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nombreContenido: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  estrellas: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  estrella: {
    marginHorizontal: 5,
    padding: 5,
  },
  textoCalificacion: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
  },
  botones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    flexWrap: 'wrap',
  },
  boton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
    marginVertical: 5,
  },
  botonCancelar: {
    backgroundColor: '#333',
  },
  botonEliminar: {
    backgroundColor: '#d32f2f',
  },
  botonGuardar: {
    backgroundColor: '#e50914',
  },
  botonDeshabilitado: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  textoBotonCancelar: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  textoBotonEliminar: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  textoBotonGuardar: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ModalCalificacion;