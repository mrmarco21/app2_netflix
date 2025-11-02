import { Platform } from 'react-native';

// Configuración de URLs para diferentes plataformas
const CONFIG = {
  // IP de tu PC en la red local (obtenida con ipconfig)
  PC_IP: '192.168.18.24',
  PORT: '3000',
  
  // URLs base según la plataforma
  getApiBaseUrl: () => {
    // Si hay variable de entorno de Expo, usarla (ideal para dispositivos)
    if (process.env.EXPO_PUBLIC_API_URL) {
      return process.env.EXPO_PUBLIC_API_URL;
    }

    // En desarrollo web (PC) usar localhost
    if (Platform.OS === 'web') {
      return `http://localhost:${CONFIG.PORT}`;
    }
    
    // En móvil (iOS/Android) usar la IP real de la PC como fallback
    return `http://${CONFIG.PC_IP}:${CONFIG.PORT}`;
  }
};

// Exportar la URL base configurada automáticamente
export const API_BASE_URL = CONFIG.getApiBaseUrl();

// Exportar configuración completa por si se necesita
export default CONFIG;