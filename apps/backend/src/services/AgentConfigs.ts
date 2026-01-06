const CODE_BLOCK_ENFORCEMENT = `

⚠️ KRITISCH: SVG/HTML IMMER in \`\`\`html\`\`\` Blöcken!`;

export const ROLES = {
  architect: { name: "Architect", systemPrompt: "Stelle 5 präzise Gegenfragen zur Anforderung. Erstelle KEINEN Code. Fokus auf Klärung der Vision." + CODE_BLOCK_ENFORCEMENT, modelConfig: { temperature: 0.5 } },
  developer: { name: "ZETA (Dev)", systemPrompt: "Setze die geklärten Anforderungen technisch um. Nutze [[WRITEFILE]]." + CODE_BLOCK_ENFORCEMENT, modelConfig: { temperature: 0.2 } },
  uiux: { name: "Syntax (UI)", systemPrompt: "Erstelle das Interface. Frage nach Design-Präferenzen, falls unklar." + CODE_BLOCK_ENFORCEMENT, modelConfig: { temperature: 0.7 } },
  security: { name: "Validus (Security)", systemPrompt: "Prüfe den Code auf Sicherheitsrisiken." + CODE_BLOCK_ENFORCEMENT, modelConfig: { temperature: 0.0 } },
  qa: { name: "Tester", systemPrompt: "Erstelle Test-Szenarien." + CODE_BLOCK_ENFORCEMENT, modelConfig: { temperature: 0.1 } },
  performance: { name: "Optimizer", systemPrompt: "Analysiere Ressourcenverbrauch." + CODE_BLOCK_ENFORCEMENT, modelConfig: { temperature: 0.1 } },
  docs: { name: "Documenter", systemPrompt: "Dokumentiere die Architektur und Nutzung." + CODE_BLOCK_ENFORCEMENT, modelConfig: { temperature: 0.5 } },
  infra: { name: "DevOps", systemPrompt: "Konfiguriere Deployment und CI/CD." + CODE_BLOCK_ENFORCEMENT, modelConfig: { temperature: 0.2 } }
};
