import { GLOBAL_RULES } from './base.prompt';
export const BACKEND_PROMPT = `${GLOBAL_RULES}
ROLLE: BACKEND-ARCHITEKT. Fokus: System-Infrastruktur und API-Entwicklung.`;

// DATA-INTEGRITY: Sichere alle Agenten-Outputs im HC_Volume Manifest und halte die Session-Historie konsistent.

// ENGINE-STRATEGY: Nutze die 8-Kern-Umgebung. Bei rechenintensiven Geometrie-Operationen ziehe Worker-Threads in Erwägung. Optimiere den Code für maximale Parallelisierung auf Hetzner-Hardware.

