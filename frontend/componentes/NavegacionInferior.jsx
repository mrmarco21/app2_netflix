import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NavegacionInferior({ navigation, activeTab = 'Inicio' }) {
  const navItems = [
    { id: 'Inicio', icon: 'home-outline', label: 'Inicio', screen: 'InicioApp' },
    { id: 'Proximamente', icon: 'play-circle-outline', label: 'Próximamente', screen: 'Proximamente' },
    { id: 'Descargas', icon: 'download-outline', label: 'Descargas', screen: 'Descargas' },
    { id: 'MiNetflix', icon: 'person-outline', label: 'Mi Netflix', screen: 'MiNetflix' },
  ];

  const handleNavPress = (item) => {
    if (item.screen && navigation) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <View style={styles.navegacionInferior}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.navItem}
          onPress={() => handleNavPress(item)}
        >
          <Ionicons
            name={item.icon}
            size={24}
            color={activeTab === item.id ? '#E50914' : 'white'}
          />
          <Text style={[
            styles.navTexto,
            { color: activeTab === item.id ? '#E50914' : 'white' }
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navegacionInferior: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navTexto: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
  },
});