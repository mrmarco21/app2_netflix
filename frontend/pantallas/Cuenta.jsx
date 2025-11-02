import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Modal, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUsuario } from '../contextos/UsuarioContext';
import { eliminarUsuario } from '../servicios/apiUsuarios';

export default function Cuenta({ navigation }) {
  const { usuario, perfilActual, cerrarSesion } = useUsuario();
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = React.useState(false);
  const [eliminando, setEliminando] = React.useState(false);

  const imagenesPerfiles = [
    require('../assets/perfil1.jpg'),
    require('../assets/perfil2.jpg'),
    require('../assets/perfil3.jpg'),
    require('../assets/perfil4.jpg'),
  ];

  const obtenerImagenPerfil = (perfilId) => {
    if (!perfilId) return imagenesPerfiles[0];
    const index = perfilId % imagenesPerfiles.length;
    return imagenesPerfiles[index];
  };

  const avatar = obtenerImagenPerfil(perfilActual?.id);
  const email = usuario?.correo || '';

  const pedirConfirmacionEliminar = () => {
    console.log('🗑️ Solicitud de eliminación iniciada. Usuario actual:', {
      id: usuario?.id,
      correo: usuario?.correo,
    });
    if (Platform.OS === 'web') {
      setMostrarConfirmacionEliminar(true);
      return;
    }
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro que quieres eliminar tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí',
          style: 'destructive',
          onPress: confirmarEliminarCuenta,
        },
      ]
    );
  };

  const confirmarEliminarCuenta = async () => {
    if (!usuario?.id || eliminando) return;
    try {
      setEliminando(true);
      console.log('🔄 Eliminando cuenta en el servidor...', { id: usuario.id });
      const resultado = await eliminarUsuario(usuario.id);
      console.log('✅ Resultado eliminarUsuario:', resultado);
      if (resultado?.success) {
        const cerrada = await cerrarSesion();
        console.log('🔴 Sesión cerrada tras eliminación:', cerrada);
        navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] });
      } else {
        Alert.alert('Error', resultado?.mensaje || 'No se pudo eliminar la cuenta');
      }
    } catch (error) {
      console.error('❌ Error al eliminar cuenta:', error);
      Alert.alert('Error', 'Ocurrió un problema al eliminar la cuenta');
    } finally {
      setEliminando(false);
      setMostrarConfirmacionEliminar(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seguridad</Text>
        <View style={styles.profileRight}>
          {perfilActual && (
            <View style={styles.profileWrapper}>
              <Image source={avatar} style={styles.avatar} />
              <Text style={styles.profileName}>{perfilActual.nombre}</Text>
              <Ionicons name="chevron-down" size={16} color="#fff" />
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Información de la cuenta</Text>

        <TouchableOpacity style={styles.itemRow} activeOpacity={0.7} onPress={() => navigation.navigate('CambiarContrasena')}>
          <Ionicons name="lock-closed-outline" size={22} color="#fff" />
          <View style={styles.itemTextWrap}>
            <Text style={styles.itemTitle}>Contraseña</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemRow} activeOpacity={0.7} onPress={() => navigation.navigate('EditarEmail')}>
          <Ionicons name="mail-outline" size={22} color="#fff" />
          <View style={styles.itemTextWrap}>
            <Text style={styles.itemTitle}>Email</Text>
            <View style={styles.inlineRow}>
              <Text style={styles.itemSub}>{email}</Text>
              {!!email && (
                <View style={styles.verifiedWrap}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.verifiedText}>Verificado</Text>
                </View>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteAccountButton}
          activeOpacity={0.8}
          onPress={pedirConfirmacionEliminar}
        >
          {eliminando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.deleteAccountText}>Eliminar cuenta</Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* Modal de confirmación (web) */}
      <Modal
        visible={mostrarConfirmacionEliminar}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarConfirmacionEliminar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Eliminar cuenta</Text>
            <Text style={styles.modalMessage}>¿Estás seguro que quieres eliminar tu cuenta?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancelar]}
                onPress={() => setMostrarConfirmacionEliminar(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirmar]}
                onPress={confirmarEliminarCuenta}
                disabled={eliminando}
              >
                <Text style={styles.modalButtonText}>SI</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 4,
  },
  profileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  itemTextWrap: {
    flex: 1,
    marginHorizontal: 12,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  itemSub: {
    color: '#bbb',
    fontSize: 13,
    marginTop: 4,
    marginRight: 6,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  verifiedWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 4,
  },
  deleteAccountButton: {
    backgroundColor: '#B00020',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#8A0018',
  },
  deleteAccountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 16,
    width: '90%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalMessage: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  modalButtonCancelar: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalButtonConfirmar: {
    backgroundColor: '#E50914',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});