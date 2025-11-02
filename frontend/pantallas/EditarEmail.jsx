import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUsuario } from '../contextos/UsuarioContext';
import { actualizarCorreoUsuario } from '../servicios/apiUsuarios';

export default function EditarEmail({ navigation }) {
  const { usuario, establecerUsuario } = useUsuario();
  const [correo, setCorreo] = useState(usuario?.correo || '');
  const [cargando, setCargando] = useState(false);

  const manejarGuardar = async () => {
    if (!correo || !correo.includes('@')) {
      Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido');
      return;
    }
    setCargando(true);
    try {
      const resp = await actualizarCorreoUsuario(usuario.id, correo);
      if (resp.success && resp.data?.usuario) {
        await establecerUsuario(resp.data.usuario);
        Alert.alert('Éxito', 'Correo actualizado exitosamente');
        navigation.goBack();
      } else {
        Alert.alert('Error', resp.mensaje || 'No se pudo actualizar el correo');
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
        <Text style={styles.headerTitle}>Actualizar Email</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Nuevo correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          placeholderTextColor="#999"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

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
  input: {
    backgroundColor: '#111', borderColor: '#1f1f1f', borderWidth: 1,
    borderRadius: 8, padding: 12, color: '#fff', marginBottom: 16
  },
  button: {
    backgroundColor: '#E50914', borderRadius: 8, paddingVertical: 12, alignItems: 'center'
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600' }
});