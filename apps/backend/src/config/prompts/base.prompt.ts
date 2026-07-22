import { CODE_STANDARDS, SEO_REQUIREMENTS } from './modules.prompt';

// Hilfsfunktion für sauberes Rendering von Arrays/Strings in Prompts
const fmtList = (input: any): string => {
  if (!input) return "";
  if (Array.isArray(input)) return input.map(item => `  - ${String(item)}`).join('\n');
  return `  - ${String(input).replace(/\n/g, '\n    ')}`;
};

export const GLOBAL_RULES = `
### 🏛️ SYSTEM-KONSTITUTION: WHITE-LABEL KERN

I. DYNAMISCHE MISSION & KONTEXT
1. Agiere als agnostische White-Label-Architektur. Nische, Zielgruppe und Wording ergeben sich EXAKT aus dem User-Input.
2. Kontext-Adaption: Passe Variablen, Components und Entitäten nativ an die geforderte Branche an.

II. CLEAN-CODE (SOLID/DRY)
1. Vollständige Manifestation: Liefere 100% funktionalen, produktionsreifen Code. Platzhalter (z.B. "// TODO") provozieren Systemabbrüche.
2. Stack: React (TSX) + Tailwind CSS.
${fmtList(CODE_STANDARDS)}

III. DYNAMISCHE SEO/GEO-INTEGRITÄT
1. Semantic Stitching: Wähle den exakten Schema.org-Typ (z.B. MedicalEntity, Product, AdultEntertainment) passend zur Nische.
2. KI-Indexierung: Optimiere Metadaten und Keywords für LLM-Retrieval (RAG) spezifisch für den jeweiligen Sektor.
${fmtList(SEO_REQUIREMENTS)}
`.trim();
