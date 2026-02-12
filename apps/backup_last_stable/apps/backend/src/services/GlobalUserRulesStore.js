"use strict";
// globalUserRules.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalUserRulesStore = exports.globalUserRulesStore = void 0;
class GlobalUserRulesStore {
    constructor() {
        this.rules = [];
    }
    async evaluate(context) {
        // Sortiere Regeln nach Priorität (höchste zuerst)
        const sortedRules = [...this.rules].sort((a, b) => b.priority - a.priority);
        for (const rule of sortedRules) {
            if (!rule.enabled)
                continue;
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
    addRule(rule) {
        this.rules.push(rule);
    }
}
exports.GlobalUserRulesStore = GlobalUserRulesStore;
// Beispielregel
const exampleRule = {
    id: 'forbidden-words-check',
    condition: async (ctx) => {
        const forbiddenWords = ['spam', 'bot'];
        return forbiddenWords.some(word => ctx.input.toLowerCase().includes(word));
    },
    action: async (ctx) => {
        console.log(`Blocked request from agent ${ctx.agent} due to forbidden words.`);
    },
    priority: 100,
    enabled: true,
    metadata: { limit: 10, windowMs: 60000 }, // Beispiel-Metadaten
    meta: { words: ['spam', 'bot'] } // Beispiel-Meta-Informationen
};
// Erstelle eine Instanz und füge die Beispielregel hinzu
const globalUserRulesStore = new GlobalUserRulesStore();
exports.globalUserRulesStore = globalUserRulesStore;
globalUserRulesStore.addRule(exampleRule);
// Füge eine weitere Beispielregel hinzu, die 'ORION' vergleicht
// Dafür müssen wir 'ORION' als gültigen Agenten-Namen behandeln
// oder den Vergleich anpassen. Wenn 'ORION' KEIN gültiger AgentName ist,
// dann muss die Regel entweder angepasst werden oder 'ORION' muss zu AgentName hinzugefügt werden.
// Da Orion ein Orchestrator ist, ist es wahrscheinlich besser, den Vergleich zu ändern.
// Lass uns annehmen, dass ein Agent mit Namen 'OrionAgent' existiert.
// Dann lautet der Vergleich: ctx.agent === 'OrionAgent'
const testOrionRule = {
    id: 'test-orion-agent',
    condition: async (ctx) => ctx.agent === 'OrionAgent' && ctx.input.trim().toUpperCase().startsWith('TEST'), // Korrigiert: 'ORION' -> 'OrionAgent'
    action: async (ctx) => {
        console.log('Test command received for OrionAgent.');
    },
    priority: 50,
    enabled: true,
    metadata: { limit: 1, windowMs: 10000 },
};
globalUserRulesStore.addRule(testOrionRule);
