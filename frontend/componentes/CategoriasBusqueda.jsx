import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function CategoriasBusqueda({ categorias, onSeleccionarCategoria }) {
  return (
    <View style={styles.seccion}>
      <Text style={styles.tituloSeccion}>Explorar por categorías</Text>
      <View style={styles.categoriasGrid}>
        {categorias.map((categoria, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.categoriaItem}
            onPress={() => onSeleccionarCategoria(categoria)}
          >
            <Text style={styles.categoriaTexto}>{categoria}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: {
    marginVertical: 20,
  },
  tituloSeccion: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoriasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoriaItem: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
  },
  categoriaTexto: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});