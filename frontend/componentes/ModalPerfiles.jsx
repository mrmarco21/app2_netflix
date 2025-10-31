import React, { useState } from 'react';
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
  const { cambiarPerfil } = useUsuario();

  const cerrarAdministrar = () => {
    setMostrarAdministrar(false);
  };

  const manejarAdministrar = () => {
    setMostrarAdministrar(true);
  };

  const manejarActualizarPin = async (perfilId, pin) => {
    try {
      console.log('📱 ModalPerfiles: Actualizando PIN para perfil:', perfilId);
      await actualizarPinPerfil(perfilId, pin);
      console.log('✅ ModalPerfiles: PIN actualizado exitosamente');
      
      // Actualizar la lista de perfiles inmediatamente
      if (onActualizarPerfiles) {
        console.log('🔄 ModalPerfiles: Actualizando lista de perfiles...');
        await onActualizarPerfiles();
        console.log('✅ ModalPerfiles: Lista de perfiles actualizada');
      }
    } catch (error) {
      console.error('❌ ModalPerfiles: Error al actualizar PIN:', error);
      throw error;
    }
  };

  const manejarEditarPerfil = async (perfilId, nuevoNombre) => {
    try {
      const resultado = await actualizarPerfil(perfilId, nuevoNombre);
      if (resultado.success) {
        // Actualizar la lista de perfiles inmediatamente
        if (onActualizarPerfiles) {
          await onActualizarPerfiles();
        }
      } else {
        throw new Error(resultado.mensaje);
      }
    } catch (error) {
      console.error('Error al editar perfil:', error);
      throw error;
    }
  };

  const manejarEliminarPerfil = async (perfilId) => {
    try {
      const resultado = await eliminarPerfil(perfilId);
      if (resultado.success) {
        // Actualizar la lista de perfiles inmediatamente
        if (onActualizarPerfiles) {
          await onActualizarPerfiles();
        }
      } else {
        throw new Error(resultado.mensaje);
      }
    } catch (error) {
      console.error('Error al eliminar perfil:', error);
      throw error;
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
              {perfiles.map((perfil) => (
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
        perfiles={perfiles}
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