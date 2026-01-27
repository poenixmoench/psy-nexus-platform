import { AgentName } from './AgentTypes';

export interface AgentInput {
  query: string;
  parameters?: Record<string, any>;
  context?: any; // Kann frühere Ergebnisse enthalten
}

export interface AgentResult {
  output: string;      // Die vom Agenten generierte Ausgabe
  success: boolean;    // Gibt an, ob die Ausführung erfolgreich war
  error?: string;      // Eine optionale Fehlermeldung, falls success false ist
  agentName: AgentName; // Der Name des Agenten, der das Ergebnis liefert
  meta?: {             // Optionale Metadaten zum Ergebnis
    [key: string]: any; // Weitere beliebige Metadaten
  };
}

export interface AgentExecutor {
  execute(agentName: AgentName, input: AgentInput): Promise<AgentResult>;
}
