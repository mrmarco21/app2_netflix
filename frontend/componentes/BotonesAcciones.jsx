import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, Clock, Share2 } from 'lucide-react-native';

export default function BotonesAcciones({ navigation, onCompartir }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.boton}
        onPress={() => navigation.navigate('MiLista')}
      >
        <View style={styles.iconContainer}>
          <Heart color="#fff" size={28} fill="#E50914" />
        </View>
        <Text style={styles.texto}>Favoritos</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.boton}
        onPress={() => navigation.navigate('Historial')}
      >
        <View style={styles.iconContainer}>
          <Clock color="#fff" size={28} fill="#4ECDC4" />
        </View>
        <Text style={styles.texto}>Historial</Text>
      </TouchableOpacity>

      <TouchableOpacity 
          style={styles.boton}
          onPress={onCompartir}
        >
        <View style={styles.iconContainer}>
          <Share2 color="#fff" size={28} fill="#95E1D3" />
        </View>
        <Text style={styles.texto}>Compartir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 10,
  },
  boton: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  texto: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
});