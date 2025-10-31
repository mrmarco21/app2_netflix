import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PerfilActual({ perfil, onPerfilPress }) {
<<<<<<< HEAD
   if (!perfil) {
    return null; // O muestra un placeholder
  }
=======

   if (!perfil) {
    return null; // O muestra un placeholder
  }
  // Log para debugging
  console.log('🎭 PerfilActual renderizado con:', perfil ? {
    id: perfil.id,
    nombre: perfil.nombre,
    hasAvatar: !!perfil.avatar
  } : 'null');

  // Si no hay perfil, no renderizar nada
  if (!perfil) {
    console.log('⚠️ PerfilActual: No hay perfil para mostrar');
    return null;
  }
>>>>>>> origin/Rama-solsol
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.perfilButton}
        onPress={onPerfilPress}
      >
        <Image 
          source={perfil.avatar} 
          style={styles.avatar}
        />
        <Text style={styles.nombrePerfil}>{perfil.nombre}</Text>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color="white" 
          style={styles.flecha}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  perfilButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  nombrePerfil: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  flecha: {
    marginLeft: 5,
  },
});