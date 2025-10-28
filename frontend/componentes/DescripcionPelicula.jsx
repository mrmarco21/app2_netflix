import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default function DescripcionPelicula({ descripcion, protagonistas, direccion }) {
  return (
    <View style={styles.container}>
      {/* Descripción */}
      <Text style={styles.descripcion}>{descripcion}</Text>
      
      {/* Protagonistas */}
      {protagonistas && (
        <View style={styles.infoSection}>
          <Text style={styles.label}>Protagonistas: </Text>
          <Text style={styles.value}>{protagonistas}</Text>
        </View>
      )}
      
      {/* Dirección */}
      {direccion && (
        <View style={styles.infoSection}>
          <Text style={styles.label}>Dirección: </Text>
          <Text style={styles.value}>{direccion}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000',
  },
  descripcion: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  label: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
});