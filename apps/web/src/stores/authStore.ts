import { defineStore } from 'pinia';
import apiClient from '@/plugins/axios'; // Import des Axios-Clients
import type { User } from '@/types'; // Import des User-Typs

// Definiere die Typen für die API-Antworten, falls nicht bereits in types/index.ts
interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  token: string;
  user: User;
}

// Definiere die Typen für die Anmeldedaten, falls nicht bereits in types/index.ts
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null as string | null,
    user: JSON.parse(localStorage.getItem('user') || 'null') as User | null,
    isAuthenticated: !!localStorage.getItem('token'),
  }),
  actions: {
    async login(credentials: LoginCredentials) {
      try {
        // Annahme: Dein Backend hat einen Endpunkt /auth/login
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
        this.token = response.data.token;
        this.user = response.data.user;
        this.isAuthenticated = true;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch (error: any) {
        console.error('Login failed:', error);
        // Optional: Fehler weiterverarbeiten, z.B. übergeben an die View
        throw error;
      }
    },
    async register(userData: RegisterData) {
      try {
        // Annahme: Dein Backend hat einen Endpunkt /auth/register
        const response = await apiClient.post<RegisterResponse>('/auth/register', userData);
        this.token = response.data.token;
        this.user = response.data.user;
        this.isAuthenticated = true;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch (error: any) {
        console.error('Registration failed:', error);
        // Optional: Fehler weiterverarbeiten
        throw error;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
