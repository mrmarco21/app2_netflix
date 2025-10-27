import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ModalConfiguracion({ 
  visible, 
  onCerrar, 
  onCerrarSesion, 
  navigation 
}) {
  const opcionesMenu = [
    {
      id: 'administrar-perfiles',
      icono: 'create-outline',
      titulo: 'Administrar perfiles',
      onPress: () => {
        onCerrar();
        // Aquí iría la navegación a administrar perfiles
      }
    },
    {
      id: 'configuracion-app',
      icono: 'settings-outline',
      titulo: 'Configuración de la app',
      onPress: () => {
        onCerrar();
        // Aquí iría la navegación a configuración
      }
    },
    {
      id: 'cuenta',
      icono: 'person-outline',
      titulo: 'Cuenta',
      onPress: () => {
        onCerrar();
        // Aquí iría la navegación a cuenta
      }
    },
    {
      id: 'ayuda',
      icono: 'help-circle-outline',
      titulo: 'Ayuda',
      onPress: () => {
        onCerrar();
        // Aquí iría la navegación a ayuda
      }
    },
    {
      id: 'cerrar-sesion',
      icono: 'log-out-outline',
      titulo: 'Cerrar sesión',
      onPress: onCerrarSesion,
      esDestructivo: true
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCerrar}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onCerrar} style={styles.cerrarButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.opcionesContainer}>
            {opcionesMenu.map((opcion) => (
              <TouchableOpacity
                key={opcion.id}
                style={styles.opcionItem}
                onPress={opcion.onPress}
              >
                <Ionicons 
                  name={opcion.icono} 
                  size={24} 
                  color={opcion.esDestructivo ? '#E50914' : 'white'} 
                />
                <Text style={[
                  styles.opcionTexto,
                  opcion.esDestructivo && styles.textoDestructivo
                ]}>
                  {opcion.titulo}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.versionContainer}>
            <Text style={styles.versionTexto}>Versión: 9.37.0 build 7</Text>
          </View>
        </View>
      </View>
    </Modal>
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
    maxHeight: '70%',
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cerrarButton: {
    padding: 5,
  },
  opcionesContainer: {
    paddingHorizontal: 20,
  },
  opcionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  opcionTexto: {
    color: 'white',
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
  },
  textoDestructivo: {
    color: '#E50914',
  },
  versionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  versionTexto: {
    color: '#666',
    fontSize: 12,
  },
});