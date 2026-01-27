// globalUserRules.ts

import { AgentName } from '../types/AgentTypes'; // Importiere AgentName

// Definition der Typen
interface GlobalUserRuleContext {
  agent: AgentName; // Verwende den importierten AgentName-Typ
  input: string;
  userId?: string;
  sessionData?: any;
}

interface GlobalUserRule {
  id: string;
  condition: (context: GlobalUserRuleContext) => Promise<boolean>;
  action: (context: GlobalUserRuleContext) => Promise<void>;
  priority: number;
  enabled: boolean;
  metadata?: { // Optionaler Typ für Metadaten
    limit?: number;
    windowMs?: number;
  };
  meta?: { // Optionaler Typ für zusätzliche Meta-Informationen
    words?: string[];
  };
}

class GlobalUserRulesStore {
  private rules: GlobalUserRule[] = [];

  async evaluate(context: GlobalUserRuleContext): Promise<{ allowed: boolean; modifiedInput?: string }> {
    // Sortiere Regeln nach Priorität (höchste zuerst)
    const sortedRules = [...this.rules].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      if (!rule.enabled) continue;

      const matches = await rule.condition(context);
      if (matches) {
        await rule.action(context);
        // Beispiel: Eine Regel könnte die Eingabe modifizieren
        // Hier ist nur ein Platzhalter, falls benötigt
        // return { allowed: true, modifiedInput: "..." };
        return { allowed: false }; // Beispiel: Regel blockiert
      }
    }

    // Wenn keine Regel greift, ist die Anfrage erlaubt
    return { allowed: true };
  }

  addRule(rule: GlobalUserRule) {
    this.rules.push(rule);
  }
}

// Beispielregel
const exampleRule: GlobalUserRule = {
  id: 'forbidden-words-check',
  condition: async (ctx: GlobalUserRuleContext) => {
    const forbiddenWords = ['spam', 'bot'];
    return forbiddenWords.some(word => ctx.input.toLowerCase().includes(word));
  },
  action: async (ctx: GlobalUserRuleContext) => {
    console.log(`Blocked request from agent ${ctx.agent} due to forbidden words.`);
  },
  priority: 100,
  enabled: true,
  metadata: { limit: 10, windowMs: 60000 }, // Beispiel-Metadaten
  meta: { words: ['spam', 'bot'] } // Beispiel-Meta-Informationen
};

// Erstelle eine Instanz und füge die Beispielregel hinzu
const globalUserRulesStore = new GlobalUserRulesStore();
globalUserRulesStore.addRule(exampleRule);

// Füge eine weitere Beispielregel hinzu, die 'ORION' vergleicht
// Dafür müssen wir 'ORION' als gültigen Agenten-Namen behandeln
// oder den Vergleich anpassen. Wenn 'ORION' KEIN gültiger AgentName ist,
// dann muss die Regel entweder angepasst werden oder 'ORION' muss zu AgentName hinzugefügt werden.
// Da Orion ein Orchestrator ist, ist es wahrscheinlich besser, den Vergleich zu ändern.
// Lass uns annehmen, dass ein Agent mit Namen 'OrionAgent' existiert.
// Dann lautet der Vergleich: ctx.agent === 'OrionAgent'
const testOrionRule: GlobalUserRule = {
  id: 'test-orion-agent',
  condition: async (ctx: GlobalUserRuleContext) => ctx.agent === 'OrionAgent' && ctx.input.trim().toUpperCase().startsWith('TEST'), // Korrigiert: 'ORION' -> 'OrionAgent'
  action: async (ctx: GlobalUserRuleContext) => {
    console.log('Test command received for OrionAgent.');
  },
  priority: 50,
  enabled: true,
  metadata: { limit: 1, windowMs: 10000 },
};

globalUserRulesStore.addRule(testOrionRule);

export { globalUserRulesStore, GlobalUserRulesStore }; // Exportiere die Instanz und den Konstruktor
