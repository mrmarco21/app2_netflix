import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  TextInput, 
  Modal, 
  Image,
  BackHandler 
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  obtenerPerfilesPorUsuario, 
  crearPerfil, 
  actualizarPerfil, 
  eliminarPerfil,
  actualizarPinPerfil
} from '../servicios/apiUsuarios';
import ModalPinPerfil from '../componentes/ModalPinPerfil';
import ModalAdministrarPerfiles from '../componentes/ModalAdministrarPerfiles';
import { useUsuario } from '../contextos/UsuarioContext';

export default function Perfiles({ navigation, route }) {
  const [perfiles, setPerfiles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEdicion, setModalEdicion] = useState(false);
  const [nombrePerfil, setNombrePerfil] = useState("");
  const [perfilEditando, setPerfilEditando] = useState(null);
  const [modalPinVisible, setModalPinVisible] = useState(false);
  const [perfilConPin, setPerfilConPin] = useState(null);
  const [modalAdministrarVisible, setModalAdministrarVisible] = useState(false);
  
  // Obtener cambiarPerfil del contexto
  const { cambiarPerfil, usuario } = useUsuario();
  
  // Usar el usuario del contexto, no de los parámetros de navegación
  const idUsuario = usuario?.id;
  
  console.log('👥 Perfiles.jsx - Usuario actual:', {
    usuarioId: usuario?.id,
    usuarioNombre: usuario?.nombres
  });

  // Imágenes de perfil disponibles
  const imagenesPerfiles = [
    require('../assets/perfil1.jpg'),
    require('../assets/perfil2.jpg'),
    require('../assets/perfil3.jpg'),
    require('../assets/perfil4.jpg'),
  ];

  // Controla el botón de atrás del dispositivo
  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Login');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Cargar perfiles al montar el componente
  useEffect(() => {
    cargarPerfiles();
  }, []);

  // Cargar perfiles al montar el componente o cuando cambie el usuario
  useEffect(() => {
    if (usuario?.id) {
      cargarPerfiles();
    }
  }, [usuario?.id]); // Solo depende del ID del usuario

  const cargarPerfiles = async () => {
    if (!idUsuario) {
      console.log('⚠️ No hay usuario válido para cargar perfiles');
      setCargando(false);
      return;
    }
    
    try {
      setCargando(true);
      console.log('🔄 Cargando perfiles para usuario:', idUsuario);
      const resultado = await obtenerPerfilesPorUsuario(idUsuario);
      
      if (resultado.success) {
        let perfilesData = resultado.data.perfiles || [];
        
        // Si no hay perfiles, crear uno por defecto con el nombre del usuario
        if (perfilesData.length === 0 && usuario?.nombres) {
          const resultadoCreacion = await crearPerfil(usuario.nombres, idUsuario);
          if (resultadoCreacion.success) {
            perfilesData = [resultadoCreacion.data.perfil];
          }
        }
        
        console.log('✅ Perfiles cargados para usuario', idUsuario, ':', perfilesData.length);
        setPerfiles(perfilesData);
      } else {
        Alert.alert('Error', resultado.mensaje);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los perfiles');
    } finally {
      setCargando(false);
    }
  };

  const manejarCrearPerfil = async () => {
    if (!nombrePerfil.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el perfil');
      return;
    }

    if (nombrePerfil.length > 50) {
      Alert.alert('Error', 'El nombre no puede exceder 50 caracteres');
      return;
    }

    try {
      const resultado = await crearPerfil(nombrePerfil.trim(), idUsuario);
      
      if (resultado.success) {
        Alert.alert('Éxito', 'Perfil creado exitosamente');
        setNombrePerfil("");
        setModalVisible(false);
        cargarPerfiles();
      } else {
        Alert.alert('Error', resultado.mensaje);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el perfil');
    }
  };

  const manejarEditarPerfil = async () => {
    if (!nombrePerfil.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el perfil');
      return;
    }

    if (nombrePerfil.length > 50) {
      Alert.alert('Error', 'El nombre no puede exceder 50 caracteres');
      return;
    }

    try {
      const resultado = await actualizarPerfil(perfilEditando.id, nombrePerfil.trim());
      
      if (resultado.success) {
        Alert.alert('Éxito', 'Perfil actualizado exitosamente');
        setNombrePerfil("");
        setModalEdicion(false);
        setPerfilEditando(null);
        cargarPerfiles();
      } else {
        Alert.alert('Error', resultado.mensaje);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  const manejarEliminarPerfil = (perfil) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar el perfil "${perfil.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const resultado = await eliminarPerfil(perfil.id);
              
              if (resultado.success) {
                Alert.alert('Éxito', 'Perfil eliminado exitosamente');
                cargarPerfiles();
              } else {
                Alert.alert('Error', resultado.mensaje);
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el perfil');
            }
          }
        }
      ]
    );
  };

  const abrirModalEdicion = (perfil) => {
    setPerfilEditando(perfil);
    setNombrePerfil(perfil.nombre);
    setModalEdicion(true);
  };

  const seleccionarPerfil = async (perfil) => {
    console.log('👤 Seleccionando perfil en Perfiles.jsx:', perfil.nombre, 'tiene PIN:', !!perfil.pin);
    // Verificar si el perfil tiene PIN
    if (perfil.pin) {
      setPerfilConPin(perfil);
      setModalPinVisible(true);
    } else {
      // Usar cambiarPerfil del contexto antes de navegar
      await cambiarPerfil(perfil);
      // Navegar sin pasar el perfil ya que está en el contexto
      navigation.navigate('InicioApp', { 
        idUsuario: idUsuario 
      });
    }
  };

  const manejarAccesoPermitido = async (perfil) => {
    console.log('🔓 Acceso permitido en Perfiles.jsx para:', perfil.nombre);
    setModalPinVisible(false);
    setPerfilConPin(null);
    // Usar cambiarPerfil del contexto antes de navegar
    await cambiarPerfil(perfil);
    // Navegar sin pasar el perfil ya que está en el contexto
    navigation.navigate('InicioApp', { 
      idUsuario: idUsuario 
    });
  };

  const cerrarModalPin = () => {
    setModalPinVisible(false);
    setPerfilConPin(null);
  };

  // Funciones para el modal de administrar perfiles
  const manejarActualizarPin = async (perfilId, pin) => {
    try {
      const resultado = await actualizarPinPerfil(perfilId, pin);
      if (resultado.success) {
        Alert.alert('Éxito', 'PIN actualizado exitosamente');
        cargarPerfiles(); // Recargar perfiles para mostrar cambios
        return true;
      } else {
        Alert.alert('Error', resultado.mensaje);
        return false;
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el PIN');
      return false;
    }
  };

  const manejarEditarPerfilAdmin = async (perfil) => {
    try {
      const resultado = await actualizarPerfil(perfil.id, perfil.nombre);
      if (resultado.success) {
        Alert.alert('Éxito', 'Perfil actualizado exitosamente');
        cargarPerfiles();
        return true;
      } else {
        Alert.alert('Error', resultado.mensaje);
        return false;
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
      return false;
    }
  };

  const manejarEliminarPerfilAdmin = async (perfil) => {
    try {
      const resultado = await eliminarPerfil(perfil.id);
      if (resultado.success) {
        Alert.alert('Éxito', 'Perfil eliminado exitosamente');
        cargarPerfiles();
        return true;
      } else {
        Alert.alert('Error', resultado.mensaje);
        return false;
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el perfil');
      return false;
    }
  };

  if (cargando) {
    return (
      <SafeAreaView style={estilos.safeArea}>
        <LinearGradient colors={['#b8b8b86a', '#1a1a1a', '#000000']} style={estilos.gradient}>
          <View style={estilos.contenedorCargando}>
            <Text style={estilos.textoCargando}>Cargando perfiles...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.safeArea}>
      <LinearGradient colors={['#b8b8b86a', '#1a1a1a', '#000000']} style={estilos.gradient}>
        {/* Header */}
        <View style={estilos.header}>
          <Text style={estilos.nombreApp}>MI NETFLIX</Text>
        </View>

        <ScrollView style={estilos.contenedorPrincipal} showsVerticalScrollIndicator={false}>
          <Text style={estilos.titulo}>¿Quién está viendo?</Text>
          
          {/* Grid de perfiles */}
          <View style={estilos.gridPerfiles}>
            {perfiles.map((perfil, index) => (
              <View key={perfil.id} style={estilos.contenedorPerfil}>
                <TouchableOpacity
                  style={estilos.perfilItem}
                  onPress={() => seleccionarPerfil(perfil)}
                >
                  <Image
                    source={imagenesPerfiles[index % imagenesPerfiles.length]}
                    style={estilos.imagenPerfil}
                  />
                  <Text style={estilos.nombrePerfilItem}>{perfil.nombre}</Text>
                </TouchableOpacity>
                
                {/* Botones de acción */}
                <View style={estilos.botonesAccion}>
                  <TouchableOpacity
                    onPress={() => abrirModalEdicion(perfil)}
                    style={estilos.botonAccion}
                  >
                    <Ionicons name="pencil" size={16} color="#ffffff" />
                  </TouchableOpacity>
                  
                  {perfiles.length > 1 && (
                    <TouchableOpacity
                      onPress={() => manejarEliminarPerfil(perfil)}
                      style={[estilos.botonAccion, estilos.botonEliminar]}
                    >
                      <Ionicons name="trash" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
            
            {/* Botón para agregar nuevo perfil */}
            {perfiles.length < 5 && (
              <TouchableOpacity
                style={estilos.perfilAgregar}
                onPress={() => setModalVisible(true)}
              >
                <View style={estilos.iconoAgregar}>
                  <Ionicons name="add" size={40} color="#ffffff" />
                </View>
                <Text style={estilos.textoAgregar}>Agregar perfil</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Botón de administrar perfiles */}
          <TouchableOpacity 
            style={estilos.botonAdministrar}
            onPress={() => setModalAdministrarVisible(true)}
          >
            <Text style={estilos.textoAdministrar}>Administrar perfiles</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Modal para crear perfil */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={estilos.modalOverlay}>
            <View style={estilos.modalContenido}>
              <Text style={estilos.modalTitulo}>Crear nuevo perfil</Text>
              
              <TextInput
                style={estilos.modalInput}
                placeholder="Nombre del perfil"
                placeholderTextColor="#999"
                value={nombrePerfil}
                onChangeText={setNombrePerfil}
                maxLength={50}
              />
              
              <View style={estilos.modalBotones}>
                <TouchableOpacity
                  style={[estilos.modalBoton, estilos.botonCancelar]}
                  onPress={() => {
                    setModalVisible(false);
                    setNombrePerfil("");
                  }}
                >
                  <Text style={estilos.textoBotonCancelar}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[estilos.modalBoton, estilos.botonCrear]}
                  onPress={manejarCrearPerfil}
                >
                  <Text style={estilos.textoBotonCrear}>Crear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal para editar perfil */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalEdicion}
          onRequestClose={() => setModalEdicion(false)}
        >
          <View style={estilos.modalOverlay}>
            <View style={estilos.modalContenido}>
              <Text style={estilos.modalTitulo}>Editar perfil</Text>
              
              <TextInput
                style={estilos.modalInput}
                placeholder="Nombre del perfil"
                placeholderTextColor="#999"
                value={nombrePerfil}
                onChangeText={setNombrePerfil}
                maxLength={50}
              />
              
              <View style={estilos.modalBotones}>
                <TouchableOpacity
                  style={[estilos.modalBoton, estilos.botonCancelar]}
                  onPress={() => {
                    setModalEdicion(false);
                    setNombrePerfil("");
                    setPerfilEditando(null);
                  }}
                >
                  <Text style={estilos.textoBotonCancelar}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[estilos.modalBoton, estilos.botonCrear]}
                  onPress={manejarEditarPerfil}
                >
                  <Text style={estilos.textoBotonCrear}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal para verificar PIN */}
        <ModalPinPerfil
          visible={modalPinVisible}
          perfil={perfilConPin}
          onCerrar={cerrarModalPin}
          onAccesoPermitido={manejarAccesoPermitido}
        />

        {/* Modal para administrar perfiles */}
        <ModalAdministrarPerfiles
          visible={modalAdministrarVisible}
          perfiles={perfiles}
          onCerrar={() => setModalAdministrarVisible(false)}
          onActualizarPin={manejarActualizarPin}
          onEditarPerfil={manejarEditarPerfilAdmin}
          onEliminarPerfil={manejarEliminarPerfilAdmin}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  nombreApp: {
    color: "#E50914",
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  contenedorPrincipal: {
    flex: 1,
    paddingHorizontal: 25,
  },
  contenedorCargando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCargando: {
    color: '#ffffff',
    fontSize: 18,
  },
  titulo: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  gridPerfiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  contenedorPerfil: {
    alignItems: 'center',
    marginBottom: 20,
  },
  perfilItem: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 4,
    // },
    // shadowOpacity: 0.3,
    // shadowRadius: 8,
    // elevation: 8,
  },
  imagenPerfil: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  nombrePerfilItem: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
    maxWidth: 120,
  },
  botonesAccion: {
    flexDirection: 'row',
    gap: 10,
  },
  botonAccion: {
    backgroundColor: '#333333',
    padding: 8,
    borderRadius: 20,
  },
  botonEliminar: {
    backgroundColor: '#E50914',
  },
  perfilAgregar: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconoAgregar: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  textoAgregar: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  botonAdministrar: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 40,
    marginBottom: 40,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  textoAdministrar: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContenido: {
    backgroundColor: '#222222',
    padding: 30,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
  },
  modalTitulo: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#333333',
    color: '#ffffff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  modalBotones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  modalBoton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonCancelar: {
    backgroundColor: '#666666',
  },
  botonCrear: {
    backgroundColor: '#E50914',
  },
  textoBotonCancelar: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  textoBotonCrear: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});