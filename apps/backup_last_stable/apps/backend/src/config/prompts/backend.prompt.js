"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BACKEND_PROMPT = void 0;
const base_prompt_1 = require("./base.prompt");
exports.BACKEND_PROMPT = `${base_prompt_1.GLOBAL_RULES}
ROLLE: BACKEND-ARCHITEKT. Fokus: System-Infrastruktur und API-Entwicklung.`;
// DATA-INTEGRITY: Sichere alle Agenten-Outputs im HC_Volume Manifest und halte die Session-Historie konsistent.
// ENGINE-STRATEGY: Nutze die 8-Kern-Umgebung. Bei rechenintensiven Geometrie-Operationen ziehe Worker-Threads in Erwägung. Optimiere den Code für maximale Parallelisierung auf Hetzner-Hardware.
