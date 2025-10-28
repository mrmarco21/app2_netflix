import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ModalCategorias({ modalVisible, setModalVisible, categorias, setFiltroActivo, filtroActivo }) {
  const handleCategoriaSelect = (categoria) => {
    setFiltroActivo(categoria);
    setModalVisible(false);
  };

  // Categorías organizadas por tipo
  const todasLasCategorias = [
    { titulo: 'General', items: ['Inicio', 'Mi lista'] },
    { 
      titulo: 'Películas', 
      items: [
        'Acción', 
        'Comedia', 
        'Drama', 
        'Terror', 
        'Ciencia Ficción', 
        'Thriller', 
        'Romance', 
        'Animación'
      ] 
    },
    { 
      titulo: 'Series', 
      items: [
        'Acción y Aventura', 
        'Comedia de Series', 
        'Drama de Series', 
        'Crimen', 
        'Ciencia Ficción y Fantasía', 
        'Misterio'
      ] 
    }
  ];

  // Filtrar categorías según el filtro activo
  const categoriasOrganizadas = (() => {
    if (filtroActivo === 'Películas') {
      return [
        todasLasCategorias[0], // General
        todasLasCategorias[1]  // Solo Películas
      ];
    } else if (filtroActivo === 'Series') {
      return [
        todasLasCategorias[0], // General
        todasLasCategorias[2]  // Solo Series
      ];
    } else {
      return todasLasCategorias; // Mostrar todas si no hay filtro específico
    }
  })();

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
            {categoriasOrganizadas.map((seccion, seccionIndex) => (
              <View key={seccionIndex} style={styles.seccionContainer}>
                <Text style={styles.tituloSeccion}>{seccion.titulo}</Text>
                {seccion.items.map((categoria, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.categoriaItem}
                    onPress={() => handleCategoriaSelect(categoria)}
                  >
                    <Text style={styles.categoriaTexto}>{categoria}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  seccionContainer: {
    marginBottom: 20,
  },
  tituloSeccion: {
    color: '#e50914',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  categoriaItem: {
    paddingVertical: 12,
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