import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUsuario } from '../contextos/UsuarioContext';
import { actualizarContrasenaUsuario } from '../servicios/apiUsuarios';

export default function CambiarContrasena({ navigation }) {
  const { usuario } = useUsuario();
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [cargando, setCargando] = useState(false);

  const manejarGuardar = async () => {
    if (!nuevaContrasena || nuevaContrasena.length < 5) {
      Alert.alert('Contraseña inválida', 'La nueva contraseña debe tener al menos 5 caracteres');
      return;
    }
    setCargando(true);
    try {
      const resp = await actualizarContrasenaUsuario(usuario.id, contrasenaActual, nuevaContrasena);
      if (resp.success) {
        Alert.alert('Éxito', 'Contraseña actualizada exitosamente');
        navigation.goBack();
      } else {
        Alert.alert('Error', resp.mensaje || 'No se pudo actualizar la contraseña');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cambiar contraseña</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Contraseña actual</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Tu contraseña actual"
            placeholderTextColor="#999"
            secureTextEntry={!mostrarActual}
            value={contrasenaActual}
            onChangeText={setContrasenaActual}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setMostrarActual(v => !v)}>
            <Ionicons name={mostrarActual ? 'eye-off' : 'eye'} size={20} color="#bbb" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nueva contraseña</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Define una nueva contraseña"
            placeholderTextColor="#999"
            secureTextEntry={!mostrarNueva}
            value={nuevaContrasena}
            onChangeText={setNuevaContrasena}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setMostrarNueva(v => !v)}>
            <Ionicons name={mostrarNueva ? 'eye-off' : 'eye'} size={20} color="#bbb" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, cargando && styles.buttonDisabled]}
          onPress={manejarGuardar}
          disabled={cargando}
        >
          <Text style={styles.buttonText}>{cargando ? 'Guardando...' : 'Guardar cambios'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#111'
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  content: { padding: 16 },
  label: { color: '#bbb', marginBottom: 8 },
  inputWrap: { position: 'relative', marginBottom: 16 },
  input: {
    backgroundColor: '#111', borderColor: '#1f1f1f', borderWidth: 1,
    borderRadius: 8, padding: 12, color: '#fff', paddingRight: 40
  },
  eyeBtn: { position: 'absolute', right: 10, top: 10, padding: 6 },
  button: {
    backgroundColor: '#E50914', borderRadius: 8, paddingVertical: 12, alignItems: 'center'
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600' }
});