import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Image,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ModalAdministrarPerfiles({ 
  visible, 
  perfiles, 
  onCerrar, 
  onActualizarPin,
  onEditarPerfil,
  onEliminarPerfil
}) {
  const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);
  const [modalPin, setModalPin] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmarPin, setConfirmarPin] = useState('');
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');

  const abrirConfiguracionPin = (perfil) => {
    setPerfilSeleccionado(perfil);
    setPin('');
    setConfirmarPin('');
    setModalPin(true);
  };

  const guardarPin = async () => {
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      Alert.alert('Error', 'El PIN debe ser exactamente 4 dígitos numéricos');
      return;
    }

    if (pin !== confirmarPin) {
      Alert.alert('Error', 'Los PINs no coinciden');
      return;
    }

    try {
      await onActualizarPin(perfilSeleccionado.id, pin);
      Alert.alert('Éxito', 'PIN configurado exitosamente');
      setModalPin(false);
      setPerfilSeleccionado(null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo configurar el PIN');
    }
  };

  const eliminarPin = async () => {
    Alert.alert(
      'Eliminar PIN',
      '¿Estás seguro de que quieres eliminar el PIN de este perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await onActualizarPin(perfilSeleccionado.id, null);
              Alert.alert('Éxito', 'PIN eliminado exitosamente');
              setModalPin(false);
              setPerfilSeleccionado(null);
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el PIN');
            }
          }
        }
      ]
    );
  };

  const abrirEditarNombre = (perfil) => {
    setPerfilSeleccionado(perfil);
    setNuevoNombre(perfil.nombre);
    setEditandoNombre(true);
  };

  const guardarNombre = async () => {
    if (!nuevoNombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    if (nuevoNombre.length > 50) {
      Alert.alert('Error', 'El nombre no puede exceder 50 caracteres');
      return;
    }

    try {
      await onEditarPerfil(perfilSeleccionado.id, nuevoNombre.trim());
      Alert.alert('Éxito', 'Nombre actualizado exitosamente');
      setEditandoNombre(false);
      setPerfilSeleccionado(null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el nombre');
    }
  };

  const confirmarEliminarPerfil = (perfil) => {
    Alert.alert(
      'Eliminar perfil',
      `¿Estás seguro de que quieres eliminar el perfil "${perfil.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onEliminarPerfil(perfil.id)
        }
      ]
    );
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
              <Text style={styles.titulo}>Administrar perfiles</Text>
              <TouchableOpacity onPress={onCerrar} style={styles.cerrarButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.contenido}>
              {perfiles.map((perfil) => (
                <View key={perfil.id} style={styles.perfilItem}>
                  <View style={styles.perfilInfo}>
                    <Image source={perfil.avatar} style={styles.avatar} />
                    <View style={styles.perfilTexto}>
                      <Text style={styles.nombrePerfil}>{perfil.nombre}</Text>
                      <Text style={styles.estadoPin}>
                        {perfil.pin ? '🔒' : ''}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.acciones}>
                    <TouchableOpacity 
                      style={styles.botonAccion}
                      onPress={() => abrirEditarNombre(perfil)}
                    >
                      <Ionicons name="create-outline" size={20} color="white" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.botonAccion}
                      onPress={() => abrirConfiguracionPin(perfil)}
                    >
                      <Ionicons name="lock-closed-outline" size={20} color="white" />
                    </TouchableOpacity>
                    
                    {perfiles.length > 1 && (
                      <TouchableOpacity 
                        style={[styles.botonAccion, styles.botonEliminar]}
                        onPress={() => confirmarEliminarPerfil(perfil)}
                      >
                        <Ionicons name="trash-outline" size={20} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para configurar PIN */}
      <Modal
        visible={modalPin}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalPin(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalPin}>
            <Text style={styles.tituloPIN}>
              Configurar PIN para {perfilSeleccionado?.nombre}
            </Text>
            
            <View style={styles.seccionInput}>
              <Text style={styles.labelPin}>PIN (4 dígitos)</Text>
              <TextInput
                style={styles.inputPin}
                value={pin}
                onChangeText={setPin}
                placeholder="••••"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
            
            <View style={styles.seccionInput}>
              <Text style={styles.labelPin}>Confirmar PIN</Text>
              <TextInput
                style={styles.inputPin}
                value={confirmarPin}
                onChangeText={setConfirmarPin}
                placeholder="••••"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
            
            <View style={styles.botonesPin}>
              <TouchableOpacity 
                style={[styles.botonPin, styles.botonCancelar]}
                onPress={() => setModalPin(false)}
              >
                <Text style={styles.textoBotonPin}>Cancelar</Text>
              </TouchableOpacity>
              
              {perfilSeleccionado?.pin && (
                <TouchableOpacity 
                  style={[styles.botonPin, styles.botonEliminarPin]}
                  onPress={eliminarPin}
                >
                  <Text style={styles.textoBotonPin}>Eliminar PIN</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.botonPin, styles.botonGuardar]}
                onPress={guardarPin}
              >
                <Text style={styles.textoBotonGuardar}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para editar nombre */}
      <Modal
        visible={editandoNombre}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditandoNombre(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalPin}>
            <Text style={styles.tituloPIN}>
              Editar nombre del perfil
            </Text>
            
            <View style={styles.seccionInput}>
              <Text style={styles.labelPin}>Nuevo nombre</Text>
              <TextInput
                style={styles.inputPin}
                value={nuevoNombre}
                onChangeText={setNuevoNombre}
                placeholder="Nombre del perfil"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                maxLength={50}
              />
            </View>
            
            <View style={styles.botonesPin}>
              <TouchableOpacity 
                style={[styles.botonPin, styles.botonCancelar]}
                onPress={() => setEditandoNombre(false)}
              >
                <Text style={styles.textoBotonPin}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.botonPin, styles.botonGuardar]}
                onPress={guardarNombre}
              >
                <Text style={styles.textoBotonPin}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#0a0a0a',
    borderRadius: 2,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  titulo: {
    fontSize: 20,
    fontWeight: '200',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  cerrarButton: {
    width: 32,
    height: 32,
    borderRadius: 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenido: {
    padding: 24,
  },
  perfilItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 0,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.02)',
  },
  perfilInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 2,
    marginRight: 20,
  },
  perfilTexto: {
    flex: 1,
  },
  nombrePerfil: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '200',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  estadoPin: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    fontWeight: '200',
    letterSpacing: 0.2,
  },
  acciones: {
    flexDirection: 'row',
    gap: 16,
  },
  botonAccion: {
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 2,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  botonEliminar: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalPin: {
    backgroundColor: '#0a0a0a',
    borderRadius: 15,
    padding: 32,
    width: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  tituloPIN: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '200',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 0.4,
  },
  labelPin: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '200',
    marginBottom: 12,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  seccionInput: {
    marginBottom:18,
  },
  inputPin: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    fontWeight: '200',
    letterSpacing: 2,
  },
  botonesPin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 16,
  },
  botonPin: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    flex: 1,
  },
  botonCancelar: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  botonEliminarPin: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  botonGuardar: {
    backgroundColor: '#ffffffad',
    borderWidth: 1,
    borderColor: '#ffffff',
    paddingTop: 10,
  },
  textoBotonPin: {
    textAlign: 'center',
    fontWeight: '200',
    fontSize: 14,
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  textoBotonGuardar: {
    textAlign: 'center',
    fontWeight: '200',
    fontSize: 14,
    color: '#000000',
    letterSpacing: 0.3,
  },
});