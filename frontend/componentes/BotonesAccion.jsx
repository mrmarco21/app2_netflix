import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BotonesAccion({ onVer, onDescargar }) {
  return (
    <View style={styles.container}>
      {/* Botón Ver */}
      <TouchableOpacity onPress={onVer} style={styles.verButton}>
        <Ionicons name="play" size={20} color="black" />
        <Text style={styles.verText}>Ver</Text>
      </TouchableOpacity>
      
      {/* Botón Descargar */}
      <TouchableOpacity onPress={onDescargar} style={styles.descargarButton}>
        <Ionicons name="download-outline" size={20} color="white" />
        <Text style={styles.descargarText}>Descargar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000',
  },
  verButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  verText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  descargarButton: {
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
  },
  descargarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});