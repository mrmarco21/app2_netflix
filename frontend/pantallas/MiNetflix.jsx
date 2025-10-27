import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMiLista } from '../contextos/MiListaContext';
import { useUsuario } from '../contextos/UsuarioContext';
import HeaderMiNetflix from '../componentes/HeaderMiNetflix';
import PerfilActual from '../componentes/PerfilActual';
import ListaFavoritos from '../componentes/ListaFavoritos';
import ModalPerfiles from '../componentes/ModalPerfiles';
import ModalConfiguracion from '../componentes/ModalConfiguracion';
import NavegacionInferior from '../componentes/NavegacionInferior';

export default function MiNetflix({ navigation }) {
  const [modalPerfilesVisible, setModalPerfilesVisible] = useState(false);
  const [modalConfigVisible, setModalConfigVisible] = useState(false);

  const { miLista, quitarDeMiLista } = useMiLista();
  const { perfilActual, perfilesDisponibles, cambiarPerfil } = useUsuario();

  // Imágenes de perfil disponibles
  const imagenesPerfiles = [
    require('../assets/perfil1.jpg'),
    require('../assets/perfil2.jpg'),
    require('../assets/perfil3.jpg'),
    require('../assets/perfil4.jpg'),
  ];

  // Función para obtener la imagen del perfil basada en el ID
  const obtenerImagenPerfil = (perfilId) => {
    // Si no hay perfil actual, usar la primera imagen por defecto
    if (!perfilId) return imagenesPerfiles[0];
    
    // Usar el ID del perfil para determinar qué imagen usar
    const index = perfilId % imagenesPerfiles.length;
    return imagenesPerfiles[index];
  };

  // Función para preparar perfiles con imágenes
  const perfilesConImagenes = perfilesDisponibles.map(perfil => ({
    ...perfil,
    avatar: obtenerImagenPerfil(perfil.id)
  }));

  // Datos de ejemplo para contenido favorito
  const contenidoFavorito = [
    {
      id: 1,
      titulo: 'Rápidos y Furiosos 8',
      imagen: require('../assets/imgFondo1.jpg'),
      tipo: 'película',
      fechaAgregado: '2024-01-15'
    },
    {
      id: 2,
      titulo: 'Stranger Things',
      imagen: require('../assets/imgFondo2.jpg'),
      tipo: 'serie',
      fechaAgregado: '2024-01-10'
    },
    {
      id: 3,
      titulo: 'The Witcher',
      imagen: require('../assets/imgFondo3.jpg'),
      tipo: 'serie',
      fechaAgregado: '2024-01-08'
    },
    {
      id: 4,
      titulo: 'Extraction',
      imagen: require('../assets/imgFondo4.jpg'),
      tipo: 'película',
      fechaAgregado: '2024-01-05'
    }
  ];

  const handleCambiarPerfil = async (perfil) => {
    await cambiarPerfil(perfil);
    setModalPerfilesVisible(false);
  };

  const handleCerrarSesion = () => {
    setModalConfigVisible(false);
    // Aquí iría la lógica para cerrar sesión
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
      
      <HeaderMiNetflix 
        onMenuPress={() => setModalConfigVisible(true)}
        perfilActual={perfilActual ? {
          ...perfilActual,
          avatar: obtenerImagenPerfil(perfilActual.id)
        } : null}
        onPerfilPress={() => setModalPerfilesVisible(true)}
      />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <PerfilActual 
          perfil={perfilActual ? {
            ...perfilActual,
            avatar: obtenerImagenPerfil(perfilActual.id)
          } : null}
          onPerfilPress={() => setModalPerfilesVisible(true)}
        />
        
        <View style={styles.notificacionesContainer}>
          <View style={styles.notificacionItem}>
            <View style={styles.iconoNotificacion}>
              <Text style={styles.iconoTexto}>🔔</Text>
            </View>
            <View style={styles.notificacionTexto}>
              <Text style={styles.notificacionTitulo}>Notificaciones</Text>
              <Text style={styles.verTodos}>Ver todos</Text>
            </View>
          </View>
          
          <View style={styles.notificacionItem}>
            <View style={styles.iconoReloj}>
              <Text style={styles.iconoTexto}>⏳</Text>
            </View>
            <View style={styles.notificacionTexto}>
              <Text style={styles.notificacionTitulo}>Última oportunidad para verlos</Text>
              <Text style={styles.notificacionSubtitulo}>Están por irse.</Text>
              <Text style={styles.fecha}>15 sept</Text>
            </View>
          </View>
          
          <View style={styles.notificacionItem}>
            <View style={styles.iconoInfluencer}>
              <Text style={styles.iconoTexto}>📱</Text>
            </View>
            <View style={styles.notificacionTexto}>
              <Text style={styles.notificacionTitulo}>Qué ver</Text>
              <Text style={styles.notificacionSubtitulo}>Explora tus recomendaciones.</Text>
              <Text style={styles.fecha}>10 oct</Text>
            </View>
          </View>
        </View>

        <View style={styles.descargasContainer}>
          <View style={styles.descargasHeader}>
            <Text style={styles.descargasIcono}>⬇️</Text>
            <View style={styles.descargasTexto}>
              <Text style={styles.descargasTitulo}>Descargas</Text>
              <Text style={styles.descargasSubtitulo}>Las películas y series que descargues aparecen aquí.</Text>
            </View>
          </View>
        </View>
        
        <ListaFavoritos 
          contenido={miLista}
          navigation={navigation}
          onEliminar={quitarDeMiLista}
        />
      </ScrollView>
      
      <NavegacionInferior navigation={navigation} activeTab="MiNetflix" />
      
      <ModalPerfiles
        visible={modalPerfilesVisible}
        perfiles={perfilesConImagenes}
        perfilActual={perfilActual}
        onCerrar={() => setModalPerfilesVisible(false)}
        onSeleccionar={handleCambiarPerfil}
      />
      
      <ModalConfiguracion
        visible={modalConfigVisible}
        onCerrar={() => setModalConfigVisible(false)}
        onCerrarSesion={handleCerrarSesion}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flex: 1,
  },
  notificacionesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  notificacionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  iconoNotificacion: {
    width: 50,
    height: 50,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconoReloj: {
    width: 50,
    height: 50,
    backgroundColor: '#E50914',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconoInfluencer: {
    width: 50,
    height: 50,
    backgroundColor: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconoTexto: {
    fontSize: 20,
  },
  notificacionTexto: {
    flex: 1,
  },
  notificacionTitulo: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  notificacionSubtitulo: {
    color: '#999',
    fontSize: 14,
    marginBottom: 2,
  },
  fecha: {
    color: '#666',
    fontSize: 12,
  },
  verTodos: {
    color: '#999',
    fontSize: 14,
  },
  descargasContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  descargasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descargasIcono: {
    fontSize: 24,
    marginRight: 15,
  },
  descargasTexto: {
    flex: 1,
  },
  descargasTitulo: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  descargasSubtitulo: {
    color: '#999',
    fontSize: 14,
  },
});