import React, { useCallback, useEffect } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Dimensions, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const extractVideoId = (url) => {
  try {
    if (!url) return null;

    // Soportar youtu.be/<id>
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split(/[?&]/)[0];
    }

    // Cualquier URL con parámetro v= (youtube.com, piped.video, yewtu.be, etc.)
    if (url.includes('/watch')) {
      const u = new URL(url);
      const v = u.searchParams.get('v');
      if (v) return v;
    }

    // URLs embed
    if (url.includes('/embed/')) {
      return url.split('embed/')[1]?.split(/[?&]/)[0];
    }

    // URLs shorts
    if (url.includes('/shorts/')) {
      return url.split('/shorts/')[1]?.split(/[?&]/)[0];
    }

    // Último recurso: intentar capturar un ID con regex (11 chars)
    const m = url.match(/[a-zA-Z0-9_-]{11}(?=$|[?&])/);
    if (m) return m[0];
  } catch {}
  return null;
};

export default function ReproductorYouTube({ visible, onClose, url, titulo = 'Reproducción' }) {
  const videoId = extractVideoId(url);

  useEffect(() => {
    const lockLandscape = async () => {
      try { await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT); } catch {}
    };
    const restorePortrait = async () => {
      try { await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP); } catch {}
    };
    if (visible) lockLandscape();
    return () => { restorePortrait(); };
  }, [visible]);

  const onReady = useCallback(() => {
    // Nada especial; el componente maneja autoplay con mute
  }, []);

  // Este componente es solo para móviles. En web no renderiza nada.
  if (Platform.OS === 'web' || !visible || !videoId) return null;

  // Importar la librería sólo en móvil para evitar errores de bundling web
  const YoutubePlayer = require('react-native-youtube-iframe').default;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} supportedOrientations={['landscape-left','landscape-right','portrait']}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>

        {/* Botón textual de salir para mayor claridad */}
        <TouchableOpacity style={styles.exitButton} onPress={onClose}>
          <Ionicons name="exit-outline" size={18} color="#fff" />
          <Text style={styles.exitText}>Salir</Text>
        </TouchableOpacity>

        <View style={styles.titleBar}>
          <Text style={styles.title} numberOfLines={1}>{titulo}</Text>
        </View>

        <YoutubePlayer
          height={Math.min(screenWidth, screenHeight)}
          width={Math.max(screenWidth, screenHeight)}
          videoId={videoId}
          play={true}
          mute={true}
          forceAndroidAutoplay
          onReady={onReady}
          
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Math.max(screenWidth, screenHeight),
    height: Math.min(screenWidth, screenHeight),
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
  },
  exitButton: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
  },
  exitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  titleBar: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 300,
  },
});