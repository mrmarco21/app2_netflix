import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function VideoPlayer({ imagen, onPlay }) {
  return (
    <View style={styles.container}>
      <Image 
        source={{ 
          uri: imagen || 'https://via.placeholder.com/800x450/333333/FFFFFF?text=Sin+Video'
        }} 
        style={styles.videoThumbnail}
        onError={() => {
          console.log('Error cargando imagen del video:', imagen);
        }}
      />
      
      {/* Overlay con botón de play */}
      <View style={styles.overlay}>
        <TouchableOpacity onPress={onPlay} style={styles.playButton}>
          <Ionicons name="play" size={40} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Gradiente inferior para transición suave */}
      <View style={styles.gradientBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: width * 0.56, // Aspect ratio 16:9
    position: 'relative',
    backgroundColor: '#000',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});