import { Platform } from 'react-native';

// Configuración de URLs para diferentes plataformas
const CONFIG = {
  // IP de tu PC en la red local (obtenida con ipconfig)
  PC_IP: '10.136.208.236',
  PORT: '3000',
  
  // URLs base según la plataforma
  getApiBaseUrl: () => {
    // En desarrollo web (PC) usar localhost
    if (Platform.OS === 'web') {
      return 'http://localhost:3000';
    }
    
    // En móvil (iOS/Android) usar la IP real de la PC
    return `http://${CONFIG.PC_IP}:${CONFIG.PORT}`;
  }
};

// Exportar la URL base configurada automáticamente
export const API_BASE_URL = CONFIG.getApiBaseUrl();

// Exportar configuración completa por si se necesita
export default CONFIG;