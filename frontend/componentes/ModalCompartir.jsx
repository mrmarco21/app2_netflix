import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Share,
  ScrollView,
} from 'react-native';
import { X, MessageCircle, Send, Instagram, Facebook } from 'lucide-react-native';

export default function ModalCompartir({ visible, onCerrar, perfilActual }) {
  const handleCompartirWhatsApp = async () => {
    try {
      const mensaje = `¡Hola! Estoy usando Mi Netflix 🎬\nMi perfil: ${perfilActual?.nombre || 'Usuario'}\n\n¿Quieres unirte?`;
      await Share.share({
        message: mensaje,
      });
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  const handleCompartirGeneral = async () => {
    try {
      await Share.share({
        message: `Mira mi perfil en Mi Netflix 🍿\nPerfil: ${perfilActual?.nombre || 'Usuario'}`,
        title: 'Mi Netflix',
      });
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  const opciones = [
    {
      id: 'whatsapp',
      titulo: 'WhatsApp',
      icono: MessageCircle,
      color: '#25D366',
      onPress: handleCompartirWhatsApp,
    },
    {
      id: 'telegram',
      titulo: 'Telegram',
      icono: Send,
      color: '#0088cc',
      onPress: handleCompartirGeneral,
    },
    {
      id: 'instagram',
      titulo: 'Instagram',
      icono: Instagram,
      color: '#E4405F',
      onPress: handleCompartirGeneral,
    },
    {
      id: 'facebook',
      titulo: 'Facebook',
      icono: Facebook,
      color: '#1877F2',
      onPress: handleCompartirGeneral,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCerrar}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.titulo}>Compartir</Text>
            <TouchableOpacity onPress={onCerrar} style={styles.closeButton}>
              <X color="#fff" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Perfil Info */}
            <View style={styles.perfilInfo}>
              <Text style={styles.perfilTexto}>
                Compartiendo como: <Text style={styles.perfilNombre}>{perfilActual?.nombre || 'Usuario'}</Text>
              </Text>
            </View>

            {/* Opciones de compartir */}
            <Text style={styles.seccionTitulo}>Compartir en:</Text>
            <View style={styles.opcionesContainer}>
              {opciones.map((opcion) => {
                const IconoComponente = opcion.icono;
                return (
                  <TouchableOpacity
                    key={opcion.id}
                    style={styles.opcionItem}
                    onPress={() => {
                      opcion.onPress();
                      onCerrar();
                    }}
                  >
                    <View style={[styles.iconoContainer, { backgroundColor: opcion.color }]}>
                      <IconoComponente color="#fff" size={28} />
                    </View>
                    <Text style={styles.opcionTexto}>{opcion.titulo}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Información adicional */}
            <View style={styles.infoAdicional}>
              <Text style={styles.infoTexto}>
                💡 Comparte tu experiencia con Mi Netflix y recomienda películas a tus amigos
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  titulo: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  perfilInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
  },
  perfilTexto: {
    color: '#aaa',
    fontSize: 14,
  },
  perfilNombre: {
    color: '#fff',
    fontWeight: 'bold',
  },
  seccionTitulo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  opcionesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  opcionItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  opcionTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  infoAdicional: {
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#E50914',
  },
  infoTexto: {
    color: '#aaa',
    fontSize: 13,
    lineHeight: 20,
  },
});