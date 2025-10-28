import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HeaderMiNetflix({ onMenuPress }) {
  return (
    <View style={styles.header}>
      {/* <TouchableOpacity 
        style={styles.perfilContainer}
        onPress={onPerfilPress}
      >
        {perfilActual && (
          <>
            <Image 
              source={perfilActual.avatar} 
              style={styles.avatarPequeno}
            />
            <Text style={styles.nombrePerfil}>{perfilActual.nombre}</Text>
            <Ionicons name="chevron-down" size={16} color="white" style={styles.flechaAbajo} />
          </>
        )}
        {!perfilActual && (
          )}
          </TouchableOpacity> */}
      <Text style={styles.titulo}>Mi Netflix</Text>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
      >
        <Ionicons name="menu" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  perfilContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPequeno: {
    width: 32,
    height: 32,
    borderRadius: 4,
    marginRight: 8,
  },
  nombrePerfil: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
  },
  flechaAbajo: {
    marginLeft: 2,
  },
  titulo: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 5,
    // left: 350
  },
});