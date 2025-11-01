import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ModalAdministrarPerfiles from './ModalAdministrarPerfiles';
import ModalPinPerfil from './ModalPinPerfil';
import { actualizarPinPerfil, actualizarPerfil, eliminarPerfil } from '../servicios/apiUsuarios';
import { useUsuario } from '../contextos/UsuarioContext';

export default function ModalPerfiles({
  visible,
  perfiles,
  perfilActual,
  onCerrar,
  onSeleccionar,
  onActualizarPerfiles
}) {
  const [mostrarAdministrar, setMostrarAdministrar] = useState(false);
  const [modalPinVisible, setModalPinVisible] = useState(false);
  const [perfilConPin, setPerfilConPin] = useState(null);
  const { cambiarPerfil, perfilesDisponibles, cargarPerfilesDisponibles, usuario } = useUsuario();
  
  // Imágenes de perfil disponibles
  const imagenesPerfiles = [
    require('../assets/perfil1.jpg'),
    require('../assets/perfil2.jpg'),
    require('../assets/perfil3.jpg'),
    require('../assets/perfil4.jpg'),
  ];

  // Función para obtener la imagen del perfil basada en el ID
  const obtenerImagenPerfil = (perfilId) => {
    // Si no hay perfil actual, usar la primera imagen por defecto
    if (!perfilId) return imagenesPerfiles[0];
    
    // Usar el ID del perfil para determinar qué imagen usar
    const index = perfilId % imagenesPerfiles.length;
    return imagenesPerfiles[index];
  };
  
  // Usar perfiles del contexto si están disponibles, sino usar los props
  const perfilesSinImagenes = perfilesDisponibles.length > 0 ? perfilesDisponibles : perfiles;
  
  // Agregar imágenes a los perfiles
  const perfilesAMostrar = perfilesSinImagenes.map(perfil => ({
    ...perfil,
    avatar: obtenerImagenPerfil(perfil.id)
  }));

  // Efecto para recargar perfiles cuando se abre el modal
  useEffect(() => {
    if (visible && usuario?.id) {
      console.log('🔄 ModalPerfiles: Modal abierto, recargando perfiles...');
      if (cargarPerfilesDisponibles) {
        cargarPerfilesDisponibles(usuario.id);
      }
    }
  }, [visible, usuario?.id, cargarPerfilesDisponibles]);

  const cerrarAdministrar = () => {
    setMostrarAdministrar(false);
  };

  const manejarAdministrar = () => {
    setMostrarAdministrar(true);
  };

  const manejarActualizarPin = async (perfilId, nuevoPin) => {
    try {
      console.log('🔐 ModalPerfiles: Actualizando PIN para perfil:', perfilId);
      const resultado = await actualizarPinPerfil(perfilId, nuevoPin);
      
      if (resultado.success) {
        console.log('✅ ModalPerfiles: PIN actualizado exitosamente');
        
        // Recargar perfiles del contexto
        if (cargarPerfilesDisponibles && usuario?.id) {
          await cargarPerfilesDisponibles(usuario.id);
        }
        
        // Llamar callback si existe
        if (onActualizarPerfiles) {
          onActualizarPerfiles();
        }
        
        Alert.alert('Éxito', 'PIN actualizado correctamente');
      } else {
        console.error('❌ ModalPerfiles: Error al actualizar PIN:', resultado.mensaje);
        Alert.alert('Error', resultado.mensaje || 'No se pudo actualizar el PIN');
      }
    } catch (error) {
      console.error('❌ ModalPerfiles: Error al actualizar PIN:', error);
      Alert.alert('Error', 'Error de conexión al actualizar el PIN');
    }
  };

  const manejarEditarPerfil = async (perfilId, nuevoNombre) => {
    try {
      console.log('✏️ ModalPerfiles: Editando perfil:', perfilId, 'nuevo nombre:', nuevoNombre);
      const resultado = await actualizarPerfil(perfilId, nuevoNombre);
      if (resultado.success) {
        // Recargar perfiles del contexto
        if (cargarPerfilesDisponibles && usuario?.id) {
          await cargarPerfilesDisponibles(usuario.id);
        }
        
        // Llamar callback si existe
        if (onActualizarPerfiles) {
          await onActualizarPerfiles();
        }
        
        console.log('✅ ModalPerfiles: Perfil editado exitosamente');
      } else {
        throw new Error(resultado.mensaje);
      }
    } catch (error) {
      console.error('❌ ModalPerfiles: Error al editar perfil:', error);
      throw error;
    }
  };

  const manejarEliminarPerfil = async (perfilId) => {
    try {
      console.log('🗑️ ModalPerfiles: Eliminando perfil:', perfilId);
      const resultado = await eliminarPerfil(perfilId);
      
      if (resultado.success) {
        console.log('✅ ModalPerfiles: Perfil eliminado exitosamente');
        
        // Recargar perfiles del contexto
        if (cargarPerfilesDisponibles && usuario?.id) {
          await cargarPerfilesDisponibles(usuario.id);
        }
        
        // Llamar callback si existe
        if (onActualizarPerfiles) {
          await onActualizarPerfiles();
        }
        
        Alert.alert('Éxito', 'Perfil eliminado correctamente');
      } else {
        console.error('❌ ModalPerfiles: Error al eliminar perfil:', resultado.mensaje);
        Alert.alert('Error', resultado.mensaje || 'No se pudo eliminar el perfil');
      }
    } catch (error) {
      console.error('❌ ModalPerfiles: Error al eliminar perfil:', error);
      Alert.alert('Error', 'Error de conexión al eliminar el perfil');
    }
  };

  const manejarSeleccionPerfil = async (perfil) => {
    console.log('👤 Seleccionando perfil:', perfil.nombre, 'tiene PIN:', !!perfil.pin);
    // Verificar si el perfil tiene PIN configurado
    if (perfil.pin) {
      setPerfilConPin(perfil);
      setModalPinVisible(true);
    } else {
      // Si no tiene PIN, usar cambiarPerfil del contexto y seleccionar directamente
      await cambiarPerfil(perfil);
      onSeleccionar(null); // Pasar null ya que el perfil está en el contexto
      onCerrar(); // Cerrar el modal después de seleccionar
    }
  };

  const manejarAccesoPermitido = async (perfil) => {
    console.log('🔓 Acceso permitido para perfil:', perfil.nombre);
    setModalPinVisible(false);
    setPerfilConPin(null);
    // Usar cambiarPerfil del contexto para actualizar correctamente el estado global
    await cambiarPerfil(perfil);
    // Navegar sin pasar el perfil como parámetro ya que está en el contexto
    onSeleccionar(null); // Pasar null para indicar que el perfil ya está en el contexto
    onCerrar(); // Cerrar el modal de perfiles después de seleccionar
  };

  const cerrarModalPin = () => {
    setModalPinVisible(false);
    setPerfilConPin(null);
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onCerrar}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.titulo}>Cambia de perfiles</Text>
              <TouchableOpacity onPress={onCerrar} style={styles.cerrarButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.perfilesContainer}
            >
              {perfilesAMostrar.map((perfil) => (
                <TouchableOpacity
                  key={perfil.id}
                  style={[
                    styles.perfilItem,
                    perfilActual.id === perfil.id && styles.perfilActivo
                  ]}
                  onPress={() => manejarSeleccionPerfil(perfil)}
                >
                  <View style={styles.avatarContainer}>
                    <Image source={perfil.avatar} style={styles.avatar} />
                    {perfil.pin && (
                      <View style={styles.candadoContainer}>
                        <Ionicons name="lock-closed" size={16} color="white" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.nombrePerfil}>{perfil.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.administrarButton}
              onPress={() => {
                onCerrar(); // cierra el modal actual
                setTimeout(() => {
                  manejarAdministrar(); // abre el otro después de una pequeña pausa
                }, 100); // 300ms = más natural
              }}
            >
              <Ionicons name="create-outline" size={20} color="white" />
              <Text style={styles.administrarTexto}>Administrar perfiles</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      <ModalAdministrarPerfiles
        visible={mostrarAdministrar}
        perfiles={perfilesAMostrar}
        onCerrar={cerrarAdministrar}
        onActualizarPin={manejarActualizarPin}
        onEditarPerfil={manejarEditarPerfil}
        onEliminarPerfil={manejarEliminarPerfil}
      />

      <ModalPinPerfil
        visible={modalPinVisible}
        perfil={perfilConPin}
        onCerrar={cerrarModalPin}
        onAccesoPermitido={manejarAccesoPermitido}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  titulo: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cerrarButton: {
    padding: 5,
  },
  perfilesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  perfilItem: {
    alignItems: 'center',
    marginRight: 20,
    padding: 10,
    borderRadius: 4,
  },
  perfilActivo: {
    backgroundColor: '#333',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  candadoContainer: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#666',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nombrePerfil: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  administrarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  administrarTexto: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
});