import axios from 'axios';
import { useAuthStore } from '@/stores/authStore'; // Importiere den Auth-Store

// Erstelle die zentrale Axios-Instanz
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001', // Nutze die Umgebungsvariable oder einen Default
});

// Füge einen Request-Interceptor hinzu, um das JWT-Token hinzuzufügen
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response-Interceptor für Fehlerbehandlung hinzufügen
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // z.B. zum Logout-Flow umleiten
//       const authStore = useAuthStore();
//       authStore.logout();
//       // Router-Weiterleitung könnte hier erfolgen, z.B.:
//       // router.push('/login');
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;
