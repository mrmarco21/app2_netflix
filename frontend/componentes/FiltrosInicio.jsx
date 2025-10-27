import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FiltrosInicio({ filtroActivo, setFiltroActivo, setModalVisible }) {
  return (
    <View style={styles.filtrosContainer}>
      <TouchableOpacity
        style={[styles.filtroButton, filtroActivo === 'Series' && styles.filtroActivo]}
        onPress={() => setFiltroActivo('Series')}
      >
        <Text style={[styles.filtroTexto, filtroActivo === 'Series' && { color: 'black' }]}>
          Series
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filtroButton, filtroActivo === 'Películas' && styles.filtroActivo]}
        onPress={() => setFiltroActivo('Películas')}
      >
        <Text style={[styles.filtroTexto, filtroActivo === 'Películas' && { color: 'black' }]}>
          Películas
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.filtroButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.filtroTexto}>Categorías</Text>
        <Ionicons name="chevron-down" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  filtrosContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#000',
  },
  filtroButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtroActivo: {
    backgroundColor: 'white',
  },
  filtroTexto: {
    color: 'white',
    fontSize: 14,
    marginRight: 5,
  },
});