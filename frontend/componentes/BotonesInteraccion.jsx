import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BotonesInteraccion({ onMiLista, onCalificar, onCompartir, enMiLista = false }) {
  return (
    <View style={styles.container}>
      {/* Botón Mi lista */}
      <TouchableOpacity onPress={onMiLista} style={styles.boton}>
        <Ionicons 
          name={enMiLista ? "checkmark" : "add"} 
          size={24} 
          color="white" 
        />
        <Text style={styles.textoBoton}>Mi lista</Text>
      </TouchableOpacity>
      
      {/* Botón Calificar */}
      <TouchableOpacity onPress={onCalificar} style={styles.boton}>
        <Ionicons name="thumbs-up-outline" size={24} color="white" />
        <Text style={styles.textoBoton}>Calificar</Text>
      </TouchableOpacity>
      
      {/* Botón Compartir */}
      <TouchableOpacity onPress={onCompartir} style={styles.boton}>
        <Ionicons name="share-outline" size={24} color="white" />
        <Text style={styles.textoBoton}>Compartir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#000',
  },
  boton: {
    alignItems: 'center',
    flex: 1,
  },
  textoBoton: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});