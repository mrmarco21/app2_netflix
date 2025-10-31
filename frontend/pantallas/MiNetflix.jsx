import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMiLista } from '../contextos/MiListaContext';
import { useUsuario } from '../contextos/UsuarioContext';
import { useHistorial } from '../contextos/HistorialContext';
import HeaderMiNetflix from '../componentes/HeaderMiNetflix';
import PerfilActual from '../componentes/PerfilActual';
import ModalPerfiles from '../componentes/ModalPerfiles';
import ListaFavoritos from '../componentes/ListaFavoritos';

import ModalConfiguracion from '../componentes/ModalConfiguracion';
import ModalPinPerfil from '../componentes/ModalPinPerfil';
import NavegacionInferior from '../componentes/NavegacionInferior';
//nuevos componentes
import BotonesAcciones from '../componentes/BotonesAcciones';
import SeccionHistorial from '../componentes/SeccionHistorial';
import SeccionMasFunciones from '../componentes/SeccionMasFunciones';
import ModalCompartir from '../componentes/ModalCompartir';

export default function MiNetflix({ navigation }) {
// Estados para modales
  const [modalPerfilesVisible, setModalPerfilesVisible] = useState(false);
  const [modalConfigVisible, setModalConfigVisible] = useState(false);
  const [modalPinVisible, setModalPinVisible] = useState(false);
  const [perfilConPin, setPerfilConPin] = useState(null);
  const [paraAdultos, setParaAdultos] = useState(false);
  const [modalCompartirVisible, setModalCompartirVisible] = useState(false);

  const { miLista, quitarDeMiLista, cargando } = useMiLista();
  const { perfilActual, perfilesDisponibles, cambiarPerfil, cargarPerfilesDisponibles, cerrarSesion, usuario } = useUsuario();
  const { historial, cargando: cargandoHistorial, obtenerHistorial } = useHistorial();

  // Log para debugging del estado del perfil
  console.log('🏠 MiNetflix renderizado - Estado actual:', {
    usuarioId: usuario?.id,
    perfilActualId: perfilActual?.id,
    perfilActualNombre: perfilActual?.nombre,
    totalPerfiles: perfilesDisponibles?.length || 0
  });

  // Controla el botón de atrás del dispositivo
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true; // Previene el comportamiento por defecto
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove(); // Limpia el listener al desmontar
  }, [navigation]);


  useEffect(() => {
    if (perfilActual?.id) {
      obtenerHistorial(perfilActual.id);
    }
  }, [perfilActual?.id]);
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


  const handleCambiarPerfil = async (perfil) => {
    // Verificar si el perfil tiene PIN
    if (perfil.pin) {
      setPerfilConPin(perfil);
      setModalPinVisible(true);
      setModalPerfilesVisible(false);
    } else {
      await cambiarPerfil(perfil);
      setModalPerfilesVisible(false);
    }
  };

  const manejarAccesoPermitido = async (perfil) => {
    if (perfilConPin) {
      await cambiarPerfil(perfilConPin);
      setModalPinVisible(false);
      setPerfilConPin(null);
    }
  };

  const cerrarModalPin = () => {
    setModalPinVisible(false);
    setPerfilConPin(null);
  };

const handleCerrarSesion = async () => {
  try {
    console.log('🔴 Iniciando cierre de sesión...');
    
    // Cerrar sesión del contexto
    const sesionCerrada = await cerrarSesion();
    
    if (sesionCerrada) {
      console.log('✅ Sesión cerrada, navegando a NetflixIntro...');
      
      // Navegar al intro
      navigation.reset({
        index: 0,
        routes: [{ name: 'NetflixIntro' }],
      });
    } else {
      console.error('❌ No se pudo cerrar la sesión correctamente');
    }
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    // Intentar navegar de todas formas
    navigation.reset({
      index: 0,
      routes: [{ name: 'NetflixIntro' }],
    });
  }
};

  const handleToggleParaAdultos = (valor) => {
  setParaAdultos(valor);
  // Aquí puedes guardar la preferencia en tu backend
  console.log('Para adultos:', valor);
};
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
      
      <HeaderMiNetflix />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
  {perfilActual && (
    <>
      <PerfilActual 
        perfil={{
          ...perfilActual,
          avatar: obtenerImagenPerfil(perfilActual.id)
        }}
        onPerfilPress={() => setModalPerfilesVisible(true)}
        navigation={navigation}
      />

      <BotonesAcciones 
      navigation={navigation} 
      onCompartir={() => setModalCompartirVisible(true)}
      />
      
      <SeccionHistorial 
        historial={historial}
        navigation={navigation}
        cargando={cargandoHistorial}
      />
      
      <ListaFavoritos 
        contenido={miLista}
        navigation={navigation}
        onEliminar={(contenidoId) => quitarDeMiLista(contenidoId)}
        cargando={cargando}
      />
      
      <SeccionMasFunciones 
        navigation={navigation}
        paraAdultos={paraAdultos}
        onToggleParaAdultos={handleToggleParaAdultos}
        onCerrarSesion={handleCerrarSesion}
        onGestionPress={() => setModalPerfilesVisible(true)}
        onConfiguracionPress={() => setModalConfigVisible(true)}
      />
      <ModalCompartir
        visible={modalCompartirVisible}
        onCerrar={() => setModalCompartirVisible(false)}
        perfilActual={perfilActual}
      />
    </>

  )}
</ScrollView>


      
      <NavegacionInferior navigation={navigation} activeTab="MiNetflix" />
      
      <ModalPerfiles
        visible={modalPerfilesVisible}
        perfiles={perfilesConImagenes}
        perfilActual={perfilActual}
        onCerrar={() => setModalPerfilesVisible(false)}
        onSeleccionar={handleCambiarPerfil}
        onActualizarPerfiles={() => cargarPerfilesDisponibles(usuario?.id)}
      />
      
      <ModalConfiguracion
        visible={modalConfigVisible}
        onCerrar={() => setModalConfigVisible(false)}
        onCerrarSesion={handleCerrarSesion}
        onAdministrarPerfiles={() => {
          setModalConfigVisible(false);
          setModalPerfilesVisible(true);
        }}
        navigation={navigation}
      />

      <ModalPinPerfil
        visible={modalPinVisible}
        perfil={perfilConPin}
        onCerrar={cerrarModalPin}
        onAccesoPermitido={manejarAccesoPermitido}
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
});