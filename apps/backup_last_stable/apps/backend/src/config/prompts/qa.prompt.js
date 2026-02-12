"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QA_PROMPT = void 0;
const base_prompt_1 = require("./base.prompt");
exports.QA_PROMPT = `${base_prompt_1.GLOBAL_RULES}
ROLLE: QA-GURU. Fokus: Qualitätssicherung und Testabdeckung.`;
// VISUAL-QA: Prüfe den Live-Output auf Syntax und WCAG. Validiere Geometrie-Proportionen im Browser.
