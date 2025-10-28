import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HeaderDetalle({ onGoBack, onDownload, onSearch }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onGoBack} style={styles.iconButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      <View style={styles.rightIcons}>
        <TouchableOpacity onPress={onDownload} style={styles.iconButton}>
          <Ionicons name="download-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSearch} style={styles.iconButton}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  iconButton: {
    padding: 8,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});