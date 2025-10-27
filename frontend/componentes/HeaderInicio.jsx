import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HeaderInicio({ filtroActivo, onPressBuscar }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.logo}>N</Text>
        <Text style={styles.titulo}>{filtroActivo}</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="download-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={onPressBuscar}
        >
          <Ionicons name="search-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#000',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    color: '#E50914',
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 15,
  },
  titulo: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 20,
  },
});