// src/types/index.ts

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

// WICHTIG: Vollständiges Event-Interface wie im Prompt definiert
export interface Event {
  id: number;
  name: string;
  description: string;
  start_date: string; // Typ string wie gefordert
  end_date: string;   // Typ string wie gefordert
  location: string;
  genres: string[];
}
