import { injectable, inject } from 'tsyringe';
import { z } from 'zod';
import { Logger } from "../types/Logger";
import { AgentExecutor, AgentInput, AgentResult } from "../types/AgentExecutor";
import { GeometryTool } from '../tools/GeometryTool';
import { AgentName } from "../types/AgentTypes";
import * as fs from 'fs/promises';
import * as path from 'path';

const DOC_ANALYSIS_SCHEMA = z.object({
  analysis: z.object({
    primaryDomain: z.string(),
    entities: z.array(z.string()),
    seoElements: z.object({
      headings: z.record(z.string(), z.array(z.string())),
      missingCritical: z.array(z.string())
    }),
    potentialIntent: z.string(),
    targetAudienceClues: z.array(z.string())
  }),
  recommendations: z.object({
    jsonLdProposal: z.string(),
    structuralSuggestions: z.array(z.string())
  })
});

interface ProjectManifest {
  projectName: string;
  globalStyle: { theme: string; colors: string[]; fonts: string[] };
  pages: Array<{ name: string; url: string; status: string }>;
  lastMilestone: string;
  updatedAt: string;
}

@injectable()
export class OrionOrchestrator {
  private currentManifest: ProjectManifest | null = null;
  private readonly VOLUME_BASE = '/mnt/HC_Volume_103847079/psy-nexus-library';
  private readonly MANIFEST_PATH = path.join(this.VOLUME_BASE, 'manifests/psy-nexus-main.json');

  constructor(
    @inject('Logger') private logger: Logger,
    @inject('AgentExecutor') private agentExecutor: AgentExecutor,
    private geometryTool: GeometryTool
  ) {}

  // --- NEU: Manifest-Logik ---
  public async initialize(): Promise<void> {
    this.logger.info('OrionOrchestrator', 'initialize', 'Starte Initialisierung...');
    await this.ensureVolumePaths();
    try {
      await this.loadManifestFromVolume();
      this.logger.info('OrionOrchestrator', 'init', '✅ Manifest erfolgreich geladen.');
    } catch (err) {
      this.logger.warn('OrionOrchestrator', 'init', 'Kein vorhandenes Manifest gefunden, erstelle Default-Manifest.', err);
      this.currentManifest = this.getDefaultManifest();
    }
  }

  private async ensureVolumePaths() {
    const dirs = [
      path.dirname(this.MANIFEST_PATH),
      path.join(this.VOLUME_BASE, 'code-snapshots')
    ];
    for (const d of dirs) {
      await fs.mkdir(d, { recursive: true });
    }
  }

  private validateManifest(m: any): m is ProjectManifest {
    return m && typeof m.projectName === 'string' && Array.isArray(m.pages);
  }

  private async loadManifestFromVolume() {
    try {
      const data = await fs.readFile(this.MANIFEST_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (this.validateManifest(parsed)) {
        this.currentManifest = parsed;
      } else {
        throw new Error('Ungültiges Manifest Format');
      }
    } catch (e: any) {
      if (e.code !== 'ENOENT') this.logger.error('OrionOrchestrator', 'loadManifest', 'Fehler beim Laden des Manifests', e);
      throw e; // Propagiere den Fehler, damit initialize weiß, dass es fehlgeschlagen ist.
    }
  }

  private async saveToVolume(manifest: ProjectManifest) {
    manifest.updatedAt = new Date().toISOString();
    await fs.writeFile(this.MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    this.currentManifest = manifest;
  }

  private getDefaultManifest(): ProjectManifest {
    return {
      projectName: "Psy-Nexus",
      globalStyle: { theme: "Klarheit & Fokus", colors: [], fonts: [] },
      pages: [],
      lastMilestone: "Initialisierung",
      updatedAt: new Date().toISOString()
    };
  }

  public getCurrentManifest(): ProjectManifest {
    if (!this.currentManifest) {
      this.logger.warn('OrionOrchestrator', 'getCurrentManifest', 'Kein Manifest geladen, verwende Fallback.');
      this.currentManifest = this.getDefaultManifest();
    }
    return this.currentManifest;
  }
  // --- ENDE NEU ---

  private validateAgentOutput<T>(output: string, schema: z.ZodSchema<T>): T {
    try {
      let rawJson = output;
      let parsedJson;

      const markdownMatch = output.match(/```json\s*\n([\s\S]*?)\n\s*```/);
      if (markdownMatch && markdownMatch[1]) {
        rawJson = markdownMatch[1].trim();
      } else {
        const generalMatch = output.match(/\{[\s\S]*\}/);
        if (generalMatch) {
          rawJson = generalMatch[0].trim();
        }
      }

      try {
        parsedJson = JSON.parse(rawJson);
      } catch (parseError: any) {
        this.logger.error("OrionOrchestrator", "validate", `JSON Parse Fehler: ${parseError.message} bei: ${rawJson.substring(0, 50)}...`);
        throw new Error(`Agent-Output Strukturfehler: Ungültiges JSON.`);
      }

      return schema.parse(parsedJson);
        return schema.parse(JSON.parse(rawJson));
      return schema.parse(JSON.parse(rawJson));
    } catch (error: any) {
      this.logger.error('OrionOrchestrator', 'validate', `Validierung fehlgeschlagen: ${error.message}`);
      throw new Error(`Agent-Output Strukturfehler: ${error.message}`);
    }
  }

  public async processRequestStreaming(request: any, onChunk: (chunk: string) => void): Promise<AgentResult> {
    const input = request.input.toLowerCase();

    // 1. DOKUMENTATIONS-PHASE (Validiert)
    if (request.agent === "DokumentationAgent" || request.agent === "DOKUMENTATION_AGENT") {
      onChunk("\n[ORION]: Starte Markt-Analyse...\n");
      const docResult = await this.agentExecutor.execute(request.agent, { query: request.input });
      const extractedData = this.validateAgentOutput(docResult.output, DOC_ANALYSIS_SCHEMA);

      onChunk("\n[ORION]: Analyse erfolgreich validiert. Synthese läuft...\n");
      const orionInput = {
        query: `SYNTHESE: Basierend auf ${JSON.stringify(extractedData)}, plane die Architektur.`,
        context: { ...request.sessionData, docAnalysis: extractedData }
      };
      return await this.agentExecutor.execute("OrionAgent", orionInput);
    }

    // 2. ORION CHECKPOINT (Der rote Knopf)
    if (request.agent === "OrionAgent") {
      const result = await this.agentExecutor.execute("OrionAgent", { query: request.input, context: request.sessionData });

      if (result.output.includes("MISSION_KLAR")) {
        const approved = ["starten", "go", "bestätigt"].some(k => input.includes(k));
        if (!approved) {
          onChunk(result.output);
          onChunk("\n\n[SYSTEM]: Strategie bereit. Schreibe 'Starten', um die Roadmap zu aktivieren.\n");
          return { output: "Warten auf User-Go.", success: true, agentName: "Orion" as any };
        }
        onChunk("\n[SYSTEM]: Freigabe erhalten. Übergebe an Plan-Agent...\n");
        // Füge das aktuelle Manifest als Kontext hinzu, falls der PlanAgent es benötigt
        const planInput = {
          query: "ERSTELLE ROADMAP",
          context: { ...request.sessionData, manifest: this.getCurrentManifest() }
        };
        return await this.agentExecutor.execute("PlanAgent", planInput);
      }

      onChunk(result.output);
      return result;
    }

    // 3. PLAN AGENT (kann das Manifest abrufen)
    if (request.agent === "PlanAgent") {
      // Stelle sicher, dass das Manifest verfügbar ist
      const manifest = this.getCurrentManifest();
      const planInput = {
        query: request.input,
        context: { ...request.sessionData, manifest }
      };
      const result = await this.agentExecutor.execute("PlanAgent", planInput);
      onChunk(result.output);
      return result;
    }

    // Standard-Verhalten
    return await this.agentExecutor.execute(request.agent, { query: request.input, context: request.sessionData });
  }
}
