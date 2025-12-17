# 🎨 AgentDevStudio - Vollständige Spezifikation

## Design: PSYCHEDELIC BLACK & LIME

### Farben
- Hintergrund: #000000 (Schwarz)
- Text: #FFFFFF (Weiß)
- Akzent: #32CD32 (Limettengrün)
- Optional: Orange, Gelb, Rosa, Blau (nur Chat)

### Layout
- **Linke Seite:** Psychedelischer Chat (Mandala, Regenbogen-Gradient)
- **Rechte Seite:** Black Live Preview (iFrame)
- Trenner: Dünne Linie in Limettengrün

### Schriftart
- Ubuntu Mono überall
- Keine Emojis
- Deutsch

---

## 7 Agenten mit ORION Gatekeeper

| Agent | Rolle | Funktion |
|-------|-------|----------|
| **ORION** | Gatekeeper | Vermittelt zwischen dir und anderen Agenten |
| **NEXUS-PRIME** | Backend Architekt | API & Infrastruktur |
| **AURA** | Design Master | Design System |
| **SYNTAX** | Component Builder | Vue/React Komponenten |
| **VALIDUS** | QA Auditor | Code Review & Testing |
| **MIRROR** | Preview Renderer | Live Preview & Rendering |
| **INFRA** | Infrastructure | Config & Deployment |

---

## Workflow (Manuell, Sequenziell)

1. Du gibst ORION eine Aufgabe
2. ORION beauftragt einen anderen Agenten
3. Agent führt Aufgabe aus und sendet Ergebnis an ORION
4. ORION zeigt dir Ergebnis
5. Du bestätigst/entscheidest (manuell)
6. Nächster Schritt oder neuer Agent

---

## UI-Elemente

### Buttons (alle mit Limettengrün-Glow on Hover)
- [SENDEN] - Nachricht senden
- [KOPIEREN] - Code kopieren
- [AGENTEN] - Agent auswählen
- [LÖSCHEN] - Chat löschen
- [HILFE] - Hilfe anzeigen

### Status-Indikatoren
- [OK] - Erfolgreich
- [E] - Fehler
- [COPY] - Kopiert
- [EXPORT] - Export
- [RUN] - Läuft
- [PAUSE] - Pausiert
- [USER_INPUT] - Wartet auf Eingabe

---

## Accessibility
- aria-labels auf allen Elementen
- @media (prefers-reduced-motion) Support
- Keyboard Navigation
- Focus Indicators

