import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function TemporadasSerie({ temporadas = [], esSerie, onReproducirEpisodio }) {
  console.log('TemporadasSerie - Datos recibidos:', { temporadas, esSerie, cantidad: temporadas?.length });
  
  const [temporadaSeleccionada, setTemporadaSeleccionada] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [episodioSeleccionado, setEpisodioSeleccionado] = useState(null);

  // No mostrar nada si no es una serie o no hay temporadas
  if (!esSerie || !temporadas || temporadas.length === 0) {
    return null;
  }

  const temporadaActual = temporadas[temporadaSeleccionada - 1];
  const episodios = temporadaActual?.episodes || [];

  const formatearDuracion = (duracion) => {
    if (!duracion) return '';
    const horas = Math.floor(duracion / 60);
    const minutos = duracion % 60;
    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    }
    return `${minutos}m`;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const abrirModalEpisodio = (episodio) => {
    setEpisodioSeleccionado(episodio);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEpisodioSeleccionado(null);
  };

  const seleccionarTemporada = (index) => {
    setTemporadaSeleccionada(index);
  };

  return (
    <View style={styles.container}>
      {/* Título de la sección */}
      <Text style={styles.titulo}>Temporadas</Text>

      {/* Selector de temporadas tipo chips */}
      <View style={styles.temporadasGrid}>
        {temporadas.map((temporada, index) => (
          <TouchableOpacity
            key={temporada.id || index}
            style={[
              styles.temporadaChip,
              temporadaSeleccionada === (index + 1) && styles.temporadaChipSelected
            ]}
            onPress={() => seleccionarTemporada(index + 1)}
          >
            <Text style={[
              styles.temporadaChipText,
              temporadaSeleccionada === (index + 1) && styles.temporadaChipTextSelected
            ]}>
              T{temporada.season_number || index + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de episodios horizontal */}
      {episodios.length > 0 && (
        <View style={styles.episodiosContainer}>
          <Text style={styles.tituloEpisodios}>
            Episodios ({episodios.length})
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.listaEpisodios}
            contentContainerStyle={styles.listaEpisodiosContent}
          >
            {episodios.map((episodio, index) => (
              <TouchableOpacity
                key={episodio.id || index}
                style={styles.episodioCard}
                onPress={() => abrirModalEpisodio(episodio)}
              >
                {/* Imagen del episodio */}
                <View style={styles.imagenContainer}>
                  {episodio.still_url ? (
                    <Image
                      source={{ uri: episodio.still_url }}
                      style={styles.imagenEpisodio}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagenPlaceholder}>
                      <Text style={styles.placeholderText}>Sin imagen</Text>
                    </View>
                  )}
                  
                  {/* Número de episodio superpuesto */}
                  <View style={styles.numeroEpisodioOverlay}>
                    <Text style={styles.numeroEpisodioText}>
                      {episodio.episode_number || index + 1}
                    </Text>
                  </View>
                </View>

                {/* Información del episodio */}
                <View style={styles.episodioInfo}>
                  <Text style={styles.tituloEpisodio} numberOfLines={2}>
                    {episodio.name || `Episodio ${index + 1}`}
                  </Text>
                  
                  {episodio.runtime && (
                    <Text style={styles.duracionEpisodio}>
                      {formatearDuracion(episodio.runtime)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Modal de información del episodio */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {episodioSeleccionado && (
              <>
                {/* Imagen del episodio en el modal */}
                {episodioSeleccionado.still_url ? (
                  <Image
                    source={{ uri: episodioSeleccionado.still_url }}
                    style={styles.modalImagen}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.modalImagenPlaceholder}>
                    <Text style={styles.modalPlaceholderText}>Sin imagen disponible</Text>
                  </View>
                )}

                {/* Información del episodio */}
                <View style={styles.modalInfo}>
                  <Text style={styles.modalTitulo}>
                    Episodio {episodioSeleccionado.episode_number}: {episodioSeleccionado.name}
                  </Text>
                  
                  {episodioSeleccionado.overview && (
                    <Text style={styles.modalDescripcion}>
                      {episodioSeleccionado.overview}
                    </Text>
                  )}

                  <View style={styles.modalDetalles}>
                    {episodioSeleccionado.air_date && (
                      <Text style={styles.modalFecha}>
                        Fecha de emisión: {formatearFecha(episodioSeleccionado.air_date)}
                      </Text>
                    )}
                    
                    {episodioSeleccionado.runtime && (
                      <Text style={styles.modalDuracion}>
                        Duración: {formatearDuracion(episodioSeleccionado.runtime)}
                      </Text>
                    )}
                  </View>

                  {/* Botones del modal */}
                  <View style={styles.modalBotones}>
                    <TouchableOpacity
                      style={styles.botonReproducir}
                      onPress={() => {
                        if (onReproducirEpisodio && episodioSeleccionado) {
                          onReproducirEpisodio(episodioSeleccionado);
                        }
                      }}
                    >
                      <Text style={styles.textoBotonReproducir}>▶ Reproducir</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.botonCerrar} onPress={cerrarModal}>
                      <Text style={styles.textoBotonCerrar}>Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Mensaje si no hay episodios */}
      {episodios.length === 0 && (
        <View style={styles.sinEpisodios}>
          <Text style={styles.textoSinEpisodios}>
            No hay episodios disponibles para esta temporada
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  titulo: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  
  // Estilos del dropdown
  // Estilos del selector de temporadas tipo chips
  temporadasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  temporadaChip: {
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#555',
  },
  temporadaChipSelected: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  temporadaChipText: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '500',
  },
  temporadaChipTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },

  // Estilos de episodios
  episodiosContainer: {
    marginTop: 10,
  },
  tituloEpisodios: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  listaEpisodios: {
    flexGrow: 0,
  },
  listaEpisodiosContent: {
    paddingRight: 20,
  },
  episodioCard: {
    width: width * 0.6,
    marginRight: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  imagenContainer: {
    position: 'relative',
  },
  imagenEpisodio: {
    width: '100%',
    height: 120,
  },
  imagenPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  numeroEpisodioOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  numeroEpisodioText: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: 'bold',
  },
  episodioInfo: {
    padding: 12,
  },
  tituloEpisodio: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  duracionEpisodio: {
    color: '#ccc',
    fontSize: 12,
  },

  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: width * 0.9,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalImagen: {
    width: '100%',
    height: 200,
  },
  modalImagenPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPlaceholderText: {
    color: '#666',
    fontSize: 16,
  },
  modalInfo: {
    padding: 20,
  },
  modalTitulo: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalDescripcion: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  modalDetalles: {
    marginBottom: 20,
  },
  modalFecha: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  modalDuracion: {
    color: '#999',
    fontSize: 12,
  },
  modalBotones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botonReproducir: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
  },
  textoBotonReproducir: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  botonCerrar: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    flex: 0.5,
  },
  textoBotonCerrar: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },

  // Mensaje sin episodios
  sinEpisodios: {
    padding: 20,
    alignItems: 'center',
  },
  textoSinEpisodios: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
  },
});