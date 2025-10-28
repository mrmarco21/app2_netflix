import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { verificarPinPerfil } from '../servicios/apiUsuarios';

export default function ModalPinPerfil({ 
  visible, 
  perfil, 
  onCerrar, 
  onAccesoPermitido 
}) {
  const [pin, setPin] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarVerificarPin = async () => {
    if (pin.length !== 4) {
      Alert.alert('Error', 'El PIN debe tener 4 dígitos');
      return;
    }

    setCargando(true);
    try {
      const resultado = await verificarPinPerfil(perfil.id, pin);
      
      if (resultado.success) {
        setPin('');
        onAccesoPermitido(perfil);
      } else {
        Alert.alert('PIN Incorrecto', 'El PIN ingresado no es válido');
        setPin('');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo verificar el PIN');
      setPin('');
    } finally {
      setCargando(false);
    }
  };

  const manejarCerrar = () => {
    setPin('');
    onCerrar();
  };

  const manejarCambioPin = (texto) => {
    // Solo permitir números y máximo 4 dígitos
    const numerosSolo = texto.replace(/[^0-9]/g, '');
    if (numerosSolo.length <= 4) {
      setPin(numerosSolo);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={manejarCerrar}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Ionicons name="lock-closed" size={32} color="#e50914" />
            <Text style={styles.titulo}>Perfil Protegido</Text>
            <Text style={styles.subtitulo}>
              Ingresa el PIN para acceder a "{perfil?.nombre}"
            </Text>
          </View>

          <View style={styles.pinContainer}>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={manejarCambioPin}
              placeholder="PIN de 4 dígitos"
              placeholderTextColor="#666"
              keyboardType="numeric"
              secureTextEntry={true}
              maxLength={4}
              autoFocus={true}
            />
          </View>

          <View style={styles.botonesContainer}>
            <TouchableOpacity
              style={[styles.boton, styles.botonCancelar]}
              onPress={manejarCerrar}
              disabled={cargando}
            >
              <Text style={styles.textoBotonCancelar}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.boton, 
                styles.botonConfirmar,
                (pin.length !== 4 || cargando) && styles.botonDeshabilitado
              ]}
              onPress={manejarVerificarPin}
              disabled={pin.length !== 4 || cargando}
            >
              <Text style={styles.textoBotonConfirmar}>
                {cargando ? 'Verificando...' : 'Acceder'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  titulo: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  subtitulo: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  pinContainer: {
    width: '100%',
    marginBottom: 30,
  },
  pinInput: {
    backgroundColor: '#333',
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#555',
    letterSpacing: 8,
  },
  botonesContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 15,
  },
  boton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonCancelar: {
    backgroundColor: '#333',
  },
  botonConfirmar: {
    backgroundColor: '#e50914',
  },
  botonDeshabilitado: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  textoBotonCancelar: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  textoBotonConfirmar: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});