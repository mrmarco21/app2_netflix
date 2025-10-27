import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Image,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ModalPerfiles({ 
  visible, 
  perfiles, 
  perfilActual, 
  onCerrar, 
  onSeleccionar 
}) {
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
                onPress={() => onSeleccionar(perfil)}
              >
                <View style={styles.avatarContainer}>
                  <Image source={perfil.avatar} style={styles.avatar} />
                  {perfil.bloqueado && (
                    <View style={styles.candadoContainer}>
                      <Ionicons name="lock-closed" size={16} color="white" />
                    </View>
                  )}
                </View>
                <Text style={styles.nombrePerfil}>{perfil.nombre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity style={styles.administrarButton}>
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.administrarTexto}>Administrar perfiles</Text>
          </TouchableOpacity>
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
    borderRadius: 10,
  },
  perfilActivo: {
    backgroundColor: '#333',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 10,
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