import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ModalCategorias({ modalVisible, setModalVisible, categorias, setFiltroActivo }) {
  const handleCategoriaSelect = (categoria) => {
    setFiltroActivo(categoria);
    setModalVisible(false);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.cerrarModal}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <ScrollView style={styles.modalScroll}>
            {categorias.map((categoria, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoriaItem}
                onPress={() => handleCategoriaSelect(categoria)}
              >
                <Text style={styles.categoriaTexto}>{categoria}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    width: '80%',
    maxHeight: '70%',
    borderRadius: 10,
    position: 'relative',
  },
  modalScroll: {
    padding: 20,
  },
  categoriaItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  categoriaTexto: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  cerrarModal: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#333',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});