import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HeaderBusqueda({ 
  textoBusqueda, 
  onChangeText, 
  onVolver, 
  onLimpiar 
}) {
  return (
    <View style={styles.headerBusqueda}>
      <TouchableOpacity 
        style={styles.botonVolver}
        onPress={onVolver}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.iconoBusqueda} />
        <TextInput
          style={styles.inputBusqueda}
          placeholder="Buscar series, películas y más..."
          placeholderTextColor="#666"
          value={textoBusqueda}
          onChangeText={onChangeText}
          autoFocus={true}
        />
        {textoBusqueda.length > 0 && (
          <TouchableOpacity 
            style={styles.botonLimpiar}
            onPress={onLimpiar}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#000',
  },
  botonVolver: {
    marginRight: 15,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  iconoBusqueda: {
    marginRight: 10,
  },
  inputBusqueda: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 12,
  },
  botonLimpiar: {
    marginLeft: 10,
  },
});