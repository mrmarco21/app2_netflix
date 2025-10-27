import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import NavegacionInferior from '../componentes/NavegacionInferior';

export default function Descargas({ navigation }) {
  const [descargas, setDescargas] = useState([]);
  const [espacioDisponible, setEspacioDisponible] = useState('2.1 GB');
  const [configuracionDescargas, setConfiguracionDescargas] = useState({
    calidadVideo: 'Estándar',
    soloWiFi: true,
    descargasInteligentes: true,
  });

  // Datos de ejemplo para descargas
  const ejemploDescargas = [
    {
      id: 1,
      titulo: 'Stranger Things',
      temporada: 'T4: E1-8',
      imagen: 'https://via.placeholder.com/150x200/8B0000/FFFFFF?text=STRANGER+THINGS',
      tamano: '1.2 GB',
      progreso: 100,
      fechaDescarga: '2024-01-15',
      tiempoRestante: null,
      estado: 'completada',
    },
    {
      id: 2,
      titulo: 'The Witcher',
      temporada: 'T3: E1-3',
      imagen: 'https://via.placeholder.com/150x200/4B0082/FFFFFF?text=THE+WITCHER',
      tamano: '800 MB',
      progreso: 65,
      fechaDescarga: '2024-01-16',
      tiempoRestante: '15 min',
      estado: 'descargando',
    },
    {
      id: 3,
      titulo: 'Casa de Papel',
      temporada: 'T5: E1-10',
      imagen: 'https://via.placeholder.com/150x200/FF6347/FFFFFF?text=CASA+PAPEL',
      tamano: '2.1 GB',
      progreso: 100,
      fechaDescarga: '2024-01-10',
      tiempoRestante: null,
      estado: 'completada',
    },
    {
      id: 4,
      titulo: 'Dark',
      temporada: 'T1: E1-5',
      imagen: 'https://via.placeholder.com/150x200/2F4F4F/FFFFFF?text=DARK',
      tamano: '950 MB',
      progreso: 30,
      fechaDescarga: '2024-01-16',
      tiempoRestante: '45 min',
      estado: 'descargando',
    },
  ];

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
    setDescargas(ejemploDescargas);
  }, []);

  const eliminarDescarga = (id) => {
    Alert.alert(
      'Eliminar descarga',
      '¿Estás seguro de que quieres eliminar esta descarga?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setDescargas(descargas.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const pausarReanudarDescarga = (id) => {
    setDescargas(descargas.map(item => {
      if (item.id === id && item.estado === 'descargando') {
        return { ...item, estado: 'pausada' };
      } else if (item.id === id && item.estado === 'pausada') {
        return { ...item, estado: 'descargando' };
      }
      return item;
    }));
  };

  const iniciarDescarga = (contenido) => {
    const nuevaDescarga = {
      ...contenido,
      progreso: 0,
      fechaDescarga: new Date().toISOString().split('T')[0],
      tiempoRestante: 'Calculando...',
      estado: 'descargando',
    };
    setDescargas([...descargas, nuevaDescarga]);
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
            onPress={() => pausarReanudarDescarga(item.id)}
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
          onPress={() => eliminarDescarga(item.id)}
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
        onPress={() => iniciarDescarga(item)}
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
          <Ionicons name="settings-outline" size={24} color="white" />
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
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Recomendado para ti</Text>
          <FlatList
            data={contenidoRecomendado}
            renderItem={renderRecomendadoItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
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