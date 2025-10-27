import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default function InfoPelicula({ titulo, año, duracion, clasificacion, ranking }) {
  return (
    <View style={styles.container}>
      {/* Ranking si existe */}
      {ranking && (
        <View style={styles.rankingContainer}>
          <View style={styles.topBadge}>
            <Text style={styles.topText}>TOP</Text>
            <Text style={styles.topNumber}>10</Text>
          </View>
          <Text style={styles.rankingText}>{ranking}</Text>
        </View>
      )}
      
      {/* Título de la película */}
      <Text style={styles.titulo}>{titulo}</Text>
      
      {/* Información adicional */}
      <View style={styles.infoRow}>
        <Text style={styles.año}>{año}</Text>
        <View style={styles.separator} />
        <View style={styles.clasificacionBadge}>
          <Text style={styles.clasificacionText}>{clasificacion}</Text>
        </View>
        <View style={styles.separator} />
        <Text style={styles.duracion}>{duracion}</Text>
        <View style={styles.separator} />
        <View style={styles.hdBadge}>
          <Text style={styles.hdText}>HDR</Text>
        </View>
        <View style={styles.audioBadge}>
          <Text style={styles.audioText}>🎧</Text>
          <Text style={styles.audioLabel}>Audio espacial</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000',
  },
  rankingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  topBadge: {
    backgroundColor: '#E50914',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
  },
  topText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  topNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rankingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  titulo: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  año: {
    color: '#999',
    fontSize: 14,
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
    marginHorizontal: 8,
  },
  clasificacionBadge: {
    borderWidth: 1,
    borderColor: '#999',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  clasificacionText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  duracion: {
    color: '#999',
    fontSize: 14,
  },
  hdBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  hdText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  audioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  audioText: {
    fontSize: 14,
    marginRight: 4,
  },
  audioLabel: {
    color: '#999',
    fontSize: 12,
  },
});