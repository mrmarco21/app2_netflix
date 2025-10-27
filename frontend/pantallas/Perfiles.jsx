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
  eliminarPerfil 
} from '../servicios/apiUsuarios';

export default function Perfiles({ navigation, route }) {
  const [perfiles, setPerfiles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEdicion, setModalEdicion] = useState(false);
  const [nombrePerfil, setNombrePerfil] = useState("");
  const [perfilEditando, setPerfilEditando] = useState(null);
  
  // Obtener el ID del usuario desde los parámetros de navegación o desde el login
  const { usuario } = route.params || {};
  const idUsuario = usuario?.id || 1; // Fallback temporal para pruebas

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

  const cargarPerfiles = async () => {
    try {
      setCargando(true);
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

  const seleccionarPerfil = (perfil) => {
    // Navegar a la pantalla principal de la app con los datos del perfil
    navigation.navigate('InicioApp', { 
      perfil: perfil,
      idUsuario: idUsuario 
    });
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
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={estilos.botonAtras}
          >
            <Ionicons name="arrow-back" size={25} color="#ffffff" />
          </TouchableOpacity>
          <Text style={estilos.nombreApp}>Perfiles</Text>
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
          <TouchableOpacity style={estilos.botonAdministrar}>
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
      </LinearGradient>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  botonAtras: {
    padding: 10,
    marginRight: 10,
  },
  nombreApp: {
    color: "red",
    fontSize: 26,
    fontWeight: "bold",
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
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 30,
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
    marginBottom: 10,
  },
  imagenPerfil: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  nombrePerfilItem: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 4,
    marginTop: 20,
    marginBottom: 40,
  },
  textoAdministrar: {
    color: '#ffffff',
    fontSize: 16,
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