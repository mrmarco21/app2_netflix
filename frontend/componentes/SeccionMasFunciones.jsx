import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { User, Shield, HelpCircle, Tv, Settings, ChevronRight, LogOut } from 'lucide-react-native';

export default function SeccionMasFunciones({ navigation, paraAdultos, onToggleParaAdultos, onCerrarSesion, onGestionPress, onConfiguracionPress }) {
  
  const opciones = [
    {
      id: 'gestion',
      titulo: 'Gestión',
      icono: User,
      onPress: onGestionPress
    },
    {
      id: 'adultos',
      titulo: 'Para adultos',
      icono: Shield,
      tieneSwitch: true,
    },
    {
      id: 'ayuda',
      titulo: 'Ayuda y Feedback',
      icono: HelpCircle,
      onPress: () => {
        console.log('Navegar a Ayuda');
        // navigation.navigate('Ayuda'); // Para implementar después
      }
    },
    {
      id: 'audio',
      titulo: 'Audio y Subtítulos',
      icono: Tv,
      onPress: () => {
        console.log('Navegar a Audio y Subtítulos');
        // navigation.navigate('AudioSubtitulos'); // Para implementar después
      }
    },
    {
      id: 'configuraciones',
      titulo: 'Configuraciones',
      icono: Settings,
      onPress: onConfiguracionPress
    },
    {
      id: 'cerrar-sesion',
      titulo: 'Cerrar sesión',
      icono: LogOut,
      onPress: () => {
        if (onCerrarSesion) {
          onCerrarSesion();
        }
      },
      esDestructivo: true,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Más funciones</Text>
      
      <View style={styles.opcionesContainer}>
        {opciones.map((opcion) => {
          const IconoComponente = opcion.icono;
          
          return (
            <TouchableOpacity
              key={opcion.id}
              style={styles.opcionItem}
              onPress={opcion.onPress}
              disabled={opcion.tieneSwitch}
              activeOpacity={0.7}
            >
              <View style={styles.opcionContenido}>
                <View style={styles.iconoTextoContainer}>
                  <IconoComponente color="#fff" size={24} />
                  <Text style={[
                    styles.opcionTexto, 
                    opcion.esDestructivo && styles.textoDestructivo
                  ]}>
                    {opcion.titulo}
                  </Text>
                </View>
                
                {opcion.tieneSwitch ? (
                  <Switch
                    value={paraAdultos}
                    onValueChange={onToggleParaAdultos}
                    trackColor={{ false: '#767577', true: '#4ECDC4' }}
                    thumbColor={paraAdultos ? '#fff' : '#f4f3f4'}
                  />
                ) : (
                  <ChevronRight 
                    color={opcion.esDestructivo ? '#E50914' : '#fff'} 
                    size={24} 
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  titulo: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  opcionesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  opcionItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  opcionContenido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconoTextoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  opcionTexto: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
  textoDestructivo: {
    color: '#E50914',
  },
});