import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  BackHandler,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import NavegacionInferior from '../componentes/NavegacionInferior';
import { useDescargas } from '../contextos/DescargasContext';

export default function Descargas({ navigation }) {
  const { descargas, iniciarDescarga, eliminarDescarga, pausarReanudarDescarga } = useDescargas();
  const [espacioDisponible, setEspacioDisponible] = React.useState('2.1 GB');
  const [configuracionDescargas, setConfiguracionDescargas] = React.useState({
    calidadVideo: 'Estándar',
    soloWiFi: true,
    descargasInteligentes: true,
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

  // Si deseas arrancar con descargas de ejemplo, puedes invocar iniciarDescarga desde aquí.

  // Contenido recomendado para descargar
  const contenidoRecomendado = [
    {
      id: 5,
      titulo: 'Breaking Bad',
      descripcion: 'Serie completa disponible',
      imagen: 'https://via.placeholder.com/150x200/228B22/FFFFFF?text=BREAKING+BAD',
      tamano: '15.2 GB',
    },
    {
      id: 6,
      titulo: 'Narcos',
      descripcion: 'Todas las temporadas',
      imagen: 'https://via.placeholder.com/150x200/8B4513/FFFFFF?text=NARCOS',
      tamano: '12.8 GB',
    },
  ];

  useEffect(() => {
    // No prellenamos; las descargas aparecerán cuando el usuario las inicie.
  }, []);

  // Eliminar directamente al pulsar el icono de basura
  const eliminarDirecto = (id) => eliminarDescarga(id);

  const pausarReanudar = (id) => {
    pausarReanudarDescarga(id);
  };

  const iniciarDescargaDesdeRecomendado = (contenido) => {
    iniciarDescarga(contenido);
  };

  const renderDescargaItem = ({ item }) => (
    <View style={styles.descargaItem}>
      <Image source={{ uri: item.imagen }} style={styles.descargaImagen} />
      
      <View style={styles.descargaInfo}>
        <Text style={styles.descargaTitulo}>{item.titulo}</Text>
        <Text style={styles.descargaTemporada}>{item.temporada}</Text>
        <Text style={styles.descargaTamano}>{item.tamano}</Text>
        
        {item.estado === 'descargando' || item.estado === 'pausada' ? (
          <View style={styles.progresoContainer}>
            <View style={styles.barraProgreso}>
              <View 
                style={[
                  styles.progresoFill, 
                  { width: `${item.progreso}%` }
                ]} 
              />
            </View>
            <Text style={styles.progresoTexto}>
              {item.progreso}% • {item.tiempoRestante}
            </Text>
          </View>
        ) : (
          <Text style={styles.estadoCompletada}>Descarga completada</Text>
        )}
      </View>

      <View style={styles.accionesDescarga}>
        {item.estado === 'completada' ? (
          <TouchableOpacity style={styles.botonReproducir}>
            <Ionicons name="play" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.botonPausar}
            onPress={() => pausarReanudar(item.id)}
          >
            <Ionicons 
              name={item.estado === 'descargando' ? "pause" : "play"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.botonEliminar}
          onPress={() => eliminarDirecto(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#E50914" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecomendadoItem = ({ item }) => (
    <View style={styles.recomendadoItem}>
      <Image source={{ uri: item.imagen }} style={styles.recomendadoImagen} />
      <View style={styles.recomendadoInfo}>
        <Text style={styles.recomendadoTitulo}>{item.titulo}</Text>
        <Text style={styles.recomendadoDescripcion}>{item.descripcion}</Text>
        <Text style={styles.recomendadoTamano}>{item.tamano}</Text>
      </View>
      <TouchableOpacity 
        style={styles.botonDescargar}
        onPress={() => iniciarDescargaDesdeRecomendado(item)}
      >
        <Ionicons name="download-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Mis descargas</Text>
        <TouchableOpacity style={styles.botonConfiguracion}>
          {/* <Ionicons name="settings-outline" size={24} color="white" /> */}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contenido}>
        {/* Información de almacenamiento */}
        <View style={styles.almacenamientoInfo}>
          <View style={styles.almacenamientoHeader}>
            <Ionicons name="phone-portrait-outline" size={20} color="white" />
            <Text style={styles.almacenamientoTexto}>
              Espacio disponible: {espacioDisponible}
            </Text>
          </View>
          <TouchableOpacity style={styles.botonGestionarAlmacenamiento}>
            <Text style={styles.textoGestionarAlmacenamiento}>
              Gestionar almacenamiento
            </Text>
          </TouchableOpacity>
        </View>

        {/* Configuración rápida */}
        <View style={styles.configuracionRapida}>
          <TouchableOpacity style={styles.opcionConfiguracion}>
            <Ionicons name="wifi" size={20} color="white" />
            <Text style={styles.textoConfiguracion}>Solo descargar con Wi-Fi</Text>
            <Ionicons 
              name={configuracionDescargas.soloWiFi ? "toggle" : "toggle-outline"} 
              size={24} 
              color={configuracionDescargas.soloWiFi ? "#E50914" : "#666"} 
            />
          </TouchableOpacity>
        </View>

        {/* Lista de descargas */}
        {descargas.length > 0 ? (
          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>Mis descargas ({descargas.length})</Text>
            <FlatList
              data={descargas}
              renderItem={renderDescargaItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View style={styles.sinDescargas}>
            <Ionicons name="download-outline" size={64} color="#666" />
            <Text style={styles.sinDescargasTitulo}>No tienes descargas</Text>
            <Text style={styles.sinDescargasTexto}>
              Descarga series y películas para verlas sin conexión
            </Text>
          </View>
        )}

        {/* Contenido recomendado para descargar */}
        {/* <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Recomendado para ti</Text>
          <FlatList
            data={contenidoRecomendado}
            renderItem={renderRecomendadoItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View> */}
      </ScrollView>

      <NavegacionInferior navigation={navigation} activeTab="Descargas" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitulo: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  botonConfiguracion: {
    padding: 5,
  },
  contenido: {
    flex: 1,
    paddingBottom: 100,
  },
  almacenamientoInfo: {
    backgroundColor: '#111',
    margin: 15,
    padding: 15,
    borderRadius: 8,
  },
  almacenamientoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  almacenamientoTexto: {
    color: 'white',
    fontSize: 14,
    marginLeft: 10,
  },
  botonGestionarAlmacenamiento: {
    alignSelf: 'flex-start',
  },
  textoGestionarAlmacenamiento: {
    color: '#E50914',
    fontSize: 14,
    fontWeight: '500',
  },
  configuracionRapida: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  opcionConfiguracion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  textoConfiguracion: {
    color: 'white',
    fontSize: 16,
    flex: 1,
    marginLeft: 15,
  },
  seccion: {
    paddingHorizontal: 15,
    marginBottom: 30,
  },
  tituloSeccion: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  descargaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  descargaImagen: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 15,
  },
  descargaInfo: {
    flex: 1,
  },
  descargaTitulo: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  descargaTemporada: {
    color: '#999',
    fontSize: 14,
    marginTop: 2,
  },
  descargaTamano: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  progresoContainer: {
    marginTop: 8,
  },
  barraProgreso: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 5,
  },
  progresoFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 2,
  },
  progresoTexto: {
    color: '#999',
    fontSize: 12,
  },
  estadoCompletada: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 5,
  },
  accionesDescarga: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botonReproducir: {
    backgroundColor: '#E50914',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  botonPausar: {
    backgroundColor: '#333',
    borderRadius: 20,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  botonEliminar: {
    padding: 8,
  },
  sinDescargas: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  sinDescargasTitulo: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  sinDescargasTexto: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  recomendadoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  recomendadoImagen: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 15,
  },
  recomendadoInfo: {
    flex: 1,
  },
  recomendadoTitulo: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  recomendadoDescripcion: {
    color: '#999',
    fontSize: 14,
    marginTop: 2,
  },
  recomendadoTamano: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  botonDescargar: {
    padding: 10,
  },
});