import React, { useEffect, useRef } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, StatusBar, Dimensions, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ReproductorWeb({ visible, onClose, url, titulo = 'Reproducción' }) {
  const webRef = useRef(null);

  useEffect(() => {
    const lockLandscape = async () => {
      try {
        if (Platform.OS !== 'web') {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
          StatusBar.setHidden(true);
        }
      } catch {}
    };
    const restorePortrait = async () => {
      try {
        if (Platform.OS !== 'web') {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
          StatusBar.setHidden(false);
        }
      } catch {}
    };

    if (visible) lockLandscape();
    return () => { restorePortrait(); };
  }, [visible]);

  const autoplayScript = `
    (function() {
      try {
        // Intentar reproducir el primer video encontrado
        var v = document.querySelector('video');
        if (v) {
          v.muted = true; // muchos navegadores exigen mute para autoplay
          var playPromise = v.play();
          if (playPromise) { playPromise.catch(function(){ /* ignore */ }); }
        }
        // Intentar hacer click en botones comunes de reproducción
        var btn = document.querySelector('button');
        if (btn && btn.innerText && btn.innerText.toLowerCase().includes('play')) { btn.click(); }
      } catch (e) { /* noop */ }
      true;
    })();
  `;

  if (!visible) return null;

  const toEmbedUrl = (input) => {
    try {
      if (!input) return input;
      // Convertir cualquier URL con parámetro v= a embed, sin importar el host
      if (input.includes('/watch')) {
        const u = new URL(input);
        const id = u.searchParams.get('v');
        if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
      }
      // URLs youtu.be/<id>
      if (input.includes('youtu.be/')) {
        const id = input.split('youtu.be/')[1]?.split(/[?&]/)[0];
        if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
      }
      // URLs shorts
      if (input.includes('/shorts/')) {
        const id = input.split('/shorts/')[1]?.split(/[?&]/)[0];
        if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
      }
      return input;
    } catch { return input; }
  };

  const finalUrl = toEmbedUrl(url);

  const containerStyle = Platform.OS === 'web' ? styles.containerWeb : styles.container;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} supportedOrientations={['landscape-left','landscape-right','portrait']}>
      <View style={containerStyle}>
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

        {Platform.OS === 'web' ? (
          <iframe
            title={titulo}
            src={finalUrl}
            style={{ border: 'none', width: '100%', height: '100%', backgroundColor: '#000' }}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
          />
        ) : (
          <WebView
            ref={webRef}
            source={{ uri: finalUrl }}
            style={styles.webview}
            allowsInlineMediaPlayback
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
            mediaPlaybackRequiresUserAction={false}
            userAgent={
              // Forzar UA móvil para evitar mensajes de "abrir en app"
              'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
            }
            onLoadEnd={() => {
              // Intento de autoplay una vez cargada la página
              try { webRef.current?.injectJavaScript(autoplayScript); } catch {}
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Math.max(screenWidth, screenHeight),
    height: Math.min(screenWidth, screenHeight),
    backgroundColor: '#000',
  },
  // En web, llenar toda la ventana para evitar áreas en blanco y mantener buen encaje
  containerWeb: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
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
});