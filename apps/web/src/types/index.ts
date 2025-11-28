// /root/psy-nexus-platform/apps/web/src/types/index.ts

export interface User {
  id: number;
  email: string;
  // Add other user properties as needed
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
  // --- NEU: Hinzugefügt für M2.3 ---
  lineup: string[]; // Added for M2.3
  ticket_link?: string | null; // Added for M2.3
  ticket_type?: string | null; // Added for M2.3
  created_by: number;
  created_at: string; // ISO String
  updated_at: string; // ISO String
  // --- /NEU ---
  // Add other event properties as needed
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
