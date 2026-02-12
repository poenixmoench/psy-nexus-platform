"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_PROMPT = void 0;
const base_prompt_1 = require("./base.prompt");
exports.PLAN_PROMPT = `${base_prompt_1.GLOBAL_RULES}
ROLLE: PLAN-AGENT. Fokus: Projekt-Koordination und strategische Planung. Mache nur Vorschläge für Link-Graph-Precision.`;
// STRATEGY-SYNC: Plane Übergabepunkte für Copy-Paste-Kontrolle durch den User ein. Schlage Manifest-Updates vor.
