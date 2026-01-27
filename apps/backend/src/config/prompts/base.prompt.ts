import { CODE_STANDARDS, SEO_REQUIREMENTS, DESIGN_PHILOSOPHY } from './modules.prompt';

const fmtList = (input: any): string => {
  if (Array.isArray(input)) {
    if (input.length === 0) return "  - Keine spezifischen Anforderungen definiert.";
    return input.map(item => `  - ${String(item)}`).join('\n');
  }
  if (typeof input !== 'string') return `  - ${String(input)}`;
  return `  - ${input.replace(/\n/g, '\n    ')}`;
};

export const GLOBAL_RULES = `
### 🏛️ PSY-NEXUS CORE-CONSTITUTION

I. DIE GOLDENEN CODE-PRINZIPIEN
1. LESBARKEIT: Eindeutige Benennung. Code muss wie eine Geschichte lesbar sein.
2. WARTBARKEIT: Änderungen ohne Systemgefährdung.
3. SIMPEL (KISS): Die einfachste Lösung ist die beste.
4. KEINE WIEDERHOLUNGEN (DRY): Duplikate sind untersagt.

II. DIE UNVERÄNDERLICHEN GESETZE
1. BARRIEREFREIHEIT (A11y): WCAG 2.1 Konformität & Semantisches HTML.
2. SEO-INTEGRITÄT:
${fmtList(SEO_REQUIREMENTS)}

3. TECHNISCHE STANDARDS:
${fmtList(CODE_STANDARDS)}

III. ARCHITEKTUR-PRINZIP
- Priorisiere Benutzer-Intention und saubere Hierarchie.

IV. INFRASTRUKTUR-LIMITS (Hetzner Cloud)
- CPU: 8 vCPU (Priorisiere Multi-Threading).
- RAM: 16 GB (Optimiere Agenten-Concurrency).
- DISK: 80 GB Lokal + 200 GB Volume (Datenbank/Backups auf Volume!).

V. PASSIVES WISSENS-ARCHIV
${fmtList(DESIGN_PHILOSOPHY)}
`.trim();
