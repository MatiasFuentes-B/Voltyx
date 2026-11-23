import { Platform } from 'react-native';

const API_PORT = '3000'; 
const LAN_IP = '192.168.1.47'; 

export const API_BASE_URL = Platform.select({
  android: `http://10.0.2.2:${API_PORT}`,
  ios: `http://${LAN_IP}:${API_PORT}`,
  default: `http://${LAN_IP}:${API_PORT}`,
});